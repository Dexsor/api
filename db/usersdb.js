//userdb.js
const mongoose = require('mongoose');
const Schemas = require('./schemas');
const bcrypt = require('bcrypt');
const UWebToken = require('../utilities/uwebtoken'); 

//подгрузка ENV
const { loadEnv } = require('../utilities/uenv');
loadEnv();
const TOKEN_SECRET = process.env.TOKEN_SECRET|| "tokensecret123!";
const TOKEN_TIME = process.env.TOKEN_TIME|| 3600;

class UsersDB {
  constructor() {
    const schemas = new Schemas();
    const userSchema = schemas.createUserSchema();
    this.User = mongoose.model('User ', userSchema);
    this.tokenService = new UWebToken(TOKEN_SECRET); 
  }

  // Регистрация пользователя
  async registerUser (user) {
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser  = await this.User.create({
        _id: new mongoose.Types.ObjectId(),
        ...user,
        password: hashedPassword,
        role: 1,
        balance: 0,
      });
      return newUser ;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  // Авторизация пользователя
  async loginUser (username, password) {
    try {
      const user = await this.getUserByUsername(username.toLowerCase());
      console.log("getUserByUsername = "+ user.password);
      if (!user) {
        return null;
      }
      if (!password || !user.password) {
        return null;
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return null;
      }

      // Генерация токена
      const token = this.tokenService.sign({ id: user._id, username: user.username }, TOKEN_TIME); // Токен будет действовать 1 час
      return { user, token }; // Возвращаем пользователя и токен
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  // Получение пользователя по имени пользователя
  async getUserByUsername(username) {
    try {
      const user = await this.User.findOne({ username: username.toLowerCase() });
      return user;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  // Получение пользователя по ID
  async getUserById(id) {
    try {
      const user = await this.User.findById(id);
      return user;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  // Получение пользователя по _id
  async getUserBy_Id(_id) {
    try {
      const user = await this.User.findById(_id);
      return user;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  // Получение пользователя по email
  async getUserByEmail(email) {
    try {
      const user = await this.User.findOne({ email });
      return user;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  // Обновление пользователя
  async updateUser (userId, updateData) {
    try {
      const updatedUser  = await this.User.findByIdAndUpdate(userId, updateData, { new: true });
      return updatedUser ;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  // Удаление пользователя
  async deleteUser (userId) {
    try {
      const deletedUser  = await this.User.findByIdAndDelete(userId);
      return deletedUser ;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  // Получение всех пользователей
  async getAllUsers() {
    try {
      const users = await this.User.find({});
      return users;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}

module.exports = UsersDB;