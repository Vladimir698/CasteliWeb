'use strict';
const norm=r=>String(r||'').trim().toLowerCase();
exports.requiereLogin=(req,res,next)=>{if(!req.session?.usuario)return res.redirect('/login');return next();};
exports.soloAdmin=(req,res,next)=>{if(!req.session?.usuario)return res.redirect('/login');if(norm(req.session.usuario.rol)!=='administrador')return res.status(403).render('auth/403',{layout:false});return next();};
exports.permitirRoles=(...roles)=>{const permitidos=roles.map(norm);return(req,res,next)=>{if(!req.session?.usuario)return res.redirect('/login');if(!permitidos.includes(norm(req.session.usuario.rol)))return res.status(403).render('auth/403',{layout:false});return next();};};
exports.soloMecanicoOAdmin=exports.permitirRoles('Administrador','Mecanico');
