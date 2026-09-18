'use strict';
const express=require('express');
const c=require('../controllers/facturacionQuincenalController');
const {requiereLogin,soloAdmin}=require('../middleware/authMiddleware');
const router=express.Router();
router.use(requiereLogin,soloAdmin);
router.get('/',c.listar);
router.post('/:id/gti',c.enviarGTI);
module.exports=router;
