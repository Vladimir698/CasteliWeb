'use strict';
const db = require('../models');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

exports.index = async (req,res) => {
  try {
    const [usuarios,roles] = await Promise.all([
      db.Usuario.findAll({ order:[['nombre','ASC']], raw:true }),
      db.Rol.findAll({ order:[['nombre','ASC']], raw:true })
    ]);
    const usuariosConRol=usuarios.map(u=>({...u,rolNombre:roles.find(r=>Number(r.id)===Number(u.rolId))?.nombre||'Sin rol'}));
    return res.render('usuarios/usuarios',{title:'Usuarios',usuarios:usuariosConRol,roles});
  } catch(e){ console.error(e); return res.status(500).send('Error cargando usuarios'); }
};

exports.crear = async (req,res) => {
  try {
    const nombre=String(req.body.nombre||'').trim();
    const usuario=String(req.body.usuario||'').trim();
    const password=String(req.body.password||'');
    const rolId=Number(req.body.rol_id)||null;
    if(!nombre||!usuario||password.length<8) return res.status(400).send('Nombre, usuario y una contraseña de al menos 8 caracteres son obligatorios.');
    const existe=await db.Usuario.findOne({where:{usuario:{[Op.iLike]:usuario}}});
    if(existe) return res.status(400).send('Ese nombre de usuario ya existe.');
    await db.Usuario.create({nombre,usuario,email:String(req.body.email||'').trim()||null,passwordHash:await bcrypt.hash(password,12),rolId,activo:true});
    return res.redirect('/usuarios?msg=creado');
  }catch(e){console.error(e);return res.status(500).send('Error creando usuario');}
};

exports.actualizar = async(req,res)=>{
  try{
    const u=await db.Usuario.findByPk(Number(req.params.id)); if(!u)return res.status(404).send('Usuario no encontrado');
    const data={nombre:String(req.body.nombre||'').trim(),usuario:String(req.body.usuario||'').trim(),email:String(req.body.email||'').trim()||null,rolId:Number(req.body.rol_id)||null};
    if(req.body.password) data.passwordHash=await bcrypt.hash(String(req.body.password),12);
    await u.update(data); return res.redirect('/usuarios?msg=actualizado');
  }catch(e){console.error(e);return res.status(500).send('Error actualizando usuario');}
};

exports.eliminar=async(req,res)=>{
  try{const u=await db.Usuario.findByPk(Number(req.params.id));if(!u)return res.status(404).send('Usuario no encontrado');await u.update({activo:false});return res.redirect('/usuarios?msg=eliminado');}
  catch(e){console.error(e);return res.status(500).send('Error desactivando usuario');}
};
