'use strict';
const { Op } = require('sequelize');
const { Cliente,Vehiculo,OrdenTrabajo,EstadoOrden,OrdenTrabajoDetalle,OrdenRepuesto }=require('../models');
const volver=(res,vehiculoId,anchor='reparacion-actual')=>res.redirect(`/vehiculos/${vehiculoId}#${anchor}`);

async function listarActivas(req,res){try{const ordenes=await OrdenTrabajo.findAll({include:[{model:Vehiculo,as:'vehiculo',include:[{model:Cliente,as:'cliente'}]},{model:EstadoOrden,as:'estado'}],order:[['fechaRecepcion','DESC']]});return res.render('ordenes/ordenes',{titulo:'Lista de reparaciones',ordenes:ordenes.filter(o=>!['Entregada','Cancelada'].includes(o.estado?.nombre))});}catch(e){console.error(e);return res.status(500).send(e.message);}}
async function mostrarFormularioNuevo(req,res){const vehiculo=await Vehiculo.findByPk(Number(req.params.vehiculoId),{include:[{model:Cliente,as:'cliente'}]});if(!vehiculo)return res.status(404).send('Vehículo no encontrado.');return res.render('ordenes/nuevaOrden',{titulo:'Nueva reparación',vehiculo,orden:{kilometraje_ingreso:vehiculo.kilometrajeActual},errores:[]});}
async function crear(req,res){try{const vehiculo=await Vehiculo.findByPk(Number(req.params.vehiculoId));if(!vehiculo)return res.status(404).send('Vehículo no encontrado.');const km=Number(req.body.kilometraje_ingreso);const problema=String(req.body.problema_reportado||'').trim();if(!Number.isFinite(km)||km<0||!problema)return res.status(400).send('Kilometraje y motivo de ingreso son obligatorios.');const estado=await EstadoOrden.findOne({where:{nombre:'Recibida'}});if(!estado)return res.status(500).send('Falta el estado Recibida.');await OrdenTrabajo.create({numeroOrden:await generarNumeroOrden(),vehiculoId:vehiculo.id,estadoId:estado.id,usuarioRecepcionaId:null,kilometrajeIngreso:km,problemaReportado:problema,observaciones:String(req.body.observaciones||'').trim()||null,prioridad:'Normal'});await vehiculo.update({kilometrajeActual:km});return volver(res,vehiculo.id);}catch(e){console.error(e);return res.status(500).send(e.message);}}
async function verDetalle(req,res){const orden=await OrdenTrabajo.findByPk(Number(req.params.id));if(!orden)return res.status(404).send('Orden no encontrada.');return volver(res,orden.vehiculoId);}

async function agregarTrabajo(req,res){
 try{
  const orden=await OrdenTrabajo.findByPk(Number(req.params.id));if(!orden)return res.status(404).send('Orden no encontrada.');
  const tipo=req.body.tipo==='realizado'?'realizado':'detectado';
  const entrada=String(req.body.descripcion||'').replace(/\r/g,'').trim();
  const lineas=entrada.split('\n').map(x=>x.replace(/^[-•✓*]\s*/,'').trim()).filter(Boolean);
  if(lineas.length) await OrdenTrabajoDetalle.bulkCreate(lineas.map(descripcion=>({ordenId:orden.id,usuarioId:req.session?.usuario?.id||null,descripcion,estado:tipo})));
  return volver(res,orden.vehiculoId,tipo==='detectado'?'lista-reparacion':'trabajo-realizado');
 }catch(e){console.error(e);return res.status(500).send('No fue posible guardar la lista.');}
}
async function agregarRepuesto(req,res){const orden=await OrdenTrabajo.findByPk(Number(req.params.id));if(!orden)return res.status(404).send('Orden no encontrada.');const descripcion=String(req.body.descripcion||'').trim();if(descripcion)await OrdenRepuesto.create({ordenId:orden.id,descripcion,cantidad:Number(req.body.cantidad)||1,precio:Number(req.body.precio)||0,descuento:0});return volver(res,orden.vehiculoId,'repuestos');}
async function actualizarTotales(req,res){const orden=await OrdenTrabajo.findByPk(Number(req.params.id));if(!orden)return res.status(404).send('Orden no encontrada.');await orden.update({manoObra:Number(req.body.mano_obra)||0,otros:Number(req.body.otros)||0,descuento:Number(req.body.descuento)||0});return volver(res,orden.vehiculoId,'cuenta-taller');}
async function generarNumeroOrden(){const anio=new Date().getFullYear();const ultima=await OrdenTrabajo.findOne({where:{numeroOrden:{[Op.like]:`OT-${anio}-%`}},order:[['id','DESC']]});const n=ultima?Number(ultima.numeroOrden.split('-')[2]||0)+1:1;return `OT-${anio}-${String(n).padStart(4,'0')}`;}
module.exports={listarActivas,mostrarFormularioNuevo,crear,verDetalle,agregarTrabajo,agregarRepuesto,actualizarTotales};
