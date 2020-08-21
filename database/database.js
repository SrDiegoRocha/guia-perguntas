const Sequelize = require('sequelize');
const connection = new Sequelize('guiaperguntas','root','rocha030604',{
    host: 'localhost',
    dialect: 'mysql'
})

module.exports = connection;