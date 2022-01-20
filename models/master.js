const Sequelize = require('sequelize') ;

const sequelize = require('../utils/database') ;

const Master = sequelize.define('master', {
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
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Master ;