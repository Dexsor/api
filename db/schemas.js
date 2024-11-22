// создание схем 
const mongoose = require('mongoose');

class Schemas {
  constructor() {}

  //фильмы
  createFilmSchema() {
    const filmSchema = new mongoose.Schema({
//      _id: mongoose.Schema.Types.ObjectId, //внутренний ид базы
      id: { type: Number, unique: true }, //ид фильма, виден юзеру, по нему поиск потом делать, например сортировка новинок
      type: String, //тип фильм, сериал
      name: String, //название на русском
      originalname: String, //название на англ
      released: Number, //год релиза
      description: String, //описание фильма
      director: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Director' }], // ссылка на режиссера
      country: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Country' }], // ссылка на страну
      genre: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }], // ссылка на жанр
      age: String, //воздасттной ценз
      video_quality: [String], //качество видео-дробить
      url_poster: String, //ссылка на постер
      url_playlist: String, //ссылка плейлист или видео, в идеале hls поток
      rating: {  //рейтинг фильма от 0 до 10 с одним знаком после запятой например 7,2
        type: Number,
        min: 0,
        max: 10,
        validate: {
          validator: (v) => {
            if (v.toString().includes('.')) {
              return v.toString().split('.')[1].length <= 1;
            }
            return true;
          },
        }
      },
      views: Number //счетчик количества просмотров, для реализации категории популярные
    });

    filmSchema.set('toJSON', {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    });

    return filmSchema;
  }

  //пользователи
  createUserSchema() {
    const userSchema = new mongoose.Schema({
//      _id: mongoose.Schema.Types.ObjectId,
      username: { type: String, unique: true },
      password: String,
      email: String,
      role: String,
      balance: Number
    });

    userSchema.set('toJSON', {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    });

    return userSchema;
  }

  //Режиссер
  createDirectorSchema() {
    const directorSchema = new mongoose.Schema({
//      _id: mongoose.Schema.Types.ObjectId,
//      id: { type: Number, unique: true }, 
      name: String,      
    });

    directorSchema.set('toJSON', {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    });

    return directorSchema;
  }

   //Жанр
   createGenreSchema() {
    const genreSchema = new mongoose.Schema({
//      _id: mongoose.Schema.Types.ObjectId,
 //     id: { type: Number, unique: true }, 
      name: String,      
    });

    genreSchema.set('toJSON', {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    });

    return genreSchema;
  }

  //Страна
  createCountrySchema() {
    const countrySchema = new mongoose.Schema({
//      _id: mongoose.Schema.Types.ObjectId,
 //     id: { type: Number, unique: true }, 
      name: String,      
    });

    countrySchema.set('toJSON', {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    });

    return countrySchema;
  }

    createFilmGenreSchema(){
    const filmGenreSchema = new mongoose.Schema({
    film_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Film' },
    genre_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }
  });

  filmGenreSchema.set('toJSON', {
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  });
  return filmGenreSchema;
}

createFilmCountrySchema(){
  const filmCountrySchema = new mongoose.Schema({
  film_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Film' },
  country_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' }
});

filmCountrySchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});
return filmCountrySchema;
}

createFilmDirectorSchema(){
  const filmDirectorSchema = new mongoose.Schema({
  film_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Film' },
  director_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Director' }
});

filmDirectorSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});
return filmDirectorSchema;
}

}

module.exports = Schemas;