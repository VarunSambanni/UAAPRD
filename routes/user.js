const express = require('express') ;
const router = express.Router() ;

const userController = require('../controllers/user') ; 

router.get('/', userController.getIndex) ; 

router.post('/', userController.getItem) ; 

router.get('/downloadPdb', userController.getPdb) ;
router.post('/downloadPdb', userController.postPdb) ; 

router.get('/downloadPdf', userController.getPdf) ; 
router.post('/downloadPdf', userController.postPdf) ; 

module.exports = router ; 