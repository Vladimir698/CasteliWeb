(() => {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const num = v => Number(String(v ?? '').replace(/[^0-9.-]/g, '')) || 0;
  const col = n => '₡' + Number(n || 0).toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  function detailRows() {
    const note = ($('#client-note')?.value || '').trim();
    let rows = note.split(/\r?\n/).map(x => x.replace(/^[-•✓*\d.)\s]+/, '').trim()).filter(Boolean);
    if (rows.length <= 1 && note.length > 90) {
      rows = note.split(/(?<=[.;])\s+(?=[A-ZÁÉÍÓÚÑ])/).map(x => x.replace(/[.;]+$/, '').trim()).filter(Boolean);
    }
    if (!rows.length) rows = $$('#trabajo-realizado .mechanic-item strong').map(x => x.textContent.trim()).filter(Boolean);
    return rows;
  }

  function installSelectAll() {
    const section = $('#repuestos');
    if (!section || $('.select-all-parts', section)) return;
    const list = $('.parts-from-work', section);
    if (!list) return;
    const pending = $$('.part-pick:not(.selected)', list).length;
    if (!pending) return;
    const single = $('form[action*="/trabajos/"][action$="/repuesto"]', list);
    const action = single?.getAttribute('action') || '';
    const orderId = $('#cuenta-taller form[action$="/totales"]')?.getAttribute('action')?.match(/^\/ordenes\/(\d+)\/totales$/)?.[1];
    if (!orderId) return;
    const form = document.createElement('form');
    form.action = `/ordenes/${orderId}/repuestos/todos`;
    form.method = 'POST';
    form.className = 'select-all-parts';
    form.innerHTML = `<button type="submit" class="btn btn-dark btn-lg">✓ Agregar todo al cobro</button><small>Agrega los ${pending} elementos pendientes de una sola vez. Después puede editar cantidad y precio.</small>`;
    list.parentNode.insertBefore(form, list);
  }

  function renderDetailPreview() {
    const preview = $('#advance-preview');
    if (!preview) return;
    const headings = $$('h4', preview);
    const oldTitle = headings.find(h => h.textContent.trim().toLowerCase() === 'trabajos realizados');
    if (!oldTitle) return;
    let container = $('#advance-service-detail', preview);
    if (!container) {
      container = document.createElement('div');
      container.id = 'advance-service-detail';
      oldTitle.insertAdjacentElement('beforebegin', container);
      const oldList = oldTitle.nextElementSibling;
      oldTitle.remove();
      if (oldList && oldList.tagName === 'UL') oldList.remove();
    }
    const rows = detailRows();
    container.innerHTML = '<h4>Detalle de servicio</h4>' + (rows.length
      ? `<ol class="advance-detail-list">${rows.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ol>`
      : '<p class="text-muted">Escriba el detalle del servicio arriba.</p>');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  function getData() {
    const hero = $('.vehicle-sheet-hero');
    const plate = $('h1', hero)?.textContent.trim() || '';
    const model = $('p', hero)?.textContent.trim() || '';
    const owner = hero ? $$('strong', hero).pop()?.textContent.trim() || '' : '';
    const repair = $('#reparacion-actual');
    const order = repair ? $('h3', repair)?.textContent.trim() || '' : '';
    const summaryStrong = repair ? $$('.repair-summary strong', repair) : [];
    const km = summaryStrong[1]?.textContent.trim() || '';
    const details = detailRows();
    const parts = $$('.parts-edit-row').map(row => {
      const inputs = $$('input', row);
      return { description: inputs[0]?.value.trim() || '', qty: num(inputs[1]?.value), price: num(inputs[2]?.value) };
    }).filter(x => x.description);
    const subtotal = parts.reduce((s, p) => s + p.qty * p.price, 0);
    const iva = subtotal * .13;
    const mano = num($('#cuenta-taller input[name="mano_obra"]')?.value);
    const otros = num($('#cuenta-taller input[name="otros"]')?.value);
    const descuento = num($('#cuenta-taller input[name="descuento"]')?.value);
    const total = Math.max(0, subtotal + iva + mano + otros - descuento);
    return { plate, model, owner, order, km, details, parts, subtotal, iva, mano, otros, descuento, total };
  }

  function wrapLines(ctx, text, maxWidth) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const lines = []; let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) { lines.push(current); current = word; }
      else current = test;
    }
    if (current) lines.push(current);
    return lines.length ? lines : [''];
  }

  function downloadSummary() {
    const d = getData();
    const W = 1200, pad = 70, right = W - pad;
    const probe = document.createElement('canvas').getContext('2d');
    probe.font = '19px Arial';
    const detailLines = d.details.reduce((n, x) => n + wrapLines(probe, x, 940).length, 0);
    const H = Math.max(1100, 560 + detailLines * 31 + d.parts.length * 41 + (d.otros ? 40 : 0) + (d.descuento ? 40 : 0));
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#202224'; ctx.fillRect(0, 0, W, 145);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 50px Arial'; ctx.fillText('CASTELI', pad, 68);
    ctx.font = '15px Arial'; ctx.fillText('TALLER AUTOMOTRIZ', pad + 4, 100);
    ctx.font = '16px Arial'; ctx.fillStyle = '#d8d8d8'; ctx.fillText('MANTENIMIENTO   |   DIAGNÓSTICO   |   REPARACIÓN', pad, 132);
    ctx.textAlign = 'right'; ctx.font = '18px Arial'; ctx.fillStyle = '#fff'; ctx.fillText('Detalle para el cliente', right, 70); ctx.textAlign = 'left';

    let y = 205;
    ctx.fillStyle = '#111'; ctx.font = 'bold 32px Arial'; ctx.fillText(`${d.plate} · ${d.model}`, pad, y);
    ctx.font = '21px Arial'; ctx.fillStyle = '#555'; ctx.fillText(d.owner, pad, y + 35);
    ctx.textAlign = 'right'; ctx.font = '18px Arial'; ctx.fillStyle = '#333'; ctx.fillText(`Fecha: ${new Date().toLocaleDateString('es-CR')}`, right, y);
    if (d.order) ctx.fillText(`Orden: ${d.order}`, right, y + 30);
    if (d.km) ctx.fillText(`Kilometraje: ${d.km}`, right, y + 60);
    ctx.textAlign = 'left'; y += 100;
    ctx.strokeStyle = '#999'; ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(right, y); ctx.stroke(); y += 38;

    const section = t => { ctx.fillStyle = '#111'; ctx.font = 'bold 26px Arial'; ctx.fillText(t, pad, y); y += 31; };
    const rule = () => { ctx.strokeStyle = '#dedede'; ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(right, y); ctx.stroke(); };

    section('Detalle de servicio');
    ctx.font = '19px Arial';
    d.details.forEach((item, i) => {
      const lines = wrapLines(ctx, item, 970);
      const rowH = Math.max(31, lines.length * 25 + 6);
      ctx.fillStyle = i % 2 ? '#fff' : '#fafafa'; ctx.fillRect(pad, y, W-pad*2, rowH);
      ctx.fillStyle = '#333'; ctx.font = 'bold 18px Arial'; ctx.fillText(`${i + 1}.`, pad + 10, y + 22);
      ctx.font = '19px Arial'; lines.forEach((line,j)=>ctx.fillText(line,pad+52,y+22+j*25));
      y += rowH; rule();
    });
    if (!d.details.length) { ctx.fillStyle='#777'; ctx.font='18px Arial'; ctx.fillText('Sin detalle de servicio.',pad+10,y+24); y+=34; }
    y += 28;

    section('Repuestos y materiales');
    ctx.fillStyle='#e7e8ea';ctx.fillRect(pad,y,W-pad*2,34);ctx.fillStyle='#222';ctx.font='bold 15px Arial';ctx.fillText('Descripción',pad+12,y+22);ctx.textAlign='center';ctx.fillText('Cant.',780,y+22);ctx.textAlign='right';ctx.fillText('Precio',970,y+22);ctx.fillText('Total',right-10,y+22);ctx.textAlign='left';y+=34;
    d.parts.forEach((p,i)=>{ctx.fillStyle=i%2?'#fff':'#fafafa';ctx.fillRect(pad,y,W-pad*2,39);ctx.fillStyle='#333';ctx.font='17px Arial';ctx.fillText(p.description,pad+12,y+25);ctx.textAlign='center';ctx.fillText(String(p.qty),780,y+25);ctx.textAlign='right';ctx.fillText(col(p.price),970,y+25);ctx.font='bold 17px Arial';ctx.fillText(col(p.qty*p.price),right-10,y+25);ctx.textAlign='left';y+=39;rule();});
    const moneyRow=(label,value,bold=false)=>{ctx.font=`${bold?'bold ':''}17px Arial`;ctx.fillStyle='#222';ctx.textAlign='right';ctx.fillText(label,970,y+26);ctx.fillText(col(value),right-10,y+26);ctx.textAlign='left';y+=37;};
    moneyRow('Subtotal repuestos',d.subtotal); moneyRow('IVA (13 %)',d.iva); moneyRow('Total repuestos',d.subtotal+d.iva,true); y+=22;

    section('Servicios de taller');
    const service=(label,value)=>{ctx.font='18px Arial';ctx.fillStyle='#333';ctx.fillText(label,pad+12,y+26);ctx.textAlign='right';ctx.font='bold 18px Arial';ctx.fillText(col(value),right-10,y+26);ctx.textAlign='left';y+=38;rule();};
    service('Mano de obra / servicios',d.mano); if(d.otros)service('Otros',d.otros); if(d.descuento)service('Descuento',-d.descuento);
    y += 28; ctx.fillStyle='#202224';ctx.fillRect(pad,y,W-pad*2,68);ctx.fillStyle='#fff';ctx.font='bold 24px Arial';ctx.fillText('TOTAL ESTIMADO',pad+24,y+43);ctx.textAlign='right';ctx.font='bold 31px Arial';ctx.fillText(col(d.total),right-20,y+45);ctx.textAlign='left';
    y += 95; ctx.fillStyle='#666';ctx.font='15px Arial';ctx.fillText('CASTELI Taller Automotriz · Detalle estimado del servicio para el cliente.',pad,y);

    const a=document.createElement('a');a.download=`Casteli_${d.plate.replace(/\s+/g,'_')}_detalle.png`;a.href=c.toDataURL('image/png',1);a.click();
  }

  function installDownload() {
    const old = $('#download-advance'); if (!old) return;
    const fresh = old.cloneNode(true); old.replaceWith(fresh);
    fresh.textContent = 'Descargar detalle para el cliente';
    fresh.addEventListener('click', downloadSummary);
    const note = $('#client-note');
    if (note) note.addEventListener('input', renderDetailPreview);
    renderDetailPreview();
  }

  document.addEventListener('DOMContentLoaded', () => { installSelectAll(); installDownload(); });
})();
