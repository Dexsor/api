//REST API

//импорт модулей
const http = require('http');
const url = require('url');

const FilmsDB = require('./db/filmsdb');//работа с базой фильмов
const filmsDB = new FilmsDB();

//const addFilmsPagecontroller = require('./pagecreate/addFilmsPagecontroller');//страница добавить фильм
//const filmController = new addFilmsPagecontroller();

const authPageController = require('./pagecreate/authPageController');//страницы авторизации

const  PageController  = require('./pagecreate/pageController');

const pageController = new PageController();



const UsersDB = require('./db/usersdb');//работа с базой пользователей
const usersDB = new UsersDB();

const bcrypt = require('bcrypt');//шифрование

//подгрузка ENV
const { loadEnv } = require('./utilities/uenv');
loadEnv();
const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.DOMAIN || "localhost";
const PROTOCOL = process.env.PROTOCOL || "http";


//протокол и домен 
const domain = DOMAIN +':'+ PORT; //const domain = 'video.dexsor.ru';
const protocol = PROTOCOL +':'; //const protocol = http.request({ host: domain, port: 80 }).protocol;
const baseUrl = `${protocol}//${domain}`;



//функция парсинга запросов
function parseRequest(request) {
  const pathname = url.parse(request.url).pathname;
  const query = url.parse(request.url, true).query;
  return { pathname, query };
}

//функция отправки ответов
function sendResponse(response, options) {
  // Устанавливаем заголовки по умолчанию
  options.headers = options.headers || {};
  options.headers['Access-Control-Allow-Origin'] = '*';
  options.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept';

  // Устанавливаем код состояния по умолчанию, если он не указан
  const statusCode = options.statusCode || 200; // Установите 200 как значение по умолчанию

  response.writeHead(statusCode, options.headers);
  response.end(options.body);
}


/////////////////

const response = (statusCode, message, body = {}) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, ...body })
});

const error201 = response(201, 'Вы успешно зарегистрированы');
const error404 = response(404, 'Error 404');
const error401 = response(401, 'Неправильный логин или пароль');
const error400 = response(400, 'Логин или почта уже используется');
const error400_1 = response(400, 'Слабый пароль');
//const successResponse = (body) => response(200, 'Успешно', body);



////////////////////////////


//ответ 200
const successResponse = (body) => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});



//информация об API
function getApiInfo(request, response) {
  const apiInfo = {
    name: 'Мой API',
    version: '1.0',
    description: 'Это базовое API для работы с фильмами'
  };
  sendResponse(response, successResponse(apiInfo));
}

//получение списка фильмов по 5 шт на каждой странице
async function getFilms(request, response, query) {
  const queryParams = new URLSearchParams(query);
  console.log("апи ссылка1 = " + queryParams.toString());
  console.log("апи ссылка2 = " + queryParams.toString().replace(query.page,'').replace('page=',''));
 
  const page = parseInt(queryParams.get('page')) || 1; // Получаем номер страницы
  const limit = 5;
  const skip = (page - 1) * limit;
  

 // Параметры для поиска

 const type = query.type || null; // Тип карточки : фильм, сериал
 const name = query.name || null; // Название фильма для поиска
 const released = query.released || null; // Год релиза 
 const genreName = query.genre || null; // Имя жанра для фильтрации
 const director = query.director || null; // Имя режиссера для фильтрации
 const country = query.country || null; // Страна для фильтрации
 const age = query.age || null; // Возрастной ценз
 const rating = query.rating || null; // Рейтинг
 const views = query.views || null; // Просмотры
 const news = query.new || null; // Новинки
 const popular = query.popular|| null; // Популярные
 const category = query.category || null; // Популярные
 

  let { films, count } = await filmsDB.getFilms(skip, limit, name, genreName, director, country, category, type);
 
  
     console.log("кол-во карточек = " + count);
  

  if (films) {
    // Извлекаем текущие параметры запроса

    
    

    // Устанавливаем параметры для следующей страницы
    const nextPage = page < Math.ceil(count / limit) ? `${baseUrl}/api/v1/films?${queryParams.toString().replace(query.page,'').replace('page=','')}&page=${page + 1}` : null;
    
    const data = {
      films,
      page: {
        current: page,
        next: nextPage
      },
      films: films.map((film) => ({
        id: film.id,
        type: film.type,
        name: film.name,
        released: film.released,
        url_poster: film.url_poster,
        url_playlist: `${baseUrl}/api/v1/films/${film.id}`

      }))
    };
    sendResponse(response, successResponse(data));
  } else {
    sendResponse(response, error404);
  }
}


//получение подробной карточки фильма
async function getFilm(request, response, id) {
  try {
    id = parseInt(id);
    if (isNaN(id)) {
      throw new Error('Недопустимый идентификатор');
    }
    const film = await filmsDB.getFilm(id);
    if (!film) {
      console.log(`Фильм с ID ${id} не найден`);
      sendResponse(response, error404);
    } else {
      console.log(`Фильм с ID ${id} найден`);
      sendResponse(response, successResponse(film));
    }
  } catch (error) {
    console.error(error);
    sendResponse(response, error404);
  }
}


//функция добавления фильма
async function addFilm(request, response) {
  let body = '';
  request.on('data', (chunk) => {
    body += chunk;
  });
  request.on('end', async () => {
    if (body.trim() === '') {
      sendResponse(response, error404);
      return;
    }
    try {
      const film = JSON.parse(body);
      const newFilm = await filmsDB.addFilm(film);
      sendResponse(response, successResponse(newFilm));
    } catch (err) {
      console.error(err);
      sendResponse(response, error404);
    }
  });
}

// Функция обновления фильма
async function updateFilm(request, response,filmId ) {
  //const filmId = request.url.split('/').pop(); // Предполагаем, что ID фильма передается в URL
  let body = '';

  request.on('data', (chunk) => {
    body += chunk;
  });

  request.on('end', async () => {
    if (body.trim() === '') {
      sendResponse(response, error404);
      return;
    }

    try {
      const filmData = JSON.parse(body);
      const updatedFilm = await filmsDB.updateFilm(filmId, filmData);

      if (!updatedFilm) {
        sendResponse(response, error404); // Если фильм не найден
      } else {
        sendResponse(response, successResponse(updatedFilm));
      }
    } catch (err) {
      console.error(err);
      sendResponse(response, error404);
    }
  });
}



// Функция добавления страны
async function addCGD(request, response, type) {
  let body = '';
  request.on('data', (chunk) => {
    body += chunk;
  });
  request.on('end', async () => {
    if (body.trim() === '') {
      sendResponse(response, error404);
      return;
    }
    try {
      const country = JSON.parse(body);
      const newCountry = await filmsDB.addCGD(country, type);




      


      // Проверяем, существует ли страна

      if (newCountry.message === "false") {
          console.log("Страна уже существует в базе данных.");
          return {
              success: false,
              message: "Страна уже существует в базе данных."
          };
      } else {
      }
      
      console.log ('апи получен пост '+newCountry);
      sendResponse(response, successResponse(newCountry));
    } catch (err) {
      console.error(err);
      sendResponse(response, error404);
    }
  });
}

// Функция получения списка стран
async function getCGDs(request, response, type) {
  try {
    let CGDs;

        CGDs = await filmsDB.getCGDs( 0,0 ,type);
  

      
      // Форматируем ответ
      const formattedCGD = CGDs.map(CGD => ({
          id: CGD._id, // Добавляем идентификатор
          name: CGD.name // Имя страны
      }));
      sendResponse(response, successResponse(formattedCGD));
  } catch (err) {
      console.error(err);
      sendResponse(response, error404);
  }

}



// Функция редактирования страны
async function updateCGD(request, response, id, type) {
  console.log("обнова страны функц1");
  let body = '';
  request.on('data', (chunk) => {
    body += chunk;
  });
  request.on('end', async () => {
    if (body.trim() === '') {
      sendResponse(response, error404);
      return;
    }
    try {
      const cgd = JSON.parse(body);
      cgd.name = cgd.name.toUpperCase();
      console.log("обнова страны функц1.1 " + cgd.name + id);
      const updatedCGD = await filmsDB.updateCGD(id, cgd, type);
      if (!updatedCGD) {
        sendResponse(response, error404);
      } else {
        sendResponse(response, successResponse(updatedCGD));
      }
    } catch (err) {
      console.error(err);
      sendResponse(response, error404);
    }
  });
}

// Функция удаления страны
async function deleteCGD(request, response, id, type) {
  try {
    console.log("delete country2 " + id);
    const deleted = await filmsDB.deleteCGD(id, type);
    if (deleted) {
      sendResponse(response, successResponse({ message: 'Страна успешно удалена' }));
    } else {
      sendResponse(response, error404);
    }
  } catch (err) {
    console.error(err);
    sendResponse(response, error404);
  }
}



//функция регистрации пользователя
async function registerUser     (request, response) {
  let body = '';
  request.on('data', (chunk) => {
    body += chunk;
  });
  request.on('end', async () => {
    if (body.trim() === '') {
      sendResponse(response, error404);
      return;
    }
    try {
      const user = JSON.parse(body);
      user.username = user.username.toLowerCase();
      user.email = user.email.toLowerCase();
      const existingUser     = await usersDB.getUserByUsername(user.username);
      if (existingUser    ) {
        sendResponse(response, error400);
        console.log('ник совпадает: ');
        return;
      
      }
      const existingEmail = await usersDB.getUserByEmail(user.email);
      if (existingEmail) {
      sendResponse(response, error400);
      console.log('емейл совпадает: ');
        return;
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(user.password)) {
        sendResponse(response, error400_1);
        console.log('пароль не соответствует требованиям');
        return;
      }

      await usersDB.registerUser({ ...user, password: user.password });//не шифруем передаем пароль
      
      sendResponse(response, error201);
    } catch (err) {
      console.error(err);
      sendResponse(response, error404);
    }
  });
}

//функция авторизации пользователя
async function loginUser(request, response) {
  let body = '';
  request.on('data', (chunk) => {
    body += chunk;
  });
  request.on('end', async () => {
    if (body.trim() === '') {
      sendResponse(response, error404);
      return;
    }
    
    try {
      
      const { username, password } = JSON.parse(body);
      const user = await usersDB.loginUser (username, password);
      
      if (!user) {
        sendResponse(response, error401);
        console.log('пароль1: '+!user);
        return;
      }
      sendResponse(response, {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Вы успешно авторизованы' })
        
      });       
    } catch (err) {
      console.error(err);
      sendResponse(response, error404);
    }
  });
}






  //создание сервера
  const server = http.createServer( async(request, response) => {
    const { pathname, query } = parseRequest(request);
    let path = pathname;
    if (path.endsWith('/')) {
      path = path.slice(0, -1); // удаляем последний `/` из URL-адреса
    }
  //маршрутизатор
  const routes = {
    '/api/v1': getApiInfo,
    '/api/v1/auth/reg': registerUser ,
    '/api/v1/auth/login': loginUser,
    '/api/v1/films': (request, response) => getFilms(request, response, query),
    '/api/v1/films/:id': getFilm,
    '/api/v1/films/add': addFilm,
    '/api/v1/films/add-page': (request, response) => {
      const result = pageController.getAddFilmPage(request, response);
      sendResponse(response, result);

    },

'/api/v1/countries/edit-page': async (request, response) => {
    const result = await pageController.getCGDPage(request, response, filmsDB, "country");
    sendResponse(response, result);
},

'/api/v1/genres/edit-page': async (request, response) => {
    const result = await pageController.getCGDPage(request, response, filmsDB, "genre");
    sendResponse(response, result);
},

'/api/v1/directors/edit-page': async (request, response) => {
    const result = await pageController.getCGDPage(request, response, filmsDB, "director");
    sendResponse(response, result);
},
/*
'/api/v1/film/edit-page/:id': async (request, response) => {
    const result = await pageController.getEditFilmPage(request, response, filmsDB, filmId);
    sendResponse(response, result);
},*/



    '/api/v1/auth/regp': async (request, response) => {
      const result = await authPageController.getRegisterPage(request, response);
      sendResponse(response, result);
    },
    '/api/v1/auth/loginp': async (request, response) => {
      const result = await authPageController.getLoginPage(request, response);
      sendResponse(response, result);
    },
    
    // Жанры
    '/api/v1/genres': (request, response) => getCGDs(request, response, "genre"),// Получение списка стран getCGD("country")
    '/api/v1/genres/add': (request, response) => addCGD(request, response, "genre"), // Добавление страны
   // '/api/v1/genres/update/:id': updateCGD, // Добавление страны updateCGD, // Обновление страны '/api/v1/countries/:id': updateCountry,
   // '/api/v1/genres/delete/:id': deleteCGD, // Удаление страны
    // Страны
    '/api/v1/countries': (request, response) => getCGDs(request, response, "country"),// Получение списка стран getCGD("country")
    '/api/v1/countries/add': (request, response) => addCGD(request, response, "country"), // Добавление страны
    '/api/v1/countries/update/:id': updateCGD, // Добавление страны updateCGD, // Обновление страны '/api/v1/countries/:id': updateCountry,
    '/api/v1/countries/delete/:id': deleteCGD, // Удаление страны
    
    // Режиссеры
    '/api/v1/directors': (request, response) => getCGDs(request, response, "director"),// Получение списка стран getCGD("country")
    '/api/v1/directors/add': (request, response) => addCGD(request, response, "director"), // Добавление страны
    '/api/v1/directors/update/:id': updateCGD, // Добавление страны updateCGD, // Обновление страны '/api/v1/countries/:id': updateCountry,
    '/api/v1/directors/delete/:id': deleteCGD, // Удаление страны

  


  };


  // Обработка запросов по маршрутам
  // Обработка запросов по маршрутам
if (path in routes) {
  routes[path](request, response);
} else if (path.startsWith('/api/v1/films/')) {
  const filmId = path.replace('/api/v1/films/', ''); // получаем ID фильма

  if (request.method === 'GET') {
    // Если метод GET, возвращаем фильм
    getFilm(request, response, filmId);
  } else if (request.method === 'PATCH') {
    // Если метод PATCH, обновляем фильм
    updateFilm(request, response, filmId);
  } else if (request.method === 'DELETE') {
    // Если метод DELETE, удаляем фильм
    deleteFilm(request, response, filmId);
  } else {
    // Если метод не поддерживается, возвращаем ошибку
    sendResponse(response, { status: 405, message: 'Метод не поддерживается' });
  }

  }  else if (path.startsWith('/api/v1/countries/delete/')) {
    const _Id = path.replace('/api/v1/countries/delete/', ''); // получаем ID
    if (_Id) {
      deleteCGD(request, response, _Id, "country"); // если ID указан, возвращаем 
    } else {
      sendResponse(response, error404); // если ID  не указан, это ошибка
    }
  }else if (path.startsWith('/api/v1/countries/update/')) {
    const _Id = path.replace('/api/v1/countries/update/', ''); // получаем ID
    if (_Id) {
      updateCGD(request, response, _Id, "country"); // если ID указан, возвращаем 
    } else {
      sendResponse(response, error404); // если ID  не указан, это ошибка
    }
  }else if (path.startsWith('/api/v1/genres/delete/')) {
    const _Id = path.replace('/api/v1/genres/delete/', ''); // получаем ID
    if (_Id) {
      deleteCGD(request, response, _Id, "genre"); // если ID указан, возвращаем 
    } else {
      sendResponse(response, error404); // если ID  не указан, это ошибка
    }
  }else if (path.startsWith('/api/v1/genres/update/')) {
    const _Id = path.replace('/api/v1/genres/update/', ''); // получаем ID
    if (_Id) {
      updateCGD(request, response, _Id, "genre"); // если ID указан, возвращаем 
    } else {
      sendResponse(response, error404); // если ID  не указан, это ошибка
    }
  }else if (path.startsWith('/api/v1/directors/delete/')) {
    const _Id = path.replace('/api/v1/directors/delete/', ''); // получаем ID
    if (_Id) {
      deleteCGD(request, response, _Id, "director"); // если ID указан, возвращаем 
    } else {
      sendResponse(response, error404); // если ID  не указан, это ошибка
    }
  }else if (path.startsWith('/api/v1/directors/update/')) {
    const _Id = path.replace('/api/v1/directors/update/', ''); // получаем ID
    if (_Id) {
      updateCGD(request, response, _Id, "director"); // если ID указан, возвращаем 
    } else {
      sendResponse(response, error404); // если ID  не указан, это ошибка
    }
  } else if (path.startsWith('/api/v1/film/edit-page/')) {
    const _Id = path.replace('/api/v1/film/edit-page/', ''); // получаем ID
    if (_Id) {
     const result = await pageController.getEditFilmPage(request, response, filmsDB, _Id); // Используем await
     sendResponse(response, result); // Отправляем результат
        
    } else {
        sendResponse(response, error404); // если ID не указан, это ошибка
    }
    
  }

  

});

//запуск сервера
server.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});