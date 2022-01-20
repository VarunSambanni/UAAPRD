const express = require('express') ;
const router = express.Router() ;

const {body} = require('express-validator/check') ; 

const adminController = require('../controllers/admin') ;

const isAuth = require('../middleware/isAuth') ; 

router.get('/login', adminController.getLogin) ;

router.post('/login', adminController.postLogin) ; 

router.get('/modify', isAuth, adminController.getModify) ; 
router.post('/modify', isAuth, adminController.getMethod) ; 

router.get('/modify/create' ,isAuth, adminController.getCreateProtein) ;
router.post('/modify/create',isAuth,
    [
        body('name').isString().isLength({min: 3}).trim(),
        body('uniprotId').isString().isLength({min: 3}).trim(),
        body('organism').isString().isLength({min: 3}).trim(),
        body('type').isString().isLength({min: 3}).trim(),
        body('mass').isString().isLength({min: 1}).trim(),
        body('length').isNumeric().isLength({min: 1}).trim(),
        body('function').isString().isLength({min: 3}).trim(),
        body('validity').isString().isLength({min: 1}).trim(),
        body('score').isString().isLength({min: 1}).trim(),
        body('x').isString().isLength({min: 1}).trim(), // CHECK VALIDATIONS 
        body('y').isString().isLength({min: 1}).trim(),
        body('z').isString().isLength({min: 1}). trim(),
        body('residues').isString().isLength({min: 1}).trim(), 
    ],  
    adminController.postCreateProtein) ;

router.get('/modify/update', isAuth, adminController.getUpdateProtein) ;
router.post('/modify/update', isAuth, adminController.postUpdateProtein) ;

router.get('/modify/delete', isAuth, adminController.getDeleteProtein) ;
router.post('/modify/delete', isAuth, adminController.postDeleteProtein) ; 

router.post('/modify/update-form', isAuth, 
    [
        body('name').isString().isLength({min: 3}).trim(),
        body('uniprotId').isString().isLength({min: 3}).trim(),
        body('organism').isString().isLength({min: 3}).trim(),
        body('type').isString().isLength({min: 3}).trim(),
        body('mass').isString().isLength({min: 1}).trim(),
        body('length').isNumeric().isLength({min: 1}).trim(),
        body('function').isString().isLength({min: 3}).trim(),
        body('validity').isString().isLength({min: 1}).trim(),
        body('score').isString().isLength({min: 1}).trim(),
        body('x').isString().isLength({min: 1}).trim(), // CHECK VALIDATIONS 
        body('y').isString().isLength({min: 1}).trim(),
        body('z').isString().isLength({min: 1}). trim(),
        body('residues').isString().isLength({min: 1}).trim(), 
    ],  
    adminController.postUpdateForm) ; 

module.exports = router ; 