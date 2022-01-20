const express = require('express') ;
require('dotenv').config()
const app = express() ;
const session = require('express-session') ;
const cookieParser = require('cookie-parser') ;
const fs = require('fs') ; 

const path = require('path') ; 

const { v4: uuidv4 } = require('uuid') ;
const multer = require('multer')
const compression = require('compression') ;
const morgan = require('morgan') ; 

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

const sequelize = require('./utils/database') ;

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'pdbs') ;
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + '-' + file.originalname) ;  
  }
}) ;

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype === 'application/octet-stream'){  // PDB AND PDFS CHECK 
    cb(null, true) ;
  }
  else 
  {
    cb(null, false) ;
  }
}

app.set('view engine', 'ejs')   ;
app.set('views', 'views') ; 

console.log(process.env) ; 
app.use(express.static(path.join(__dirname, 'public')));  //To serve read access to specific folders

const userRoutes = require('./routes/user') ; 
const adminRoutes = require('./routes/admin') ; 

const errorController = require('./controllers/error') ; 
/*
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {
  flags: 'a' // append
}) ;
*/
app.use(compression()) ;
/*
app.use(morgan('combined', {stream: accessLogStream})) ; 
*/
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).any()) ; 
app.use('/pdbs', express.static(path.join(__dirname, 'pdbs')));

app.use(cookieParser()) ; 

app.use(session({
  secret: 'mysecret',
  saveUninitialized: true,
  cookie: {maxAge: 3600*1000},
  resave: false 
}))


app.use('/user', userRoutes) ; 
app.use('/admin', adminRoutes) ; 

app.use(errorController.get404) ; 

app.use((error, req, res, next)=> {
  console.log("Error: ") ;
  console.log(error) ;
  console.log("errors: ", error.messages) ; 
  res.status(500).render('500', {errors: error.messages}) ; 
})

sequelize
.sync()
.then(result => {
  app.listen(process.env.PORT || 4000, () => {
    console.log("Server listening on 4000...") ;
  });
})
.catch(err => {
  console.log(err) ; 
})
