const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

const configuration = {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset:'utf8mb4'
}

module.exports = mysql.createPool(configuration);