//работа с ДБ MongoDB

//импорт библиотек
const mongoose = require('mongoose');

//подгрузка ENV
const { loadEnv } = require('../utilities/uenv');
loadEnv();
const MONGO_USER = process.env.MONGO_USER || 'root';
const MONGO_PASS = process.env.MONGO_PASS || 'password';
const MONGO_AUTHSOURCE = process.env.MONGO_AUTHSOURCE || 'admin';
const MONGO_AUTHMECHANISM = process.env.MONGO_AUTHMECHANISM || 'SCRAM-SHA-256';
const MONGO_URI = process.env.MONGO_URI;


//подключение к ДБ
const options = {
  user: MONGO_USER,
  pass: MONGO_PASS,
  authSource: MONGO_AUTHSOURCE,
  authMechanism: MONGO_AUTHMECHANISM
};

mongoose.connect(MONGO_URI); //mongoose.connect(MONGO_URI, options);

module.exports = mongoose;

