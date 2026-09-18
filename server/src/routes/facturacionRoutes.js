'use strict';
const express=require('express');
const c=require('../controllers/facturacionQuincenalController');
const {requiereLogin}=require('../middleware/authMiddleware');
const router=express.Router();
router.use(requiereLogin);
router.get('/',c.listar);
router.post('/:id/gti',c.enviarGTI);
module.exports=router;
