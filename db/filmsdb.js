
const mongoose = require('./db');
const Schemas = require('./schemas');

// ...



//опредеяем класс FilmsDB
class FilmsDB {
  constructor() {
    const schemas = new Schemas();
    const filmSchema = schemas.createFilmSchema();
    this.Film = mongoose.model('Film', filmSchema); //создание модели Film

  }

  //метод класса возвращает список фильмов,
  //skip кол-во записей пропустить перед выборкой
  //limit кол-во записей выдать, ответ массив
  async getFilms(skip, limit) {
    try {
      const films = await this.Film.find().skip(skip).limit(limit);
      return films || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  //счетчик записей в ДБ, возвращает кол-во, целое число
  async getFilmsCount() {
    try {
      const count = await this.Film.countDocuments();
      return count || 0;
    } catch (err) {
      console.error(err);
      return 0;
    }
  }

  //метод класса возвращает карточку конкретного фильма,
  //поиск идет по id, не путать с _id
  async getFilm(id) {
    try {
      if (typeof id !== 'number') {
        throw new Error('Недопустимый идентификатор');
      }
      const film = await this.Film.findOne({ id });
      return film;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  //запись в ДБ нового фильма, _id-от монго, id-целое число исходя из нумерации попорядку
  async addFilm(film) {
    try {
      const films = await this.Film.find().sort({ id: 1 });
      const lastId = films.length + 1;
      const newFilm = { ...film, id: lastId, _id: new mongoose.Types.ObjectId(), rating: 0, views: 0 };
      const result = await this.Film.create(newFilm);
      return result;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
  

  //обновление данных о фильме в ДБ
  async updateFilm(id, film) {
    try {
      const updatedFilm = await this.Film.findOneAndUpdate({ id }, film, { new: true });
      return updatedFilm;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  //удаление фильма из ДБ
  async deleteFilm(id) {
    try {
      await this.Film.findOneAndRemove({ id });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}

module.exports = FilmsDB;