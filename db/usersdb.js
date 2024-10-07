// usersdb.js
const mongoose = require('mongoose');
const Schemas = require('./schemas');
const bcrypt = require('bcrypt');

class UsersDB {
  constructor() {
    const schemas = new Schemas();
    const userSchema = schemas.createUserSchema();
    this.User = mongoose.model('User ', userSchema);
  }

 
//регистрация пользователя
async registerUser    (user) {
    try {
    
      const hashedPassword = await bcrypt.hash(user.password, 10);
      console.log('reg user.password:', user.password);
      console.log('reg hashedPassword:', hashedPassword);      
      const newUser = await this.User.create({ _id: new mongoose.Types.ObjectId(), ...user, password: hashedPassword, role: 1, balance: 0 });
      return newUser;
    } catch (err) {
      console.error(err);
      return null;
    }
}

//авторизация пользователя+
async loginUser(username, password) {
    try {
      const user = await this.getUserByUsername(username.toLowerCase());
      if (!user) {
        return null;
      }
      if (!password || !user.password) {
        return null;
      }
      console.log('Пароль:', password);
      console.log('Хешированный пароль:', user.password);
      console.log('Пароль из базы:', user.password);
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('Результат сравнения:', isValidPassword);
      if (!isValidPassword) {
        return null;
      }
      return user;
    } catch (err) {
      console.error(err);
      return null;
    }
}
  
//получение пользователя по имени пользователя
async getUserByUsername(username) {
    try {
      const user = await this.User.findOne({ username: username.toLowerCase() });
      return user;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  //получение пользователя по ID
  async getUserById(id) {
    try {
      const user = await this.User.findById(id);
      return user;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

   //получение пользователя по email
  async getUserByEmail(email) {
    try {
      const user = await this.User.findOne({ email });
      return user;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}



  

module.exports = UsersDB;