//filmdb.js
const mongoose = require('./db');
const Schemas = require('./schemas');


class FilmsDB {
  constructor() {
    const schemas = new Schemas();
    const filmSchema = schemas.createFilmSchema();
    const directorSchema = schemas.createDirectorSchema();
    const genreSchema = schemas.createGenreSchema();
    const countrySchema = schemas.createCountrySchema();
    const filmGenreSchema = schemas.createFilmGenreSchema();
    const filmCountrySchema = schemas.createFilmCountrySchema();
    const filmDirectorSchema = schemas.createFilmDirectorSchema();
    const filmHistorySchema = schemas.createFilmHistrySchema();
    const filmBookmarksSchema = schemas.createFilmBookmarksSchema();

    this.Film = mongoose.model('Film', filmSchema);
    this.Director = mongoose.model('Director', directorSchema);
    this.Genre = mongoose.model('Genre', genreSchema);
    this.Country = mongoose.model('Country', countrySchema);
    this.FilmGenre = mongoose.model('FilmGenre', filmGenreSchema);
    this.FilmCountry = mongoose.model('FilmCountry', filmCountrySchema);
    this.FilmDirector = mongoose.model('FilmDirector', filmDirectorSchema);
    this.FilmHistory = mongoose.model('FilmHistory', filmHistorySchema);
    this.FilmBookmark= mongoose.model('FilmBookmarks', filmBookmarksSchema);

  
  }

  // Метод класса возвращает список фильмов
  async getFilms(skip, limit, name = null, genreName = null, directorName = null, countryName = null, category , typeName) {
    try {
      // Создаем объект запроса
      const query = {};
      let sort = {};
  
      // Устанавливаем сортировку в зависимости от категории
      if (category) {
        if (category === "NEW") {
          sort.released = -1; // Сортировка по году релиза по убыванию
        }
        if (category === "POPULAR") {
          sort.views = -1; // Сортировка по количеству просмотров по убыванию 
        }
      }
  
      // Добавляем фильтры в запрос, если они указаны
      if (name) {
        query.name = { $regex: name, $options: 'i' }; // Поиск по названию
      }
  
// Инициализируем массив для хранения ID фильмов
// Инициализируем массив для хранения ID фильмов
let genrefilmIds = [];
let directorfilmIds = [];
let countryfilmIds = [];

// Добавляем фильтр по типу, если он указан
 if (typeName) {
  query.type = typeName; // Фильтр по типу
}
// Если указан жанр, сначала находим его ID
if (genreName) {
  const genre = await this.Genre.findOne({ name: genreName.toUpperCase() });
  if (genre) {
    genrefilmIds = await this.FilmGenre.find({ genre_id: genre._id }).distinct('film_id');
    console.log('Genre Film IDs:', genrefilmIds);
  }
}

// Если указан режиссер, добавляем его в запрос
if (directorName) {
  const director = await this.Director.findOne({ name: directorName.toUpperCase() });
  if (director) {
    directorfilmIds = await this.FilmDirector.find({ director_id: director._id }).distinct('film_id');
    console.log('Director Film IDs:', directorfilmIds);
  }
}

// Если указана страна, добавляем ее в запрос
if (countryName) {
  const country = await this.Country.findOne({ name: countryName.toUpperCase() });
  if (country) {
    countryfilmIds = await this.FilmCountry.find({ country_id: country._id }).distinct('film_id');
    console.log('Country Film IDs:', countryfilmIds);
  }
}

// Создаем трехмерный массив
const filmIds = [genrefilmIds, directorfilmIds, countryfilmIds];

// Находим пересечение всех ID фильмов
let commonFilmIds = [];

// Фильтруем массивы, чтобы исключить пустые
const nonEmptyFilmIds = filmIds.filter(arr => arr.length > 0);

if (nonEmptyFilmIds.length > 0) {
  // Начинаем с первого массива как базового
  commonFilmIds = [...nonEmptyFilmIds[0]];

  // Перебираем остальные массивы и находим пересечения
  for (let i = 1; i < nonEmptyFilmIds.length; i++) {
    commonFilmIds = commonFilmIds.filter(filmId => 
      nonEmptyFilmIds[i].some(otherFilmId => otherFilmId.equals(filmId))
    );
  }
 
  // Если есть пересечения, добавляем их в запрос
  if (commonFilmIds.length > 0) {
    console.log('Common Film IDs:', commonFilmIds);
    query._id = { $in: commonFilmIds };
    
  } else {
    console.log('No common films found.');
  }
} else {
  console.log('No filters provided.');
}

  // Получение общего количества фильмов
  const totalCount = await this.Film.countDocuments(query);
      // Получаем фильмы с учетом фильтров и пагинации
      const films = await this.Film.find(query)
        .sort(sort) // Добавляем сортировку
        .skip(skip)
        .limit(limit)
        .populate('genre') // Заполнение данных о жанрах
        .populate('director') // Заполнение данных о режиссере
        .populate('country'); // Заполнение данных о стране
  
      // Преобразуем фильмы для удобного вывода
      const transformedFilms = await Promise.all(films.map(async (film) => {
        const filmGenres = await this.FilmGenre.find({ film_id: film._id }).populate('genre_id');
        const genres = filmGenres.map(fg => fg.genre_id.name).join(', ');
  
        const filmCountries = await this.FilmCountry.find({ film_id: film._id }).populate('country_id');
        const countries = filmCountries.map(fc => fc.country_id.name).join(', ');
  
        const filmDirectors = await this.FilmDirector.find({ film_id: film._id }).populate('director_id');
        const directors = filmDirectors.map(fd => fd.director_id.name).join(', ');
  
        return {
          id: film.id,
          type: film.type,
          name: film.name,
          originalname: film.originalname,
          released: film.released,
          description: film.description,
          director: directors || 'Неизвестный режиссер',
          country: countries || 'Неизвестная страна',
          genre: genres || 'Нет жанров',
          age: film.age,
          video_quality: film.video_quality,
          url_poster: film.url_poster,
          url_playlist: film.url_playlist,
          rating: film.rating,
          views: film.views,
        };
      }));
  
      // Возвращаем объект с фильмами и количеством

  return {
    films: transformedFilms || [],
    count: totalCount
  };
    } catch (err) {
      console.error('Ошибка при получении фильмов:', err);
      return [];
    }
  }
  


// Счетчик записей в ДБ, возвращает количество, целое число (удалить)
async getFilmsCount() {
  try {
    const count = await this.Film.countDocuments();
    return count || 0;
  } catch (err) {
    console.error('Ошибка при подсчете фильмов:', err);
    return 0;
  }
}

 

async getFilm(id) {
  try {
    // Находим фильм по id
    const film = await this.Film.findOne({ id: id })
      .populate('director') // Заполнение данных о режиссере
      .populate('country'); // Заполнение данных о стране

    if (!film) {
      console.error(`Фильм с id ${id} не найден`);
      return null;
    }

    // Получаем жанры через связи
    const filmGenres = await this.FilmGenre.find({ film_id: film._id }).populate('genre_id');
    const genres = filmGenres.map(fg => fg.genre_id.name).join(', ');

    const filmCountries = await this.FilmCountry.find({ film_id: film._id }).populate('country_id');
    const countries = filmCountries.map(fc => fc.country_id.name).join(', ');

    const filmDirectors = await this.FilmDirector.find({ film_id: film._id }).populate('director_id');
    const directors = filmDirectors.map(fd => fd.director_id.name).join(', ');

    

    
    const transformedFilm = {
      _id: film._id,
      id: film.id,
      type: film.type,
      name: film.name,
      originalname: film.originalname,
      released: film.released,
      description:film.description,
      director: directors || 'Неизвестный режиссер',
      country: countries || 'Неизвестная страна',
      genre: genres || 'Нет жанров', // Если жанров нет, выводим сообщение
      age: film.age,
      video_quality: film.video_quality,
      url_poster: film.url_poster,
      url_playlist: film.url_playlist,    
      rating: film.rating,
      views: film.views,
    };

    return transformedFilm;
  } catch (err) {
    console.error('Ошибка при получении фильма:', err);
    return null;
  }
}


  async addFilm(filmData) {
    try {
      console.log(filmData);
      // Проверяем существование или создаем режиссера
      /*
      let director = await this.Director.findOne({ name: filmData.director });
      if (!director) {
        director = await this.addDirector({ name: filmData.director });
      }
  
      // Проверяем существование или создаем страну
      let country = await this.Country.findOne({ name: filmData.country });
      if (!country) {
        country = await this.addCountry({ name: filmData.country });
      }
  
      // Проверяем существование или создаем жанр
      let genre = await this.Genre.findOne({ name: filmData.genre });
      if (!genre) {
        genre = await this.addGenre({ name: filmData.genre });
      }*/
  
      // Получаем последний ID для фильма
      const films = await this.Film.find().sort({ id: 1 });
      const lastId = films.length > 0 ? films[films.length - 1].id + 1 : 1; // Если нет фильмов, начинаем с 1
  
      // Создайем новый фильм
      const newFilm = new this.Film({
        _id: new mongoose.Types.ObjectId(), // Генерируем новый ObjectId
        id: lastId, // Уникальный идентификатор фильма
        type:filmData.type,
        name: filmData.name,
        originalname: filmData.originalname,
        released: filmData.released,
        description: filmData.description,
        age: filmData.age,
        video_quality: filmData.video_quality,
        url_poster: filmData.url_poster,
        url_playlist: filmData.url_playlist,
        rating: 0,
        views: 0,
      });
  
      // Сохраняем фильм в базе данных
      await newFilm.save();
  
      // Сохраняем связи с жанрами
      const filmGenres = filmData.genre.map(genreId => ({
        film_id: newFilm._id,
        genre_id: genreId,
      }));
      await this.FilmGenre.insertMany(filmGenres);
  
      // Сохраните связи со странами
      const filmCountries = filmData.country.map(countryId => ({
        film_id: newFilm._id,
        country_id: countryId,
      }));
      await this.FilmCountry.insertMany(filmCountries);
  
      // Сохраняем связи с режиссерами
      const filmDirectors = filmData.director.map(directorId => ({
        film_id: newFilm._id,
        director_id: directorId,
      }));
      await this.FilmDirector.insertMany(filmDirectors);
  
      return { message: 'Фильм успешно добавлен', film: newFilm };
    } catch (err) {
      console.error(err);
      throw new Error('Ошибка при добавлении фильма: ' + err.message);
    }
  }
  
  

  
  async updateFilm(id, filmData) {
    try {
      // Получаем фильм по ID
      const film = await this.Film.findOne({ id: id }); // Изменено на findOne с использованием поля id
     // const film = await this.Film.findById(_id);
      if (!film) {
        throw new Error('Фильм не найден');
      }
  
      // Обновляем основные данные о фильме
      film.type = filmData.type;
      film.name = filmData.name;
      film.originalname = filmData.originalname;
      film.released = filmData.released;
      film.description = filmData.description;
      film.age = filmData.age;
      film.video_quality = filmData.video_quality;
      film.url_poster = filmData.url_poster;
      film.url_playlist = filmData.url_playlist;
      console.log("удалить апд фильм " + film._id + " filmData.genre= "+ filmData.genre);
  
      if((filmData.genre || filmData.country || filmData.director) !== null){
      // Обновляем связи с жанрами
      await this.FilmGenre.deleteMany({ film_id: film._id }); // Удаляем старые связи
      const filmGenres = filmData.genre.map(genreId => ({
        film_id: film._id,
        genre_id: genreId,
      }));
      await this.FilmGenre.insertMany(filmGenres); // Сохраняем новые связи
  
      // Обновляем связи со странами
      await this.FilmCountry.deleteMany({ film_id: film._id }); // Удаляем старые связи
      const filmCountries = filmData.country.map(countryId => ({
        film_id: film._id,
        country_id: countryId,
      }));
      await this.FilmCountry.insertMany(filmCountries); // Сохраняем новые связи
  
      // Обновляем связи с режиссерами
      await this.FilmDirector.deleteMany({ film_id: film._id }); // Удаляем старые связи
      const filmDirectors = filmData.director.map(directorId => ({
        film_id: film._id,
        director_id: directorId,
      }));
      await this.FilmDirector.insertMany(filmDirectors); // Сохраняем новые связи
    }else{
      film.genre = film.genre;
      film.country = film.country;
      film.director = film.director;
      film.views = filmData.views;
    }
      // Сохраняем изменения
      await film.save();
  
      return { message: 'Фильм успешно обновлен', film: film };
    } catch (err) {
      console.error(err);
      throw new Error('Ошибка при обновлении фильма: ' + err.message);
    }
  }

  async deleteFilm(_id) {
    try {
      await this.Film.findOneAndRemove({ _id });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }


  async updateCGD(_id, sgd, type) {
    try {
      let CGD;
      if (type === "genre") {
      CGD = await this.Genre;
      } else if (type === "country") {
        CGD = await this.Country;
      } else if (type === "director") {
        CGD = await this.Director;
      } else {
        CGD = null; // или любое другое значение по умолчанию
      }


      console.log("обнова страны функц2 " + _id + sgd);
      const updatedCGD = await CGD.findByIdAndUpdate(_id, sgd, { new: true });
      return updatedCGD;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async deleteCGD1(_id, type) {
    try {
      let CGD;
      if (type === "genre") {
      CGD = await this.Genre;
      } else if (type === "country") {
        CGD = await this.Country;
      } else if (type === "director") {
        CGD = await this.Director;
      } else {
        CGD = null; // или любое другое значение по умолчанию
      }
      console.log("delete country2 " + _id);
      await CGD.findByIdAndDelete(_id);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async deleteCGD(_id, type) {
    try {
      let CGDModel; // Модель для удаления
      let relationModel;
  
      // Определяем модель для удаления
      if (type === "genre") {
        CGDModel = this.Genre; // Модель для жанров
        relationModel = this.FilmGenre; // Модель для связей с жанрами
      } else if (type === "country") {
        CGDModel = this.Country; // Модель для стран
        relationModel = this.FilmCountry; // Модель для связей со странами
      } else if (type === "director") {
        CGDModel = this.Director; // Модель для режиссеров
        relationModel = this.FilmDirector; // Модель для связей с режиссерами
      } else {
        console.log(`Неверный тип: ${type}`);
        return false; // Если тип не распознан, возвращаем false
      }
  
      // Проверяем существование объекта
      const CGD = await CGDModel.findById(_id);
      if (!CGD) {
        console.log(`Не найден ${type} с ID: ${_id}`);
        return false; // Если объект не найден, возвращаем false
      }
  
      // Удаляем связи с фильмами
      await relationModel.deleteMany({ [`${type}_id`]: _id });
  
      // Удаляем сам объект
      console.log(`Удаляем ${type} с ID: ${_id}`);
      await CGDModel.findByIdAndDelete(_id); // Используем модель для удаления
  
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }


  // Методы для жанров, стран, режиссеров

  async addCGD(CGD, type) {
    try {
     // console.log ('апи получен пост2 ' + genre.name);
     let oCGD;
     if (type === "genre") {
       oCGD = this.Genre;
     } else if (type === "country") {
        oCGD = this.Country;
     } else if (type === "director") {
        oCGD = this.Director;
     } else {
       oCGD = null; // или любое другое значение по умолчанию
     }
      console.log(type);

            // Проверяем, существует ли жанр с таким именем
            CGD.name = CGD.name.toUpperCase();
             
            let existingCGD = await oCGD.findOne({ name: CGD.name });
           // let existingCGD = await this.Genre.findOne({ name: CGD.name });
            console.log ('апи получен пост2.2 ' + existingCGD);
            if (existingCGD) {
             // console.log ('апи получен пост3.1 ' + genre.genre);
              console.log ('апи получен пост3.2 ' + existingCGD);
              return {
                success: true,
               
            };
            }
            console.log ('апи получен пост4');
        

      const newCGD = { ...CGD, _id: new mongoose.Types.ObjectId(), name: CGD.name, };
      const result = await oCGD.create(newCGD);
      console.log('Созданный объект:', result);
      return {
        id: result._id, // Это поле существует
        name: result.name // Это поле существует
      };
           } catch (err) {
            console.error(err);
            return null;
          }
        }

 
      
        // Методы получения данных
      
        async getCountry(_id) {
          try {
            const country = await this.Country.findById(_id);
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
        
      
        async getCGDs(skip, limit, type) {
          try {
           
            let CGD;
            if (type === "genre") {
            CGD = await this.Genre;
            } else if (type === "country") {
              CGD = await this.Country;
            } else if (type === "director") {
              CGD = await this.Director;
            } else {
              CGD = null; // или любое другое значение по умолчанию
            }


            const cgd = CGD.find().skip(skip).limit(limit);
            return cgd || [];
          } catch (err) {
            console.error(err);
            return [];
          }
        }
      
        async getGenre(_id) {
          try {
            const genre = await this.Genre.findById(_id);
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
      
       
      
        async getDirector(_id) {
          try {
            const director = await this.Director.findById(_id);
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
      
       
      



        async addHistory(filmData, userData) {
          try {
              console.log("add history ="+filmData + "user= " + userData._id + "film data ="+filmData._id); // Логируем данные фильма
      
              // Создаем новый объект истории фильма
              const newFilmHistory = new this.FilmHistory({
                  _id: new mongoose.Types.ObjectId(), // Генерируем новый ObjectId
                  user_id: userData._id, // Используем userData для получения уникального идентификатора пользователя
                  film_id: filmData._id, // Уникальный идентификатор фильма
              });
      
              // Сохраняем фильм в базе данных
              await newFilmHistory.save();
      
              // Возвращаем сообщение и созданный объект истории фильма
              return { message: 'Фильм успешно добавлен в историю', filmHistory: newFilmHistory };
          } catch (err) {
              console.error(err);
              throw new Error('Ошибка при добавлении фильма в историю: ' + err.message);
          }
      }

      async addBookmark(filmData, userData) {
        try {
            console.log("add bookmark ="+filmData + "user= " + userData._id + "film data ="+filmData._id); // Логируем данные фильма
    
            // Создаем новый объект истории фильма
            const newFilmBookmark = new this.FilmBookmark({
                _id: new mongoose.Types.ObjectId(), // Генерируем новый ObjectId
                user_id: userData._id, // Используем userData для получения уникального идентификатора пользователя
                film_id: filmData._id, // Уникальный идентификатор фильма
            });
    
            // Сохраняем фильм в базе данных
            await newFilmBookmark.save();
    
            // Возвращаем сообщение и созданный объект истории фильма
            return { message: 'Фильм успешно добавлен в историю', filmBookmark: newFilmBookmark };
        } catch (err) {
            console.error(err);
            throw new Error('Ошибка при добавлении фильма в историю: ' + err.message);
        }
    }

    async searchFilmsByName(name) {
      try {
          // Проверяем, что имя передано
          if (!name) {
              throw new Error('Название фильма не указано');
          }
  
          // Используем регулярное выражение для поиска по названию
          const films = await this.Film.find({
              name: { $regex: name, $options: 'i' } // 'i' для нечувствительности к регистру
          });
  
          // Преобразуем фильмы для удобного вывода
          const transformedFilms = await Promise.all(films.map(async (film) => {
              // Получаем жанры через связи
              const filmGenres = await this.FilmGenre.find({ film_id: film._id }).populate('genre_id');
              const genres = filmGenres.map(fg => fg.genre_id.name).join(', ');
  
              // Получаем страны через связи
              const filmCountries = await this.FilmCountry.find({ film_id: film._id }).populate('country_id');
              const countries = filmCountries.map(fc => fc.country_id.name).join(', ');
  
              // Получаем режиссеров через связи
              const filmDirectors = await this.FilmDirector.find({ film_id: film._id }).populate('director_id');
              const directors = filmDirectors.map(fd => fd.director_id.name).join(', ');
  
              return {
                id: film.id,
                type: film.type,
                name: film.name,
                originalname: film.originalname,
                released: film.released,
                description: film.description,
                director: directors || 'Неизвестный режиссер',
                country: countries || 'Неизвестная страна',
                genre: genres || 'Нет жанров',
                age: film.age,
                video_quality: film.video_quality,
                url_poster: film.url_poster,
                url_playlist: 'http://127.0.0.1:3000/api/v1/content/video/' + film.url_playlist,
                rating: film.rating,
                views: film.views,
              };
          }));
  
          return transformedFilms;
      } catch (err) {
          console.error('Ошибка при поиске фильмов:', err);
          throw new Error('Ошибка при поиске фильмов: ' + err.message);
      }
  }

  async getUserFilms(userId, skip, limit, filterType = 'history') {
    try {
        const query = {};
        console.log("User  Film IDs from history1111111111111111: =  " +filterType );
        // Получаем ID фильмов из истории или закладок пользователя
        let userFilmIds = [];
        if (filterType === 'history') {
            userFilmIds = await this.FilmHistory.find({ user_id: userId._id }).distinct('film_id');
            console.log("User  Film IDs from history: ", userFilmIds);

        } else if (filterType === 'bookmark') {
            userFilmIds = await this.FilmBookmark.find({ user_id: userId._id }).distinct('film_id');

        }

        // Если нет ID фильмов, возвращаем пустой результат
        if (userFilmIds.length === 0) {
            return { films: [], count: 0 };
        }

        // Добавляем ID фильмов в запрос
        query._id = { $in: userFilmIds };

        // Получение общего количества фильмов
        const totalCount = userFilmIds.length;
        let sort = {};
        sort._id = -1;
        // Получаем фильмы с учетом фильтров и пагинации
        const films = await this.Film.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('genre') // Заполнение данных о жанрах
            .populate('director') // Заполнение данных о режиссере
            .populate('country'); // Заполнение данных о стране

        // Преобразуем фильмы для удобного вывода
        const transformedFilms = await Promise.all(films.map(async (film) => {
            const filmGenres = await this.FilmGenre.find({ film_id: film._id }).populate('genre_id');
            const genres = filmGenres.map(fg => fg.genre_id.name).join(', ');

            const filmCountries = await this.FilmCountry.find({ film_id: film._id }).populate('country_id');
            const countries = filmCountries.map(fc => fc.country_id.name).join(', ');

            const filmDirectors = await this.FilmDirector.find({ film_id: film._id }).populate('director_id');
            const directors = filmDirectors.map(fd => fd.director_id.name).join(', ');

            return {
                id: film.id,
                type: film.type,
                name: film.name,
                originalname: film.originalname,
                released: film.released,
                description: film.description,
                director: directors || 'Неизвестный режиссер',
                country: countries || 'Неизвестная страна',
                genre: genres || 'Нет жанров',
                age: film.age,
                video_quality: film.video_quality,
                url_poster: film.url_poster,
                url_playlist: film.url_playlist,
                rating: film.rating,
                views: film.views,
            };
        }));

        // Возвращаем объект с фильмами и количеством
        return {
            films: transformedFilms || [],
            count: totalCount
        };
    } catch (err) {
        console.error('Ошибка при получении фильмов:', err);
        return { films: [], count: 0 };
    }
}
      
    }
      module.exports = FilmsDB;