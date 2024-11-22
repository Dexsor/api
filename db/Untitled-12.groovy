const mongoose = require('./db');
const Schemas = require('./schemas');

class FilmsDB {
  constructor() {
    const schemas = new Schemas();
    const filmSchema = schemas.createFilmSchema();
    const directorSchema = schemas.createDirectorSchema();
    const genreSchema = schemas.createGenreSchema();
    const countrySchema = schemas.createCountrySchema();

    this.Film = mongoose.model('Film', filmSchema);
    this.Director = mongoose.model('Director', directorSchema);
    this.Genre = mongoose.model('Genre', genreSchema);
    this.Country = mongoose.model('Country', countrySchema);
  }

  // Метод класса возвращает список фильмов
  async getFilms(skip, limit) {
  try {
    const films = await this.Film.find()
      .skip(skip)
      .limit(limit)
      .populate('director')
      .populate('country')
      .populate('genre');
      
    return films;
  } catch (err) {
    console.error(err);
    return [];
  }
}
 

  // Метод класса возвращает карточку конкретного фильма
  async getFilm(id) {
  try {
    const film = await this.Film.findById(id)
      .populate('director')
      .populate('country')
      .populate('genre');
      
    return film;
  } catch (err) {
    console.error(err);
    return null;
  }
}

  // Методы для фильмов
  async addFilm(film) {
    try {
      // Проверяем существование или создаем директора
      let director = await this.Director.findOne({ name: film.director });
      if (!director) {
        director = await this.addDirector({ name: film.director });
      }
  
      // Проверяем существование или создаем страну
      let country = await this.Country.findOne({ name: film.country });
      if (!country) {
        country = await this.addCountry({ name: film.country });
      }
  
      // Проверяем существование или создаем жанр
      let genre = await this.Genre.findOne({ name: film.genre });
      if (!genre) {
        genre = await this.addGenre({ name: film.genre });
      }
  
      // Получаем количество существующих фильмов для генерации нового id
      const filmsCount = await this.Film.countDocuments();
      const newId = filmsCount + 1; // Генерируем новый id
  
      // Создаем новый фильм с существующими/новыми сущностями
      const newFilm = new this.Film({
        id: newId, // Устанавливаем новый id
        name: film.name,
        year: film.year,
        director: director._id,
        country: country._id,
        genre: genre._id,
        rating: 0,
        views: 0,
      });
  
      const result = await newFilm.save();
      return result;
    } catch (err) {
      console.error(err);
      return null;
    }
  }




  async updateFilm(id, film) {
    try {
      const updatedFilm = await this.Film.findOneAndUpdate({ id }, film, { new: true });
      return updatedFilm;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async deleteFilm(id) {
    try {
      await this.Film.findOneAndRemove({ id });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  // Методы для стран
  async addCountry(country) {
  try {
    // Проверяем, существует ли страна с таким именем
    let existingCountry = await this.Country.findOne({ name: country.name });
    if (existingCountry) {
      return existingCountry; // Возвращаем существующую страну
    }
    
    // Если не существует, добавляем новую
    const newCountry = new this.Country(country);
    await newCountry.save();
    return newCountry;
  } catch (err) {
    console.error(err);
    return null;
  }
}

  async updateCountry(id, country) {
    try {
      const updatedCountry = await this.Country.findByIdAndUpdate(id, country, { new: true });
      return updatedCountry;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async deleteCountry(id) {
    try {
      await this.Country.findByIdAndRemove(id);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  // Методы для жанров
  async addGenre(genre) {
  try {
    // Проверяем, существует ли жанр с таким именем
    let existingGenre = await this.Genre.findOne({ name: genre.name });
    if (existingGenre) {
      return existingGenre; // Возвращаем существующий жанр
    }
    
    // Если не существует, добавляем новый
    const newGenre = new this.Genre(genre);
    await newGenre.save();
    return newGenre;
  } catch (err) {
    console.error(err);
    return null;
  }
}

  async updateGenre(id, genre) {
    try {
      const updatedGenre = await this.Genre.findByIdAndUpdate(id, genre, { new: true });
      return updatedGenre;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async deleteGenre(id) {
    try {
      await this.Genre.findByIdAndRemove(id);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  // Методы для директоров
  async addDirector(director) {
    try {
      // Проверяем, существует ли директор с таким именем
      let existingDirector = await this.Director.findOne({ name: director.name });
      if (existingDirector) {
        return existingDirector; // Возвращаем существующего директора
      }
      
      // Если не существует, добавляем нового
      const newDirector = new this.Director(director);
      await newDirector.save();
      return newDirector;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async updateDirector(id, director) {
    try {
      const updatedDirector = await this.Director.findByIdAndUpdate(id, director, { new: true });
      return updatedDirector;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async deleteDirector(id) {
    try {
      await this.Director.findByIdAndRemove(id);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  // Методы получения данных

  async getCountry(id) {
    try {
      const country = await this.Country.findById(id);
      return country;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getCountries() {
    try {
      const countries = await this.Country.find();
      return countries;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async getCountries(skip, limit) {
    try {
      const countries = await this.Country.find().skip(skip).limit(limit);
      return countries || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async getGenre(id) {
    try {
      const genre = await this.Genre.findById(id);
      return genre;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getGenres() {
    try {
      const genres = await this.Genre.find();
      return genres;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async getGenres(skip, limit) {
    try {
      const genres = await this.Genre.find().skip(skip).limit(limit);
      return genres || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }



  async getDirector(id) {
    try {
      const director = await this.Director.findById(id);
      return director;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getDirectors() {
    try {
      const directors = await this.Director.find();
      return directors;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async getDirectors(skip, limit) {
    try {
      const directors = await this.Director.find().skip(skip).limit(limit);
      return directors || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  
}

module.exports = FilmsDB;


============================
============================




  // Запись в ДБ нового фильма
  async addFilm(film) {
    try {
      let director = await this.Director.findOne({ name: film.director });
      if (!director) {
        director = await this.addDirector({ name: film.director });
      }
  
      // Проверяем существование или создаем страну
      let country = await this.Country.findOne({ name: film.country });
      if (!country) {
        country = await this.addCountry({ name: film.country });
      }
  
      // Проверяем существование или создаем жанр
      let genre = await this.Genre.findOne({ name: film.genre });
      if (!genre) {
        genre = await this.addGenre({ name: film.genre });
      }
      const films = await this.Film.find().sort({ id: 1 });
      const lastId = films.length + 1;
      const newFilm = { ...film, id: lastId, _id: new mongoose.Types.ObjectId(), director: director._id,  country: country._id,  genre: genre._id, rating: 0, views: 0 };
      const result = await this.Film.create(newFilm);
      return result;
    } catch (err) {
      console.error(err);
      return null;
    }
  }