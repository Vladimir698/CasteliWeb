'use strict';

exports.requiereLogin = (req,res,next) => {
  if (process.env.DEV_MODE === 'true') {
    // Usuario de interfaz solamente. id=null evita usar un usuario ficticio
    // como llave foránea en registros del taller.
    req.session.usuario = { id:null, nombre:'Administrador', usuario:'admin', rol:'Administrador', esDesarrollo:true };
    return next();
  }
  if(!req.session.usuario) return res.redirect('/login');
  return next();
};
exports.soloAdmin=(req,res,next)=>{if(!req.session.usuario||req.session.usuario.rol!=='Administrador')return res.status(403).send('No tiene permisos para acceder a esta sección.');return next();};
exports.permitirRoles=(...roles)=> (req,res,next)=>{if(!req.session.usuario)return res.redirect('/login');if(!roles.includes(req.session.usuario.rol))return res.status(403).send('No tiene permisos para acceder a esta sección.');return next();};
