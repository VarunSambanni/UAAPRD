const Protein = require('../models/protein') ; 
const path = require('path') ;
const fs = require('fs') ; 

const mainPath = require('../utils/path') ; 

exports.getIndex = (req, res, next) => {
    res.render('index', {proteins: [], message:null}) ; 
}

exports.getItem = (req, res, next) => {
    let protein = req.body.protein ; 
    protein = protein.toLowerCase() ;  // CONVERTING ALL TO LOWER CASE, THEN CAPITALISING FIRST LETTER, TRIMMING
    protein = protein.charAt(0).toUpperCase() + protein.slice(1);
    protein = protein.trim() ;
    Protein.findAll({where: {name: protein}})
    .then(item => {
        if (item.length > 0){
            console.log("Proteins found: ", item) ; 
            res.render('index', {proteins: item, message: `${item.length} hits found`}) ; 
        }
        else 
        {
            res.render('index', {proteins: [], message:"No such protein found"}) ; 
        }
    })
    .catch(err => {
        console.log(err) ; 
    })
    
}

let pdfReqName = null ; 
// just pass paths in index.ejs download forms 
exports.postPdf = (req, res, next) => {
    const name = req.body.name ; 
    pdfReqName = name ; 
    res.redirect('downloadPdf') ; 
}

exports.getPdf = (req, res, next) => {
    console.log("Looking for pdfFile of: ", pdfReqName) ; 
    Protein.findOne({where: {name: pdfReqName}})
    .then(item => {
        if (item){
            /*
            var pdfPath = path.join(mainPath, item.pdfPath) ;
            var data = fs.readFileSync(pdfPath) ;
            res.contentType('application/pdf') ;
            pdfReqName = null ;  
            res.send(data);
            */
            var pdfPath = path.join(mainPath, item.pdfPath) ;
            var file = fs.createReadStream(pdfPath) ; 
            var stat = fs.statSync(pdfPath) ;
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${item.name}-RamPlot.pdf`);
            pdfReqName = null ;      
            file.pipe(res) ; 
        }
        else 
        {
            pdfReqName = null ; 
            res.render('index', {protein: null, message:"No such protein found"}) ; 
        }
    })
}

let pdbReqName = null; 

exports.postPdb = (req, res, next) => {
    const name = req.body.name ; 
    pdbReqName = name ; 
    res.redirect('downloadPdb') ; 
}

exports.getPdb = (req, res, next) => {
    console.log("Looking for pdfFile of: ", pdbReqName) ; 
    Protein.findOne({where: {name: pdbReqName}})
    .then(item => {
        if (item){
            /*var pdbPath = path.join(mainPath, item.pdbPath) ;
            var data = fs.readFileSync(pdbPath) ;
            res.contentType('application/pdb') ; 
            pdbReqName = null ; 
            res.send(data);*/
            var pdbPath = path.join(mainPath, item.pdbPath) ;
            var file = fs.createReadStream(pdbPath) ; 
            var stat = fs.statSync(pdbPath) ;
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Content-Type', 'application/text');
            res.setHeader('Content-Disposition', `attachment; filename=${item.name}-PDB.pdb`);
            pdbReqName = null ;      
            file.pipe(res) ; 
        }
        else 
        {
            pdbReqName = null ; 
            res.render('index', {protein: null, message:"No such protein found"}) ; 
        }
    })
}