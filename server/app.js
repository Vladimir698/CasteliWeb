const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const compression = require('compression');
const crypto = require('crypto');
const path = require('path');
const http = require('http');
const expressLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const { Server } = require('socket.io');

require('dotenv').config();

const db = require('./src/models');

const app = express();
const server = http.createServer(app);
const isProduction = process.env.NODE_ENV === 'production';

const io = new Server(server, {
  cors: { origin: false }
});

app.set('io', io);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(express.urlencoded({ extended: true, limit: '4mb' }));
app.use(express.json({ limit: '4mb' }));

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET debe estar configurada');
}
if (isProduction && process.env.SESSION_SECRET.length < 32) {
  throw new Error('En producción SESSION_SECRET debe tener al menos 32 caracteres');
}

const sessionStoreOptions = {
  tableName: 'user_sessions',
  createTableIfMissing: true
};

if (process.env.DATABASE_URL) {
  sessionStoreOptions.conString = process.env.DATABASE_URL;
} else {
  sessionStoreOptions.conObject = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
  };
}

app.use(
  session({
    name: 'casteli.sid',
    store: new pgSession(sessionStoreOptions),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

// Token CSRF por sesión. Protege todos los cambios de estado sin depender
// de Origin/Host, por lo que funciona igual en localhost y detrás del proxy de Railway.
app.use((req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  res.locals.csrfToken = req.session.csrfToken;

  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  const recibido = String(req.body?._csrf || req.get('x-csrf-token') || '');
  const esperado = String(req.session.csrfToken || '');

  if (!recibido || !esperado) {
    return res.status(403).send('Solicitud no válida. Recargue la página e inténtelo nuevamente.');
  }

  const a = Buffer.from(recibido);
  const b = Buffer.from(esperado);

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(403).send('Solicitud no válida. Recargue la página e inténtelo nuevamente.');
  }

  return next();
});

app.use(express.static(path.join(__dirname, '..', 'public'), {
  maxAge: isProduction ? '1d' : 0,
  etag: true
}));

app.use((req, res, next) => {
  const usuario = req.session.usuario || null;
  const rol = usuario?.rol?.trim().toLowerCase() || '';

  res.locals.usuario = usuario;
  res.locals.rolUsuario = rol;
  res.locals.rutaActual = req.path;
  res.locals.esAdmin = rol === 'administrador';
  res.locals.esMecanico = rol === 'mecanico';

  next();
});

app.get('/health', async (req, res) => {
  try {
    await db.sequelize.authenticate();
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

const {
  requiereLogin,
  soloAdmin
} = require('./src/middleware/authMiddleware');

const authRoutes = require('./src/routes/authRoutes');
const usuariosRoutes = require('./src/routes/usuariosRoutes');
const clienteRoutes = require('./src/routes/clienteRoutes');
const vehiculoRoutes = require('./src/routes/vehiculoRoutes');
const ordenRoutes = require('./src/routes/ordenRoutes');
const facturacionRoutes = require('./src/routes/facturacionRoutes');

app.use('/', authRoutes);
app.get('/', (req, res) => res.redirect(req.session?.usuario ? '/home' : '/login'));
app.get('/home', requiereLogin, (req, res) => res.render('index'));

app.use('/usuarios', requiereLogin, soloAdmin, usuariosRoutes);
app.use('/clientes', clienteRoutes);
app.use('/vehiculos', vehiculoRoutes);
app.use('/ordenes', ordenRoutes);
app.use('/facturacion-quincenal', facturacionRoutes);

io.on('connection', socket => {
  socket.on('unirseOrden', ordenId => {
    if (ordenId) socket.join(`orden-${ordenId}`);
  });

  socket.on('salirOrden', ordenId => {
    if (ordenId) socket.leave(`orden-${ordenId}`);
  });
});

app.use((req, res) => {
  res.status(404).send('Página no encontrada.');
});

app.use((error, req, res, next) => {
  console.error('Error no controlado:', error);
  if (res.headersSent) return next(error);
  return res.status(500).send('Ocurrió un error interno.');
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
