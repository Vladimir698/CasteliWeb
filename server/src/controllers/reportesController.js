const db = require('../models');
const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');
const path = require('path');

function dinero(valor) {
  return `CRC ${Number(valor || 0).toLocaleString('es-CR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function nombreCompleto(persona) {
  return `${persona.nombre || ''} ${persona.apellidos || ''}`.trim();
}

const mesesReporte = [
  { id: 1, nombre: 'Enero' },
  { id: 2, nombre: 'Febrero' },
  { id: 3, nombre: 'Marzo' },
  { id: 4, nombre: 'Abril' },
  { id: 5, nombre: 'Mayo' },
  { id: 6, nombre: 'Junio' },
  { id: 7, nombre: 'Julio' },
  { id: 8, nombre: 'Agosto' },
  { id: 9, nombre: 'Septiembre' },
  { id: 10, nombre: 'Octubre' },
  { id: 11, nombre: 'Noviembre' },
  { id: 12, nombre: 'Diciembre' },
];

async function obtenerDatosReportes() {
  const estudiantes = await db.Estudiante.findAll({
    order: [['nombre', 'ASC']],
    raw: true,
  });

  const empleados = await db.Empleado.findAll({
    order: [['nombre', 'ASC']],
    raw: true,
  });

  const encargados = await db.Encargado.findAll({ raw: true });
  const cheques = await db.Cheque.findAll({ raw: true });
  const facturas = await db.Factura.findAll({ raw: true });

  const pagosMensuales = db.PagoMensual
    ? await db.PagoMensual.findAll({ raw: true })
    : [];

  const anioActual = new Date().getFullYear();
  const mesActual = new Date().getMonth() + 1;

  const estudiantesInactivosLista = estudiantes
    .filter(e => !e.estado)
    .map(e => ({
      id: e.id,
      cedula: e.cedula || '',
      nombreCompleto: nombreCompleto(e),
      diagnostico: e.diagnostico || '',
      horario: e.horario || 'Sin horario registrado',
    }));

  const estudiantesBecadosLista = estudiantes
    .filter(e => e.beca)
    .map(e => ({
      id: e.id,
      cedula: e.cedula || '',
      nombreCompleto: nombreCompleto(e),
      diagnostico: e.diagnostico || '',
      horario: e.horario || 'Sin horario registrado',
    }));

  const totalEstudiantes = estudiantes.length;
  const estudiantesActivos = estudiantes.filter(e => e.estado).length;
  const estudiantesInactivos = estudiantesInactivosLista.length;
  const estudiantesBecados = estudiantesBecadosLista.length;

  const estudiantesConHorario = estudiantes.filter(
    e => e.horario && e.horario.trim() !== ''
  ).length;

  const estudiantesSinHorario = totalEstudiantes - estudiantesConHorario;

  const totalCheques = cheques.reduce((acc, c) => acc + Number(c.monto || 0), 0);
  const totalFacturas = facturas.reduce((acc, f) => acc + Number(f.monto || 0), 0);
  const saldoDisponible = totalCheques - totalFacturas;

  const facturasPorCheque = cheques.map(ch => {
    const facturasCheque = facturas.filter(f => Number(f.cheque_id) === Number(ch.id));
    const gastado = facturasCheque.reduce((acc, f) => acc + Number(f.monto || 0), 0);

    return {
      cheque: ch.numero_cheque,
      proveedor: ch.proveedor || '-',
      motivo: ch.motivo || '-',
      monto: Number(ch.monto || 0),
      gastado,
      saldo: Number(ch.monto || 0) - gastado,
      cantidadFacturas: facturasCheque.length,
    };
  });

  const encargadosActivos = encargados.filter(enc =>
    enc.estado === true ||
    enc.estado === 'true' ||
    enc.estado === 1 ||
    enc.estado === '1'
  );

  const encargadosMorosos = encargadosActivos
    .map(enc => {
      const estudiante = estudiantes.find(e => Number(e.id) === Number(enc.estudiante_id));

      const mesesPendientes = mesesReporte
        .filter(m => m.id <= mesActual)
        .filter(m => {
          const pagoExiste = pagosMensuales.some(p =>
            Number(p.encargado_id) === Number(enc.id) &&
            Number(p.estudiante_id) === Number(enc.estudiante_id) &&
            Number(p.mes) === Number(m.id) &&
            Number(p.anio) === Number(anioActual)
          );

          return !pagoExiste;
        })
        .map(m => ({
          mesId: m.id,
          mes: m.nombre,
          anio: anioActual,
          fechaEsperada: `Sin pago registrado en ${m.nombre} ${anioActual}`,
        }));

      return {
        encargadoId: enc.id,
        estudianteId: enc.estudiante_id,
        encargado: nombreCompleto(enc),
        estudiante: estudiante ? nombreCompleto(estudiante) : 'Estudiante no encontrado',
        cedulaEncargado: enc.cedula || '-',
        telefono: enc.telefono || '-',
        correo: enc.correo || '-',
        mesesPendientes,
      };
    })
    .filter(item => item.mesesPendientes.length > 0);

  const pagosAlDia = encargadosActivos.length - encargadosMorosos.length;

  return {
    estudiantes,
    empleados,
    encargados,
    cheques,
    facturas,
    pagosMensuales,
    estudiantesInactivosLista,
    estudiantesBecadosLista,
    encargadosMorosos,
    anioActual,
    mesActual,
    resumen: {
      totalEstudiantes,
      estudiantesActivos,
      estudiantesInactivos,
      estudiantesBecados,
      estudiantesConHorario,
      estudiantesSinHorario,
      totalEmpleados: empleados.length,
      totalEncargados: encargados.length,
      totalCheques,
      totalFacturas,
      saldoDisponible,
      cantidadFacturas: facturas.length,
      encargadosMorosos: encargadosMorosos.length,
      pagosAlDia,
    },
    facturasPorCheque,
  };
}

exports.index = async (req, res) => {
  try {
    const datos = await obtenerDatosReportes();

    return res.render('reportes/reportesDashboard', {
      title: 'Reportes',
      datosJson: JSON.stringify(datos),
    });
  } catch (error) {
    console.error('Error cargando reportes:', error);
    return res.status(500).send('Error interno cargando reportes');
  }
};

exports.exportarExcel = async (req, res) => {
  try {
    const datos = await obtenerDatosReportes();

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([datos.resumen]),
      'Resumen'
    );

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(datos.estudiantesInactivosLista),
      'Estudiantes Inactivos'
    );

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(datos.estudiantesBecadosLista),
      'Estudiantes Becados'
    );

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(datos.encargadosMorosos.map(e => ({
        encargado: e.encargado,
        estudiante: e.estudiante,
        cedulaEncargado: e.cedulaEncargado,
        telefono: e.telefono,
        correo: e.correo,
        mesesPendientes: e.mesesPendientes.map(m => m.mes).join(', '),
      }))),
      'Pagos Pendientes'
    );

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(datos.estudiantes),
      'Estudiantes'
    );

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(datos.empleados),
      'Empleados'
    );

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(datos.facturasPorCheque),
      'Facturas por Caja Chica'
    );

    const buffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'buffer',
    });

    res.setHeader('Content-Disposition', 'attachment; filename="reportes_ascopa.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    return res.send(buffer);
  } catch (error) {
    console.error('Error exportando Excel:', error);
    return res.status(500).send('Error exportando Excel');
  }
};

exports.exportarPdf = async (req, res) => {
  try {
    const datos = await obtenerDatosReportes();
    const r = datos.resumen;

    const doc = new PDFDocument({
      margin: 40,
      size: 'LETTER',
      bufferPages: true,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reportes_ascopa.pdf"');

    doc.pipe(res);

    const logoPath = path.join(__dirname, '..', '..', '..', 'public', 'images', 'logoLetras.png');

    function addHeader() {
      try {
        doc.image(logoPath, 45, 25, { width: 72 });
      } catch (e) {
        console.log('No se pudo cargar el logo:', e.message);
      }

      doc
        .fillColor('#111')
        .font('Helvetica-Bold')
        .fontSize(18)
        .text('Reporte General ASCOPA', 135, 45);

      doc
        .font('Helvetica')
        .fontSize(10)
        .text('Reporte institucional de estudiantes, empleados, pagos y facturación', 135, 70)
        .text(`Fecha de emisión: ${new Date().toLocaleDateString('es-CR')}`, 135, 86);

      doc
        .moveTo(40, 120)
        .lineTo(572, 120)
        .strokeColor('#D9DEE8')
        .stroke();
    }

    function addFooter() {
      const pages = doc.bufferedPageRange();

      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);

        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor('#777')
          .text(
            `Página ${i + 1} de ${pages.count}`,
            40,
            740,
            { align: 'center', width: 532 }
          );
      }
    }

    function checkPage(y, needed = 70) {
      if (y + needed > 720) {
        doc.addPage();
        addHeader();
        return 140;
      }

      return y;
    }

    function statBox(x, y, w, title, value, subtitle, color) {
      doc
        .roundedRect(x, y, w, 75, 10)
        .fillAndStroke('#F7F9FC', '#D9DEE8');

      doc
        .fillColor(color)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(title, x + 14, y + 12);

      doc
        .fillColor('#111')
        .fontSize(16)
        .text(String(value), x + 14, y + 30, { width: w - 28 });

      doc
        .fillColor('#777')
        .font('Helvetica')
        .fontSize(8)
        .text(subtitle, x + 14, y + 55, { width: w - 28 });
    }

    function sectionTitle(text, y) {
      doc
        .fillColor('#224A9B')
        .font('Helvetica-Bold')
        .fontSize(13)
        .text(text, 40, y);

      doc
        .moveTo(40, y + 20)
        .lineTo(572, y + 20)
        .strokeColor('#E0E6EF')
        .stroke();

      return y + 34;
    }

    function tablaEstudiantes(titulo, lista, y, vacioTexto, colorVacio = '#2D9B5F') {
      y = checkPage(y, 120);
      y = sectionTitle(titulo, y);

      if (lista.length === 0) {
        doc
          .roundedRect(40, y, 532, 45, 8)
          .fillAndStroke('#F7F9FC', '#D9DEE8');

        doc
          .fillColor(colorVacio)
          .font('Helvetica-Bold')
          .fontSize(10)
          .text(vacioTexto, 55, y + 16);

        return y + 65;
      }

      doc
        .rect(40, y, 532, 25)
        .fill('#224A9B');

      doc
        .fillColor('#FFF')
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('Cédula', 50, y + 8)
        .text('Estudiante', 125, y + 8)
        .text('Horario', 330, y + 8)
        .text('Diagnóstico', 450, y + 8);

      y += 25;

      lista.forEach((e, index) => {
        y = checkPage(y, 28);

        doc
          .rect(40, y, 532, 28)
          .fill(index % 2 === 0 ? '#FFFFFF' : '#F3F6FA');

        doc
          .fillColor('#111')
          .font('Helvetica')
          .fontSize(8)
          .text(e.cedula || '-', 50, y + 9, { width: 70 })
          .text(e.nombreCompleto || '-', 125, y + 9, { width: 190 })
          .text(e.horario || '-', 330, y + 9, { width: 105 })
          .text(e.diagnostico || '-', 450, y + 9, { width: 110 });

        y += 28;
      });

      return y + 20;
    }

    function tablaMorosos(y) {
      y = checkPage(y, 130);
      y = sectionTitle('Encargados con pagos pendientes', y);

      if (!datos.encargadosMorosos || datos.encargadosMorosos.length === 0) {
        doc
          .roundedRect(40, y, 532, 45, 8)
          .fillAndStroke('#F7F9FC', '#D9DEE8');

        doc
          .fillColor('#2D9B5F')
          .font('Helvetica-Bold')
          .fontSize(10)
          .text('Todos los encargados tienen sus pagos al día.', 55, y + 16);

        return y + 65;
      }

      datos.encargadosMorosos.forEach((m) => {
        y = checkPage(y, 85);

        doc
          .roundedRect(40, y, 532, 72, 8)
          .fillAndStroke('#FFF7F7', '#F3CACA');

        doc
          .fillColor('#111')
          .font('Helvetica-Bold')
          .fontSize(10)
          .text(m.encargado || '-', 55, y + 12);

        doc
          .fillColor('#555')
          .font('Helvetica')
          .fontSize(8)
          .text(`Estudiante: ${m.estudiante || '-'}`, 55, y + 28)
          .text(`Teléfono: ${m.telefono || '-'}`, 55, y + 42)
          .text(`Correo: ${m.correo || '-'}`, 55, y + 56);

        doc
          .fillColor('#D64545')
          .font('Helvetica-Bold')
          .fontSize(8)
          .text(
            `Pendientes: ${m.mesesPendientes.map(p => p.mes).join(', ')}`,
            300,
            y + 24,
            { width: 250 }
          );

        y += 88;
      });

      return y + 15;
    }

    addHeader();

    let y = 145;

    y = sectionTitle('Resumen general', y);

    statBox(40, y, 125, 'Estudiantes', r.totalEstudiantes, `${r.estudiantesActivos} activos`, '#224A9B');
    statBox(177, y, 125, 'Inactivos', r.estudiantesInactivos, 'Requieren revisión', '#EF5350');
    statBox(314, y, 125, 'Becados', r.estudiantesBecados, 'Con beca registrada', '#D9A100');
    statBox(451, y, 121, 'Morosidad', r.encargadosMorosos, 'Pagos pendientes', '#EF5350');

    y += 100;

    y = tablaMorosos(y);

    y = tablaEstudiantes(
      'Estudiantes inactivos',
      datos.estudiantesInactivosLista,
      y,
      'No existen estudiantes inactivos registrados.',
      '#2D9B5F'
    );

    y = tablaEstudiantes(
      'Estudiantes con beca',
      datos.estudiantesBecadosLista,
      y,
      'No existen estudiantes con beca registrada.',
      '#8A6D00'
    );

    y = checkPage(y, 160);
    y = sectionTitle('Resumen de horarios y responsables', y);

    doc
      .roundedRect(40, y, 250, 70, 8)
      .fillAndStroke('#F7F9FC', '#D9DEE8');

    doc
      .fillColor('#111')
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('Horarios', 55, y + 12);

    doc
      .font('Helvetica')
      .fontSize(9)
      .text(`Con horario: ${r.estudiantesConHorario}`, 55, y + 35)
      .text(`Sin horario: ${r.estudiantesSinHorario}`, 55, y + 50);

    doc
      .roundedRect(322, y, 250, 70, 8)
      .fillAndStroke('#F7F9FC', '#D9DEE8');

    doc
      .fillColor('#111')
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('Responsables y facturas', 337, y + 12);

    doc
      .font('Helvetica')
      .fontSize(9)
      .text(`Encargados registrados: ${r.totalEncargados}`, 337, y + 35)
      .text(`Facturas registradas: ${r.cantidadFacturas}`, 337, y + 50);

    y += 100;

    y = checkPage(y, 160);
    y = sectionTitle('Facturación por caja chica', y);

    if (datos.facturasPorCheque.length === 0) {
      doc
        .fillColor('#666')
        .font('Helvetica')
        .fontSize(10)
        .text('No existen registros de caja chica.', 40, y);

      y += 30;
    } else {
      doc
        .rect(40, y, 532, 25)
        .fill('#224A9B');

      doc
        .fillColor('#FFF')
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('Entero', 50, y + 8)
        .text('Responsable', 105, y + 8)
        .text('Facturas', 250, y + 8)
        .text('Monto', 320, y + 8, { width: 70, align: 'right' })
        .text('Cancelado', 405, y + 8, { width: 70, align: 'right' })
        .text('Saldo', 492, y + 8, { width: 70, align: 'right' });

      y += 25;

      datos.facturasPorCheque.forEach((ch, index) => {
        y = checkPage(y, 28);

        doc
          .rect(40, y, 532, 28)
          .fill(index % 2 === 0 ? '#FFFFFF' : '#F3F6FA');

        doc
          .fillColor('#111')
          .font('Helvetica')
          .fontSize(8)
          .text(ch.cheque || '-', 50, y + 9, { width: 50 })
          .text(ch.proveedor || '-', 105, y + 9, { width: 140 })
          .text(String(ch.cantidadFacturas || 0), 260, y + 9)
          .text(dinero(ch.monto), 320, y + 9, { width: 70, align: 'right' })
          .text(dinero(ch.gastado), 405, y + 9, { width: 70, align: 'right' })
          .text(dinero(ch.saldo), 492, y + 9, { width: 70, align: 'right' });

        y += 28;
      });
    }

    addFooter();
    doc.end();

  } catch (error) {
    console.error('Error exportando PDF:', error);
    return res.status(500).send('Error exportando PDF');
  }
};