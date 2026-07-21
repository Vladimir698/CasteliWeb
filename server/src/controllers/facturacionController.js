const db = require('../models');
const PDFDocument = require('pdfkit');
const path = require('path');

async function obtenerChequesConSaldo() {
  const cheques = await db.Cheque.findAll({
    order: [['id', 'DESC']],
    raw: true,
  });

  const facturas = await db.Factura.findAll({
    raw: true,
  });

  return cheques.map(ch => {
    const monto = Number(ch.monto || 0);

    const gastado = facturas
      .filter(f => Number(f.cheque_id) === Number(ch.id))
      .reduce((acc, f) => acc + Number(f.monto || 0), 0);

    return {
      ...ch,
      monto,
      gastado,
      saldo: monto - gastado,
    };
  });
}

function limpiarMonto(monto) {
  return Number(
    String(monto || '0')
      .replace(/\./g, '')
      .replace(',', '.')
  );
}

exports.index = async (req, res) => {
  try {
    const cheques = await obtenerChequesConSaldo();

    const facturas = await db.Factura.findAll({
      order: [['id', 'DESC']],
      raw: true,
    });

    return res.render('facturacion/facturacionCheques', {
      title: 'Facturación',
      cheques,
      facturas,
      chequesJson: JSON.stringify(cheques),
      facturasJson: JSON.stringify(facturas),
    });
  } catch (error) {
    console.error('Error cargando facturación:', error);
    return res.status(500).send('Error interno');
  }
};

exports.crearCheque = async (req, res) => {
  try {

    const {
      numero_cheque,
      proveedor,
      motivo,
      monto,
      mes
    } = req.body;

    // Limpia formato monetario
    const montoLimpio = limpiarMonto(monto);

    await db.Cheque.create({
      numero_cheque,
      proveedor,
      motivo,
      monto: montoLimpio,
      mes: Number(mes),
      estado: true,
    });

    return res.redirect('/facturacion?msg=cheque');

  } catch (error) {
    console.error('Error creando caja chica:', error);

    return res.status(500).send(
      'Error creando registro de caja chica'
    );
  }
};

exports.crearFactura = async (req, res) => {
  try {
    const { numero_factura, proveedor, monto, cheque_id, mes } = req.body;

    if (!cheque_id) {
      return res.status(400).send('Debe seleccionar un cheque');
    }

    const cheque = await db.Cheque.findByPk(cheque_id);
    if (!cheque) {
      return res.status(404).send('Cheque no encontrado');
    }

    const chequesConSaldo = await obtenerChequesConSaldo();
    const chequeSaldo = chequesConSaldo.find(c => Number(c.id) === Number(cheque_id));

    const montoFactura = limpiarMonto(monto);

    if (montoFactura <= 0) {
      return res.status(400).send('El monto de la factura debe ser mayor a cero');
    }

    if (montoFactura > chequeSaldo.saldo) {
      return res.status(400).send('El monto de la factura supera el saldo disponible del cheque');
    }

await db.Factura.create({
  numero_factura,
  proveedor,
  monto: montoFactura,
  cheque_id: Number(cheque_id),
  mes: Number(mes),
});

    return res.redirect('/facturacion?msg=factura');
  } catch (error) {
    console.error('Error creando factura:', error);
    return res.status(500).send('Error creando factura');
  }
};

exports.reportePdf = async (req, res) => {
  try {
    const cheques = await obtenerChequesConSaldo();

    const facturas = await db.Factura.findAll({
      order: [['id', 'ASC']],
      raw: true,
    });

    const doc = new PDFDocument({
      margin: 40,
      size: 'LETTER',
      bufferPages: true,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte_facturacion.pdf"');

    doc.pipe(res);

const logoPath = path.join(__dirname, '..', '..', '..', 'public', 'images', 'logoLetras.png');
const fontPath = path.join(__dirname, '..', '..', '..', 'public', 'fonts', 'Roboto-VariableFont_wdth,wght.ttf');

let fuentePrincipal = 'Helvetica';

try {
  doc.registerFont('regular', fontPath);
  fuentePrincipal = 'regular';
  doc.font(fuentePrincipal);
} catch (e) {
  console.log('No se pudo cargar la fuente:', e.message);
  doc.font('Helvetica');
}

   function colones(valor) {
  return `CRC ${Number(valor || 0).toLocaleString('es-CR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

    function verificarPagina(alturaNecesaria = 80) {
      if (doc.y + alturaNecesaria > 720) {
        doc.addPage();
        doc.y = 50;
      }
    }

    // Encabezado
    try {
      doc.image(logoPath, 45, 25, { width: 80 });
    } catch (e) {
      console.log('No se pudo cargar el logo:', e.message);
    }

    doc
      .fillColor('#000')
      .font(fuentePrincipal)
      .fontSize(18)
      .text('Reporte de Facturación', 145, 45);

    doc
      .fontSize(10)
      .text('Asociación ASCOPA', 145, 72)
      .text(`Fecha de emisión: ${new Date().toLocaleDateString('es-CR')}`, 145, 88);

    doc
      .moveTo(40, 125)
      .lineTo(572, 125)
      .strokeColor('#D9DEE8')
      .stroke();

    let y = 145;

    if (cheques.length === 0) {
      doc
        .fillColor('#666')
        .fontSize(11)
        .text('No existen cheques registrados.', 40, y);

      y += 30;
    }

    cheques.forEach((ch) => {
      if (y > 650) {
        doc.addPage();
        y = 50;
      }

      // Caja cheque
      doc
        .roundedRect(40, y, 532, 82, 8)
        .fillAndStroke('#F7F9FC', '#D9DEE8');

      doc
        .fillColor('#000')
        .fontSize(12)
        .text(`Cheque #${ch.numero_cheque}`, 55, y + 12);

      doc
        .fontSize(9)
        .text(`Proveedor: ${ch.proveedor || '-'}`, 55, y + 34)
        .text(`Motivo: ${ch.motivo || '-'}`, 55, y + 50);

      doc
        .fontSize(9)
        .text(`Monto: ${colones(ch.monto)}`, 330, y + 18)
        .text(`Gastado: ${colones(ch.gastado)}`, 330, y + 38)
        .text(`Saldo: ${colones(ch.saldo)}`, 330, y + 58);

      y += 100;

      const facturasCheque = facturas.filter(f => Number(f.cheque_id) === Number(ch.id));

      if (facturasCheque.length === 0) {
        doc
          .fontSize(9)
          .fillColor('#666')
          .text('Sin facturas registradas para este cheque.', 55, y);

        y += 35;
      } else {
        verificarPagina(80);

        // Encabezado tabla
        doc
          .rect(40, y, 532, 25)
          .fill('#224A9B');

        doc
          .fillColor('#FFFFFF')
          .fontSize(9)
          .text('Factura', 50, y + 8)
          .text('Proveedor', 145, y + 8)
          .text('Monto', 470, y + 8, { width: 90, align: 'right' });

        y += 25;

        facturasCheque.forEach((f, index) => {
          if (y > 705) {
            doc.addPage();
            y = 50;

            doc
              .rect(40, y, 532, 25)
              .fill('#224A9B');

            doc
              .fillColor('#FFFFFF')
              .fontSize(9)
              .text('Factura', 50, y + 8)
              .text('Proveedor', 145, y + 8)
              .text('Monto', 470, y + 8, { width: 90, align: 'right' });

            y += 25;
          }

          const fill = index % 2 === 0 ? '#FFFFFF' : '#F3F6FA';

          doc
            .rect(40, y, 532, 25)
            .fill(fill);

          doc
            .fillColor('#000')
            .fontSize(9)
            .text(f.numero_factura || '-', 50, y + 8)
            .text(f.proveedor || '-', 145, y + 8, { width: 280 })
            .text(colones(f.monto), 470, y + 8, { width: 90, align: 'right' });

          y += 25;
        });

        // Total por cheque
        doc
          .rect(40, y, 532, 30)
          .fill('#EAF7F8');

        doc
          .fillColor('#000')
          .fontSize(9)
          .text('Total gastado del cheque', 300, y + 10)
          .text(colones(ch.gastado), 470, y + 10, { width: 90, align: 'right' });

        y += 45;
      }
    });

    // Pie de página
    const pages = doc.bufferedPageRange();

    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      doc
        .fontSize(8)
        .fillColor('#777')
        .text(
          `Página ${i + 1} de ${pages.count}`,
          40,
          740,
          { align: 'center', width: 532 }
        );
    }

    doc.end();

  } catch (error) {
    console.error('Error generando PDF:', error);
    return res.status(500).send('Error generando PDF');
  }
};