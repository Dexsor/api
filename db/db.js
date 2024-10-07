//работа с ДБ MongoDB

//импорт библиотек
const mongoose = require('mongoose');

//подключение к ДБ
const options = {
  user: 'root',
  pass: 'Asdewq123',
  authSource: 'admin',
  authMechanism: 'SCRAM-SHA-256'
};

mongoose.connect('mongodb://127.0.0.1:27017/mydatabase', options);

module.exports = mongoose;