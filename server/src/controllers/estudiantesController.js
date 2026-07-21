const db = require('../models');
const path = require('path');
const fs = require('fs');

// Cargar JSON una sola vez
const ubicacionesPath = path.join(__dirname, '..', 'data', 'cr_ubicaciones.json');
let UBICACIONES = {};
try {
  UBICACIONES = JSON.parse(fs.readFileSync(ubicacionesPath, 'utf-8'));
} catch (e) {
  console.error('No se pudo leer cr_ubicaciones.json:', e.message);
}

// Provincias (estables)
const PROVINCIAS = ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'];

// ============================
// LISTAR  GET /expedientes
// ============================
exports.index = async (req, res) => {
  try {
    const estudiantes = await db.Estudiante.findAll({ order: [['id', 'DESC']] });

    return res.render('estudiantes/expedientesEstudiantes', {
      title: 'Expedientes de Estudiantes',
      estudiantes,
    });
  } catch (error) {
    console.error('Error listando estudiantes:', error);
    return res.status(500).send('Error interno al listar');
  }
};

// ============================
// FORM CREAR  GET /expedientes/nuevo
// ============================
exports.formCrear = async (req, res) => {
  try {
    // ✅ Para el dropdown de estudiantes (si lo usas en agregar)
    const estudiantes = await db.Estudiante.findAll({ order: [['nombre', 'ASC']] });

    return res.render('estudiantes/agregarExpEstudiantes', {
      title: 'Agregar Expediente de Estudiante',
      provincias: PROVINCIAS,
      estudiantes,
    });
  } catch (error) {
    console.error('Error cargando form crear:', error);
    return res.status(500).send('Error interno');
  }
};

// ============================
// API CANTONES  GET /expedientes/api/cantones?provincia=Heredia
// ============================
exports.getCantones = (req, res) => {
  const { provincia } = req.query;
  if (!provincia || !UBICACIONES[provincia]) return res.json([]);

  const cantones = Object.keys(UBICACIONES[provincia]).sort();
  return res.json(cantones);
};

// ============================
// API DISTRITOS  GET /expedientes/api/distritos?provincia=Heredia&canton=Barva
// ============================
exports.getDistritos = (req, res) => {
  const { provincia, canton } = req.query;
  if (!provincia || !canton) return res.json([]);
  if (!UBICACIONES[provincia] || !UBICACIONES[provincia][canton]) return res.json([]);

  const distritos = UBICACIONES[provincia][canton].slice().sort();
  return res.json(distritos);
};

// ============================
// CREAR  POST /expedientes/nuevo
// ============================
exports.crear = async (req, res) => {
  try {
    await db.Estudiante.create({
      cedula: req.body.cedula,
      nombre: req.body.nombre,
      apellidos: req.body.apellidos,
      nacionalidad: req.body.nacionalidad,
      fechaNacimiento: req.body.fechaNacimiento,
      diagnostico: req.body.diagnostico,
      beca: req.body.beca === 'on' || req.body.beca === true,

      provincia: req.body.provincia,
      canton: req.body.canton,
      distrito: req.body.distrito,
      direccionExacta: req.body.direccionExacta,

      estado: req.body.estado === 'on' || req.body.estado === true,
    });

    return res.redirect('/expedientes?msg=creado');
  } catch (error) {
    console.error('Error creando estudiante:', error);

    // ✅ volver a cargar estudiantes para que el dropdown no se rompa
    const estudiantes = await db.Estudiante.findAll({ order: [['nombre', 'ASC']] });

    return res.status(400).render('estudiantes/agregarExpEstudiantes', {
      title: 'Agregar Expediente de Estudiante',
      error: 'Ocurrió un error guardando el registro. Inténtalo de nuevo.',
      form: req.body,
      provincias: PROVINCIAS,
      estudiantes,
    });
  }
};

// ============================
// FORM EDITAR  GET /expedientes/:id/editar
// ============================
exports.formEditar = async (req, res) => {
  try {
    const { id } = req.params;

    const estudiante = await db.Estudiante.findByPk(id);
    if (!estudiante) return res.status(404).send('Registro no encontrado');

    // ✅ ESTA ES LA LÍNEA QUE TE FALTABA
    const estudiantes = await db.Estudiante.findAll({ order: [['nombre', 'ASC']] });

    return res.render('estudiantes/editarExpEstudiantes', {
      title: 'Editar Expediente de Estudiante',
      estudiante,
      estudiantes, // ✅ ahora sí existe para el forEach en el EJS
      provincias: PROVINCIAS,
    });
  } catch (error) {
    console.error('Error cargando editar:', error);
    return res.status(500).send('Error interno');
  }
};

// ============================
// ACTUALIZAR  POST /expedientes/:id/editar
// ============================
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const estudiante = await db.Estudiante.findByPk(id);
    if (!estudiante) return res.status(404).send('Registro no encontrado');

    await estudiante.update({
      cedula: req.body.cedula,
      nombre: req.body.nombre,
      apellidos: req.body.apellidos,
      nacionalidad: req.body.nacionalidad,
      fechaNacimiento: req.body.fechaNacimiento,
      diagnostico: req.body.diagnostico,
      beca: req.body.beca === 'on' || req.body.beca === true,

      provincia: req.body.provincia,
      canton: req.body.canton,
      distrito: req.body.distrito,
      direccionExacta: req.body.direccionExacta,

      estado: req.body.estado === 'on' || req.body.estado === true,
    });

    return res.redirect('/expedientes?msg=actualizado');
  } catch (error) {
    console.error('Error actualizando:', error);
    return res.status(400).send('Error interno al actualizar');
  }
};

// ============================
// ELIMINAR  POST /expedientes/:id/eliminar
// ============================
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const estudiante = await db.Estudiante.findByPk(id);
    if (!estudiante) return res.status(404).send('Registro no encontrado');

    await estudiante.destroy();
    return res.redirect('/expedientes?msg=eliminado');
  } catch (error) {
    console.error('Error eliminando:', error);
    return res.status(500).send('Error interno al eliminar');
  }
};


exports.verModal = async (req, res) => {
  try {
    const { id } = req.params;

    const estudiante = await db.Estudiante.findByPk(id);
    if (!estudiante) return res.status(404).send('Registro no encontrado');

    // Importante: renderizamos un parcial (solo html del modal)
    return res.render('estudiantes/partials/verExpEstudiantesModal', {
      estudiante,
      provincias: PROVINCIAS,
      layout: false, // 🔥 clave: no usar layout
    });
  } catch (error) {
    console.error('Error cargando verModal:', error);
    return res.status(500).send('Error interno');
  }
};


exports.dashboardEstudiantes = async (req, res) => {
  try {
    const estudiantes = await db.Estudiante.findAll({
      order: [['nombre', 'ASC']],
    });

    const estudiantesJson = JSON.stringify(
      estudiantes.map(e => ({
        id: e.id,
        cedula: e.cedula || '',
        nombre: e.nombre || '',
        apellidos: e.apellidos || '',
        estado: !!e.estado,
        horario: e.horario || 'Sin horario registrado',
        diagnostico: e.diagnostico || ''
      }))
    );

    return res.render('estudiantes/listadoEstudiantes', {
      title: 'Listado de Estudiantes',
      estudiantes,
      estudiantesJson
    });
  } catch (error) {
    console.error('Error cargando listado estudiantes:', error);
    return res.status(500).send('Error interno');
  }
};

exports.actualizarHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const { horario } = req.body;

    const estudiante = await db.Estudiante.findByPk(id);

    if (!estudiante) {
      return res.status(404).send('Estudiante no encontrado');
    }

    await estudiante.update({
      horario: horario && horario.trim() !== '' ? horario.trim() : null
    });

    return res.redirect('/expedientes/dashboard');

  } catch (error) {
    console.error('Error actualizando horario:', error);
    return res.status(500).send('Error interno al actualizar horario');
  }
};