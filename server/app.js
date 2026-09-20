const express = require('express');
const session = require('express-session');
const path = require('path');
const http = require('http');
const expressLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const { Server } = require('socket.io');

require('dotenv').config();

const db = require('./src/models');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: false
  }
});

app.set('io', io);

// =============================
// CONFIGURACIÓN DE VISTAS
// =============================

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(expressLayouts);
app.set('layout', 'layouts/layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// =============================
// MIDDLEWARES
// =============================

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(express.json({ limit: '100kb' }));

app.set('trust proxy', 1);

if (!process.env.SESSION_SECRET) {
  throw new Error(
    'La variable SESSION_SECRET no está configurada'
  );
}

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

app.use(express.static(path.join(__dirname, '..', 'public')));

// =============================
// VARIABLES PARA LAS VISTAS
// =============================

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

// =============================
// SALUD DE LA APLICACIÓN
// =============================

app.get('/health', async (req, res) => {
  try {
    await db.sequelize.authenticate();

    res.status(200).json({
      status: 'ok',
      database: 'connected',
      realtime: 'enabled'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected'
    });
  }
});

// =============================
// AUTENTICACIÓN
// =============================

const {
  requiereLogin,
  soloAdmin
} = require('./src/middleware/authMiddleware');

// =============================
// RUTAS
// =============================

const authRoutes = require('./src/routes/authRoutes');
const usuariosRoutes = require('./src/routes/usuariosRoutes');
const clienteRoutes = require('./src/routes/clienteRoutes');
const vehiculoRoutes = require('./src/routes/vehiculoRoutes');
const ordenRoutes = require('./src/routes/ordenRoutes');
const facturacionRoutes = require('./src/routes/facturacionRoutes');

app.use('/', authRoutes);

app.get('/', (req,res)=>res.redirect(req.session?.usuario?'/home':'/login'));
app.get('/home', requiereLogin, (req,res)=>res.render('index'));

app.use(
  '/usuarios',
  requiereLogin,
  soloAdmin,
  usuariosRoutes
);

app.use('/clientes', clienteRoutes);
app.use('/vehiculos', vehiculoRoutes);
app.use('/ordenes', ordenRoutes);
app.use('/facturacion-quincenal', facturacionRoutes);

// =============================
// SOCKET.IO
// =============================

io.on('connection', socket => {
  console.log(`Cliente conectado: ${socket.id}`);

  socket.on('unirseOrden', ordenId => {
    if (!ordenId) {
      return;
    }

    socket.join(`orden-${ordenId}`);
  });

  socket.on('salirOrden', ordenId => {
    if (!ordenId) {
      return;
    }

    socket.leave(`orden-${ordenId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

// =============================
// SERVIDOR
// =============================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(
    `Servidor corriendo en http://localhost:${PORT}`
  );
});