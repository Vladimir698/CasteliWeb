const express = require('express');
const session = require('express-session');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

require('dotenv').config();

const db = require('./src/models');

const app = express();


// =============================
// CONFIGURACIÓN VISTAS
// =============================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(expressLayouts);
app.set('layout', 'layouts/layout');

// Permitir scripts y estilos por vista
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);


// =============================
// MIDDLEWARES
// =============================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('trust proxy', 1);

if (!process.env.SESSION_SECRET) {
  throw new Error('La variable SESSION_SECRET no está configurada');
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

app.get('/health', async (req, res) => {
  try {
    await db.sequelize.authenticate();

    res.status(200).json({
      status: 'ok',
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected'
    });
  }
});

// Usuario disponible en todas las vistas
app.use((req, res, next) => {
  const usuario = req.session.usuario || null;
  const rol = usuario && usuario.rol ? usuario.rol.trim().toLowerCase() : '';

  res.locals.usuario = usuario;
  res.locals.rolUsuario = rol;
  res.locals.esAdmin = rol === 'administrador';
  res.locals.esProfesor = rol === 'profesor';

  next();
});
// Archivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));


// =============================
// TEST DB
// =============================
(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Conexión a PostgreSQL exitosa');
  } catch (error) {
    console.error('Error conectando a PostgreSQL:', error.message);
  }
})();


// =============================
// MIDDLEWARE AUTH
// =============================
const { requiereLogin, permitirRoles, soloAdmin } = require('./src/middleware/authMiddleware');


// =============================
// RUTAS (IMPORTS)
// =============================
const authRoutes = require('./src/routes/authRoutes');
const usuariosRoutes = require('./src/routes/usuariosRoutes');
const proveedorRoutes = require('./src/routes/proveedorRoutes');
const estudianteRoutes = require('./src/routes/estudianteRoutes');
const encargadosRoutes = require('./src/routes/encargadosRoutes');
const facturacionRoutes = require('./src/routes/facturacionRoutes');
const empleadosRoutes = require('./src/routes/empleadosRoutes');
const reportesRoutes = require('./src/routes/reportesRoutes');


// =============================
// RUTAS PÚBLICAS LOGIN
// =============================
app.use('/', authRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  if (req.session.usuario) {
    return res.redirect('/home');
  }

  return res.redirect('/login');
});

// =============================
// HOME DESPUÉS DE LOGIN
// =============================
app.get('/home', requiereLogin, (req, res) => {
  res.render('index');
});


// =============================
// RUTAS PROTEGIDAS
// =============================

// SOLO ADMIN
app.use('/proveedores', requiereLogin, soloAdmin, proveedorRoutes);
app.use('/facturacion', requiereLogin, soloAdmin, facturacionRoutes);
app.use('/empleados', requiereLogin, soloAdmin, empleadosRoutes);
app.use('/reportes', requiereLogin, soloAdmin, reportesRoutes);
app.use('/usuarios', requiereLogin, soloAdmin, usuariosRoutes);

// ADMIN Y PROFESOR
app.use('/expedientes', requiereLogin, permitirRoles('Administrador', 'Profesor'), estudianteRoutes);
app.use('/encargados', requiereLogin, permitirRoles('Administrador', 'Profesor'), encargadosRoutes);


// =============================
// SERVIDOR
// =============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});