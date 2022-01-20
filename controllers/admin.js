const path = require('path') ;
const fs = require('fs') ;

const mainPath = require('../utils/path') ; 

const {google} = require('googleapis') ;
/*
*/
const {validationResult} = require('express-validator/check') ;

const bcrypt = require('bcryptjs') ;
const jwt = require('jsonwebtoken')

const isAuth = require('../middleware/isAuth') ; 
const Protein = require("../models/protein");   
const Master = require('../models/master') ;
const { driveactivity } = require('googleapis/build/src/apis/driveactivity');

// GOOGLE DRIVE UPLOADS

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
) ;

oauth2Client.setCredentials({refresh_token: process.env.REFRESH_TOKEN, expiry_date: (new Date()).getTime() + 1000*60*60*24*500}) ;

// Initialising drive 

const drive = google.drive({
    version: 'v3', 
    auth: oauth2Client
}) ; 

let globalDriveLinkPdb = null ;
let globalDriveLinkPdf = null ; 

async function uploadFile(localFilePath, mimeType, name, linkObj)
{
    try // Uploading file 
    {
        const response = await drive.files.create({
            requestBody: {
                name: name,
                mimeType: mimeType
            },
            media: {
                mimeType: mimeType,
                body: fs.createReadStream(localFilePath) 
            }
        })
        console.log("Drive data", response.data.id) ;
        if (mimeType === 'application/pdf')
        {
            await generatePublicUrlPdf(response.data.id, linkObj) ;  
        }
        else if (mimeType === 'application/octet-stream')
        {
            await generatePublicUrlPdb(response.data.id, linkObj) ; 
        }  
    }
    catch (error)
    {
        console.log(error) ; 
        console.log("ERROR UPLOADING TO GOOGLE DRIVE") ; 
    }
}

async function deleteFileDrive(driveFileId) 
{
    try {
        const response = await drive.files.delete({
            fileId: driveFileId
        });
        console.log("Deleting: ", driveFileId) ; 
        console.log(response.data, response.status)
    }
    catch(error){
        console.log(error) ; 
    }
}

async function generatePublicUrlPdf(driveFileId, linkObj){
    try {
        const fileId = driveFileId ;
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        })
        const result = await drive.files.get({
            fileId: fileId, 
            fields: 'webContentLink'
        })
        linkObj.pdf = result.data.webContentLink ;  
    }
    catch(error)
    {
        console.log(error.message) ; 
    }
}

async function generatePublicUrlPdb(driveFileId, linkObj){
    try {
        const fileId = driveFileId ;
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        })
        const result = await drive.files.get({
            fileId: fileId, 
            fields: 'webContentLink'
        })
        linkObj.pdb = result.data.webContentLink ;  
    }
    catch(error)
    {
        console.log(error.message) ; 
    }
}

exports.getLogin = (req, res, next) => {
    res.render('login') ;  
}

let token = null ; 
var session ; 
exports.postLogin = (req, res, next) =>{
    const password = req.body.password ;
    /*
    const tempPwd = "" ; 
    bcrypt.hash(tempPwd, 12)
    .then(hashedPassword => {
        console.log("Hashed Password: ", hashedPassword) ;
        
    })
    */
    Master.findOne({where: {name: 'varun'}})
    .then(user => {
        console.log("Found user!!!!") ; 
        bcrypt.compare(password, user.password)
        .then(doMatch => {
            if (doMatch)
            {
                console.log('PASSWORD MATCHED!') ; 
                session = req.session ; 
                console.log(req.session) ; 
                req.session.isLoggedIn = true ;
                req.session.user = user ; 
                res.render('admin', {token: token}) ; 
            }
            else 
            {
                res.redirect('/admin/login') ; 
            }
        })
    })
    .catch(err => {
        console.log(err) ; 
    })
                 // USE BCRYPYT TO CHECK FOR HASHED PASSWORD
    {
        /*
        token = jwt.sign({    // GENERATING JWT TOKEN 
            user: 'Admin',
        }, 'secret', {expiresIn: '1h'})
        req.token = token ; 
        console.log("Token genereated: ", token) ; */ 
    }

}

exports.getModify = (req, res, next) => {
    res.render('admin') ; 
}

exports.getMethod = (req, res, next) => {
    const method = req.body.method ;
    const token = req.body.token ;
    console.log("Selected method: ", method) ;
    req.session.isLoggedIn = true ;
    if (method === 'create')
    {
       res.redirect('/admin/modify/create');
    }
    else if (method === 'update')
    {
       res.redirect('/admin/modify/update');
    }
    else if (method === 'delete')
    {
         res.redirect('/admin/modify/delete');
    }
    else 
    {
        res.render('404') ; 
    }
}

exports.getCreateProtein = (req, res, next) => {
    res.render('create') ; 
}
exports.postCreateProtein = (req, res, next) => {
    const errors = validationResult(req) ;
    if(!errors.isEmpty() || !req.files[0] || !req.files[1])
    {
        console.log("Validation Errors: ", errors) ;  
        if (req.files[0])
        {
            deleteFile(req.files[0].path) ;
        }
        else 
        {
            return res.status(500).render('500', {errors: ["No Pdb file uploaded or uploaded wrong files"]}) ;   
        }
        if (req.files[1])
        {
            deleteFile(req.files[1].path) ; 
        }
        else 
        {
            return res.status(500).render('500', {errors: ["No Pdf file uploaded or uploaded wrong files"]}) ;   
        }
        return res.status(500).render('500', {errors: [errors.array()[0].msg]}) ;   
    }
    console.log("Request to create protein: ", req.name) ; 
    console.log("req.files: ", req.files) ;
    let name = req.body.name ; 
    const uniprotId = req.body.uniprotId ; 
    const organism = req.body.organism ; 
    const type = req.body.type ; 
    const mass = req.body.mass ; 
    const length = req.body.length ; 
    const func = req.body.function ; 
    const pdb = req.files[0] ; 
    const pdf = req.files[1] ; 
    const pdbPath = pdb.path ; 
    const pdfPath = pdf.path ; 
    const validity = req.body.validity ; 
    const score = req.body.score ;
    const x = req.body.x ;
    const y = req.body.y ;
    const z = req.body.z ;
    const residues = req.body.residues ; 
    name = name.toLowerCase() ;  // CONVERTING ALL TO LOWER CASE, THEN CAPITALISING FIRST LETTER, TRIMMING
    name = name.charAt(0).toUpperCase() + name.slice(1);
    name = name.trim() ;
    console.log(name) ; 
    Protein.findOne({where: {name: uniprotId}})
    .then(item => {
        if (item){
            console.log("UNIPROTID ", uniprotId, " ALREADY EXISTS") ; 
            if (pdbPath)
            {
                deleteFile(pdbPath) ;
            }
            if (pdfPath)
            {
                deleteFile(pdfPath) ; 
            }
            return res.render('500', {errors: ['Protein with the UNIPROTID already exists']}); 
        }
        else {
            var linkObj = {pdf: null, pdb: null} ; 
            uploadFile(pdfPath, 'application/pdf', name+uniprotId+'pdf', linkObj) // async function returning a promise here
            .then(result => {
                return uploadFile(pdbPath, 'application/octet-stream', name+uniprotId+'pdb'+'.pdb', linkObj) ; 
            })
            .then(result => {
                console.log("PDB PUBLIC URL GENERATE", linkObj.pdb) ;
                console.log("PDF PUBLIC URL GENERATRED ", linkObj.pdf) ; 
                Protein.create({
                name: name,
                uniprotId: uniprotId,
                organism: organism,
                type: type,
                mass: mass,
                length: length,
                function: func,
                pdbPath: pdbPath,
                pdfPath: pdfPath,
                validity: validity,
                score: score,
                x: x,
                y: y,
                z: z, 
                residues: residues,
                drivePdbId: linkObj.pdb, 
                drivePdfId: linkObj.pdf
                })
                .then(result => {
                    // NEED TO TAKE THE FILES FROM pdbs folder and upload it to google drive, and make the url a public url 
                    deleteFile(pdbPath) ; // Clearing these files from local server storage, after done uploading them 
                    deleteFile(pdfPath) ; 
                    console.log("PROTEIN CREATED") ;
                    res.redirect('create') ; 
                })
                .catch(err => {
                    const error = new Error(err) 
                    error.httpStatusCode = 500 ;
                    error.messages = [err] ;  
                    return next(error) ;
                })
            })
        }
        })
        .catch(err => {
            const error = new Error(err) 
            error.httpStatusCode = 500 ;
            error.messages = [err] ;  
            return next(error) ;
        })
}

exports.getUpdateProtein = (req, res, next) => {
    res.render('update', {displayMode: false, editMode: false, proteins: []}) ; 
}

let updateProtein = null ; 

exports.postUpdateProtein = (req, res, next) => {
    let name = req.body.name ;
    name = name.toLowerCase() ;  // CONVERTING ALL TO LOWER CASE, THEN CAPITALISING FIRST LETTER, TRIMMING
    name = name.charAt(0).toUpperCase() + name.slice(1);
    name = name.trim() ;
    console.log("update protein request: ", name) ;
    console.log("Display mode: ", (req.body.displayMode)) ; 
    if (req.body.displayMode == 'true'){ 
        console.log("Reached on displayMode ") ; 
        Protein.findAll({where: {name: name}})
        .then(proteins => {
            if (proteins.length > 0)
            {
                req.updateProtein = name ; 
                updateProtein = name ; 
                res.render('update', {displayMode: true, editMode: false, proteins: proteins, proteinName: name}) ; 
            }
            else 
            {
                console.log("PROTEIN DOESN'T EXIST") ; 
                res.status(500).render('500',  {errors: ['Protein does not exist']}) ; 
            }
        })
        .catch(err => {
            console.log(err) ; 
        })
    }
    else 
    {
        const id = req.body.id ; 
        console.log("Requesting for updating PROTEIN ID: ", id)  ; 
        Protein.findByPk(id)
        .then(protein => {
            if (protein)
            {
                req.updateProtein = name ; 
                updateProtein = name ; 
                res.render('update', {displayMode: false, editMode: true, protein: protein, proteinName: name}) ; 
            }
            else 
            {
                console.log("PROTEIN DOESN'T EXIST") ; 
                res.status(500).render('500',  {errors: ['Protein does not exist']}) ; 
            }
        })
        .catch(err => {
            console.log(err) ; 
        })
    }
}

exports.postUpdateForm = (req, res, next) => {
    const errors = validationResult(req) ;

    if(!errors.isEmpty())
    {
        console.log("Validation Errors from Update Form: ", errors) ;  
        if (req.files[0])
        {
            deleteFile(req.files[0].path) ;
        }
        if (req.files[1])
        {
            deleteFile(req.files[1].path) ; 
        }
        return res.status(500).render('500', {errors: [errors.array()[0].msg]}) ;   
    }
    console.log("protein name: ", req.body.name) ; 
    let updatedName = req.body.name ;
    updatedName = updatedName.toLowerCase() ;  // CONVERTING ALL TO LOWER CASE, THEN CAPITALISING FIRST LETTER, TRIMMING
    updatedName = updatedName.charAt(0).toUpperCase() + updatedName.slice(1);
    updatedName = updatedName.trim() ;
    const proteinId = req.body.id; 
    console.log("In the form trying to update: ", updatedName) ; 
    console.log("protein : ", req.body) ; 
    const updatedUniprotId = req.body.uniprotId ;
    const updatedOrganism = req.body.organism ;
    const updatedType = req.body.type ;
    const updatedMass = req.body.mass ;
    const updatedLength = req.body.length ;
    const updatedFunction = req.body.function ;
    const updatedScore = req.body.score ;
    const updatedX = req.body.x ;
    const updatedY = req.body.y ;
    const updatedZ = req.body.z ;
    const updatedResidues = req.body.residues ; 
    var updatedPdb ;
    var updatedPdf ;
    var updatedPdbPath = null ;
    var updatedPdfPath = null ; 
    if (req.files[0] && req.files[0].mimetype === 'application/octet-stream'){
        updatedPdb = req.files[0] ; 
        updatedPdbPath = updatedPdb.path ; 
    }
    else
    {
        updatedPdb = null ;
    }
    if (req.files[0] && req.files[0].mimetype === 'application/pdf')
    {
        updatedPdf = req.files[0] ; 
        updatedPdfPath = updatedPdf.path ; 
    }
    else 
    {
        updatedPdfPath = null ; 
    }
    if (req.files[1])
    {
        updatedPdf = req.files[1] ;
        updatedPdfPath = updatedPdf.path ; 
    }
    else 
    {
        updatedPdf = null ; 
    }
    const updatedValidity = req.body.validity ;
    console.log("POST UPDATE FORM, proteinId: ", proteinId) ; 
    var linkObjUpdate = {pdf: null, pdb: null} ; 
    Protein.findByPk(proteinId)
    .then (protein => {
        protein.name = updatedName ;
        protein.uniprotId = updatedUniprotId ;
        protein.organism = updatedOrganism ;
        protein.type = updatedType ;
        protein.mass = updatedMass ;
        protein.length = updatedLength ;
        protein.function = updatedFunction ;
        protein.validity = updatedValidity ; 
        protein.score = updatedScore ;
        protein.x = updatedX ;
        protein.y = updatedY ; 
        protein.z = updatedZ ; 
        protein.residues = updatedResidues ; 
        if (updatedPdbPath)
        {
            console.log("Deleting: ", protein.pdbPath) ; 
            //deleteFile(protein.pdbPath) ; //Done right after creating protein in database, as this was just server local file 
            //deleteFileDrive(protein.drivePdbId) ; // Deleting from google drive
            protein.pdbPath = updatedPdbPath ;
            uploadFile(updatedPdbPath, 'application/octet-stream', protein.name+protein.uniprotId+'pdb'+ '.pdb', linkObjUpdate) 
            .then(result => {

                if (updatedPdfPath)
                {
                    console.log("Deleting: ", protein.pdfPath) ; 
                    //deleteFile(updatedPdfPath) ;   
                    //deleteFileDrive(protein.drivePdfId) ; // Deleting from google drive 
                    protein.pdfPath = updatedPdfPath ;
                    return uploadFile(updatedPdfPath, 'application/pdf', protein.name+protein.uniprotId+'pdf', linkObjUpdate)
                }       
            })
            .then(result => {
                protein.drivePdbId = linkObjUpdate.pdb ;
                protein.drivePdfId = linkObjUpdate.pdf ;
                console.log("Protein drivePdfId: ", linkObjUpdate.pdf) ; 
                return protein.save() ;
            })
            .catch(err => {
                console.log(err) ; 
            })
            return protein.save() ; 
        }
        else 
        {
            if (updatedPdfPath)
            {
                console.log("Deleting: ", protein.pdfPath) ; 
                //deleteFile(protein.pdfPath) ;   
                //deleteFileDrive(protein.drivePdfId) ; // Deleting from google drive 
                protein.pdfPath = updatedPdfPath ;
                uploadFile(updatedPdfPath, 'application/pdf', protein.name+protein.uniprotId+'pdf', linkObjUpdate)
                .then(result => {
                    protein.drivePdfId = linkObjUpdate.pdf ;
                    console.log("Protein drivePdfId: ", linkObjUpdate.pdf) ;
                    return protein.save() ; 
                })
            } 
            return protein.save() ;      
        } 
    })
    .then(result => {   // Deleting update files, after them being uploaded to google drive 
        if (updatedPdfPath)
        {
           //deleteFile(updatedPdfPath) ;
        }
        if (updatedPdbPath)
        {
            //deleteFile(updatedPdbPath) ; 
        }
        console.log("UPDATED PROTEIN") ;
        res.redirect('update') ;
    })
    .catch(err => {
        console.log(err) ; 
    })
}   

exports.getDeleteProtein = (req, res, next) => {
    res.render('delete') ; 
}
exports.postDeleteProtein = (req, res, next) => {
    let uniprotId = req.body.uniprotId ;
    uniprotId = uniprotId.toLowerCase() ;  // CONVERTING ALL TO LOWER CASE, THEN CAPITALISING FIRST LETTER, TRIMMING
    uniprotId = uniprotId.charAt(0).toUpperCase() + uniprotId.slice(1);
    uniprotId = uniprotId.trim() ;
    let redirection = true ;
    Protein.findOne({where: {uniprotId: uniprotId}})
    .then(protein => {
        if (protein){
            deleteFileDrive(protein.drivePdbId)
            deleteFileDrive(protein.drivePdfId) ; 
            return protein.destroy() ;
        }
        else 
        {
            console.log("PROTEIN DOESN'T EXIST") ; 
            redirection = false ;
            res.status(500).render('500',  {errors: ['Protein does not exist']}) ; 
        }
    })
    .then(result => {
        console.log("PROTEIN DELETED") ;  
        if (redirection){ // Cannot set headers after they are sent to the client
            res.redirect('delete') ;  
        } 
    })
    .catch(err => {
        console.log(err) ; 
    })
}

const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err)
        {
            throw (err) ; 
        }
    })
}