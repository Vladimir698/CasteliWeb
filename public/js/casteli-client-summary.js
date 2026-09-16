(() => {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const num = v => Number(String(v ?? '').replace(/[^0-9.-]/g, '')) || 0;
  const col = n => '₡' + Number(n || 0).toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  function installSelectAll() {
    const section = $('#repuestos');
    if (!section || $('.select-all-parts', section)) return;
    const manualForm = $('form[action*="/repuestos"]', section);
    if (!manualForm) return;
    const match = manualForm.getAttribute('action').match(/^\/ordenes\/(\d+)\/repuestos$/);
    if (!match) return;
    const list = $('.parts-from-work', section);
    if (!list) return;
    const pending = $$('.part-pick:not(.selected)', list).length;
    if (!pending) return;
    const form = document.createElement('form');
    form.action = `/ordenes/${match[1]}/repuestos/todos`;
    form.method = 'POST';
    form.className = 'select-all-parts';
    form.innerHTML = `<button type="submit" class="btn btn-dark">✓ Agregar todo al cobro</button><small>Agrega de una vez los ${pending} elementos que todavía no están en repuestos.</small>`;
    list.parentNode.insertBefore(form, list);
  }

  function getData() {
    const hero = $('.vehicle-sheet-hero');
    const title = $('h1', hero)?.textContent.trim() || '';
    const model = $('p', hero)?.textContent.trim() || '';
    const owner = hero ? $$('strong', hero).pop()?.textContent.trim() || '' : '';
    const repair = $('#reparacion-actual');
    const order = repair ? $('h3', repair)?.textContent.trim() || '' : '';
    const summaryStrong = repair ? $$('.repair-summary strong', repair) : [];
    const km = summaryStrong[1]?.textContent.trim() || '';
    const note = ($('#client-note')?.value || '').trim();
    let details = note.split(/\r?\n/).map(x => x.replace(/^[-•✓*\d.)\s]+/, '').trim()).filter(Boolean);
    if (details.length <= 1 && note.length > 90) details = note.split(/(?<=[.;])\s+(?=[A-ZÁÉÍÓÚÑ])/).map(x => x.trim()).filter(Boolean);
    if (!details.length) {
      details = $$('#trabajo-realizado .mechanic-item strong').map(x => x.textContent.trim()).filter(Boolean);
    }
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
    return { plate: title, model, owner, order, km, details, parts, subtotal, iva, mano, otros, descuento, total };
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
    probe.font = '20px Arial';
    const detailLines = d.details.reduce((n, x) => n + wrapLines(probe, x, 940).length, 0);
    const H = Math.max(1350, 590 + detailLines * 34 + d.parts.length * 43 + (d.otros ? 42 : 0) + (d.descuento ? 42 : 0));
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#202224'; ctx.fillRect(0, 0, W, 155);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 50px Arial'; ctx.fillText('CASTELI', pad, 68);
    ctx.font = '15px Arial'; ctx.letterSpacing = '5px'; ctx.fillText('TALLER AUTOMOTRIZ', pad + 4, 100);
    ctx.font = '16px Arial'; ctx.fillStyle = '#d8d8d8'; ctx.fillText('MANTENIMIENTO   |   DIAGNÓSTICO   |   REPARACIÓN', pad, 132);
    ctx.textAlign = 'right'; ctx.font = '18px Arial'; ctx.fillStyle = '#fff'; ctx.fillText('San Isidro de Heredia, Costa Rica', right, 58); ctx.fillText('Detalle para el cliente', right, 92); ctx.textAlign = 'left';

    let y = 215;
    ctx.fillStyle = '#111'; ctx.font = 'bold 32px Arial'; ctx.fillText(`${d.plate} · ${d.model}`, pad, y);
    ctx.font = '21px Arial'; ctx.fillStyle = '#555'; ctx.fillText(d.owner, pad, y + 35);
    ctx.textAlign = 'right'; ctx.font = '18px Arial'; ctx.fillStyle = '#333'; ctx.fillText(`Fecha: ${new Date().toLocaleDateString('es-CR')}`, right, y); if (d.order) ctx.fillText(`Orden: ${d.order}`, right, y + 30); if (d.km) ctx.fillText(`Kilometraje: ${d.km}`, right, y + 60); ctx.textAlign = 'left';
    y += 100; ctx.strokeStyle = '#999'; ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(right, y); ctx.stroke(); y += 45;

    const section = t => { ctx.fillStyle = '#111'; ctx.font = 'bold 27px Arial'; ctx.fillText(t, pad, y); y += 34; };
    const tableHead = cols => { ctx.fillStyle = '#e7e8ea'; ctx.fillRect(pad, y, W - pad * 2, 35); ctx.fillStyle = '#222'; ctx.font = 'bold 16px Arial'; cols.forEach(c => { ctx.textAlign = c.align || 'left'; ctx.fillText(c.t, c.x, y + 23); }); ctx.textAlign = 'left'; y += 35; };
    const rule = () => { ctx.strokeStyle = '#d5d5d5'; ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(right, y); ctx.stroke(); };

    section('Detalle de servicio');
    tableHead([{t:'#',x:pad+15},{t:'Descripción',x:pad+70}]);
    ctx.font = '18px Arial';
    d.details.forEach((item, i) => { const lines = wrapLines(ctx, item, 930); const rowH = Math.max(36, lines.length * 27 + 9); ctx.fillStyle = i % 2 ? '#fff' : '#fafafa'; ctx.fillRect(pad, y, W-pad*2, rowH); ctx.fillStyle='#333'; ctx.fillText(String(i+1), pad+18, y+24); lines.forEach((line,j)=>ctx.fillText(line,pad+70,y+24+j*27)); y += rowH; rule(); });
    if (!d.details.length) { ctx.fillStyle='#777'; ctx.fillText('Sin detalle adicional.',pad+15,y+25); y+=40; }
    y += 38;

    section('Repuestos y materiales');
    tableHead([{t:'#',x:pad+15},{t:'Descripción',x:pad+65},{t:'Cantidad',x:760,align:'center'},{t:'Precio unitario',x:970,align:'right'},{t:'Total',x:right-10,align:'right'}]);
    d.parts.forEach((p,i)=>{ctx.fillStyle=i%2?'#fff':'#fafafa';ctx.fillRect(pad,y,W-pad*2,42);ctx.fillStyle='#333';ctx.font='17px Arial';ctx.textAlign='left';ctx.fillText(String(i+1),pad+18,y+27);ctx.fillText(p.description,pad+65,y+27);ctx.textAlign='center';ctx.fillText(String(p.qty),760,y+27);ctx.textAlign='right';ctx.fillText(col(p.price),970,y+27);ctx.font='bold 17px Arial';ctx.fillText(col(p.qty*p.price),right-10,y+27);ctx.textAlign='left';y+=42;rule();});
    const moneyRow=(label,value,bold=false)=>{ctx.font=`${bold?'bold ':''}18px Arial`;ctx.fillStyle='#222';ctx.textAlign='right';ctx.fillText(label,970,y+28);ctx.fillText(col(value),right-10,y+28);ctx.textAlign='left';y+=40;};
    moneyRow('Subtotal repuestos',d.subtotal); moneyRow('IVA (13 %)',d.iva); moneyRow('Total repuestos',d.subtotal+d.iva,true); y+=30;

    section('Servicios de taller');
    tableHead([{t:'Descripción',x:pad+15},{t:'Total',x:right-10,align:'right'}]);
    const service=(label,value)=>{ctx.font='18px Arial';ctx.fillStyle='#333';ctx.fillText(label,pad+15,y+28);ctx.textAlign='right';ctx.font='bold 18px Arial';ctx.fillText(col(value),right-10,y+28);ctx.textAlign='left';y+=42;rule();};
    service('Mano de obra / servicios',d.mano); if(d.otros)service('Otros',d.otros); if(d.descuento)service('Descuento',-d.descuento);
    y += 35; ctx.fillStyle='#202224';ctx.fillRect(pad,y,W-pad*2,70);ctx.fillStyle='#fff';ctx.font='bold 25px Arial';ctx.fillText('TOTAL ESTIMADO',pad+25,y+44);ctx.textAlign='right';ctx.font='bold 32px Arial';ctx.fillText(col(d.total),right-20,y+46);ctx.textAlign='left';
    y += 105; ctx.fillStyle='#f6f6f6';ctx.fillRect(pad,y,W-pad*2,85);ctx.fillStyle='#222';ctx.font='bold 18px Arial';ctx.fillText('CASTELI Taller Automotriz',pad+20,y+32);ctx.font='16px Arial';ctx.fillStyle='#666';ctx.fillText('Gracias por confiar en nosotros · Este documento es un detalle estimado del servicio.',pad+20,y+60);
    const a=document.createElement('a');a.download=`Casteli_${d.plate.replace(/\s+/g,'_')}_detalle.png`;a.href=c.toDataURL('image/png',1);a.click();
  }

  function installDownload() {
    const old = $('#download-advance'); if (!old) return;
    const fresh = old.cloneNode(true); old.replaceWith(fresh);
    fresh.textContent = 'Descargar detalle para el cliente';
    fresh.addEventListener('click', downloadSummary);
  }

  document.addEventListener('DOMContentLoaded', () => { installSelectAll(); installDownload(); });
})();
