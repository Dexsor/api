const mongoose = require('./db');
const Schemas = require('./schemas');


// ...

// Определяем класс FilmsDB
class FilmsDB {
  constructor() {
    const schemas = new Schemas();
    const filmSchema = schemas.createFilmSchema();
    const directorSchema = schemas.createDirectorSchema();
    const genreSchema = schemas.createGenreSchema();
    const countrySchema = schemas.createCountrySchema();

    // Создание моделей
    this.Film = mongoose.model('Film', filmSchema); // Создание модели Film
    this.Director = mongoose.model('Director', directorSchema); // Создание модели Director
    this.Genre = mongoose.model('Genre', genreSchema); // Создание модели Genre
    this.Country = mongoose.model('Country', countrySchema); // Создание модели Country
  }

  // Метод класса возвращает список фильмов
  async getFilms(skip, limit) {
    try {
      const films = await this.Film.find().skip(skip).limit(limit);
      return films || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  // Счетчик записей в ДБ, возвращает кол-во, целое число
  async getFilmsCount() {
    try {
      const count = await this.Film.countDocuments();
      return count || 0;
    } catch (err) {
      console.error(err);
      return 0;
    }
  }

  // Метод класса возвращает карточку конкретного фильма
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

  // Запись в ДБ нового фильма
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

  // Обновление данных о фильме в ДБ
  async updateFilm(id, film) {
    try {
      const updatedFilm = await this.Film.findOneAndUpdate({ id }, film, { new: true });
      return updatedFilm;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  // Удаление фильма из ДБ
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