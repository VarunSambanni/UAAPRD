const Sequelize = require('sequelize') ;

const sequelize = require('../utils/database') ;

const Protein = sequelize.define('protein', {
    id : {
        type: Sequelize.INTEGER, 
        autoIncrement: true, 
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false 
    },
    uniprotId: {
        type: Sequelize.STRING,
        allowNull: false 
    },
    organism: {
        type: Sequelize.STRING,
        allowNull: false 
    },
    type:{
        type: Sequelize.STRING,
        allowNull: false 
    },
    mass: {
        type: Sequelize.STRING,
        allowNull: false
    },
    length: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    function: {
        type: Sequelize.STRING,
        allowNull: false
    },
    pdbPath: {
        type: Sequelize.STRING,
        allowNull: false
    },
    pdfPath: {
        type: Sequelize.STRING,
        allowNull: false
    },
    validity: {
        type: Sequelize.STRING,
        allowNull: false
    },
    score: {
        type: Sequelize.STRING,
        allowNull: false
    },
    x: {
        type: Sequelize.STRING,
        allowNull: false
    },
    y: {
        type: Sequelize.STRING,
        allowNull: false
    },
    z: {
        type: Sequelize.STRING,
        allowNull: false
    },
    residues: {
        type: Sequelize.STRING,
        allowNull: false
    },
    drivePdbId: {
        type: Sequelize.STRING,
        allowNull: true
    },
    drivePdfId: {
        type: Sequelize.STRING,
        allowNull: true
    } 
});

module.exports = Protein ;