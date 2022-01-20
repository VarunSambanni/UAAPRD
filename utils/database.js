const Sequelize = require('sequelize') ; 

const sequelize = new Sequelize('sql6465786', 'sql6465786', process.env.DATABASE_PASSWORD, {dialect: 'mysql', host: process.env.DATABASE_HOST,define: {
    timestamps: false 
}});

module.exports = sequelize ;
