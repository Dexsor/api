//REST API

//импорт модулей
const http = require('http');
const url = require('url');

const FilmsDB = require('./db/filmsdb');//работа с базой фильмов
const filmsDB = new FilmsDB();

const addFilmsPagecontroller = require('./pagecreate/addFilmsPagecontroller');//страница добавить фильм
const filmController = new addFilmsPagecontroller();



const authPageController = require('./pagecreate/authPageController');//страницы авторизации

const UsersDB = require('./db/usersdb');//работа с базой пользователей
const usersDB = new UsersDB();

const bcrypt = require('bcrypt');//шифрование

//протокол и домен 
const domain = 'video.dexsor.ru';
const protocol = 'http:'; //const protocol = http.request({ host: domain, port: 80 }).protocol;
const baseUrl = `${protocol}//${domain}`;

//функция парсинга запросов
function parseRequest(request) {
  const pathname = url.parse(request.url).pathname;
  const query = url.parse(request.url, true).query;
  return { pathname, query };
}

//функция отправки ответов
function sendResponse(response, options) {
  options.headers = options.headers || {};
  options.headers['Access-Control-Allow-Origin'] = '*';
  options.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept';
  response.writeHead(options.statusCode, options.headers);
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
async function getFilms(request, response, { query }) {
  const page = parseInt(query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;
  const films = await filmsDB.getFilms(skip, limit);
  const count = await filmsDB.getFilmsCount();

  if (films) {
    const nextPage = page < Math.ceil(count / limit) ? `${baseUrl}/api/v1/films?page=${page + 1}` : null;
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
  const server = http.createServer((request, response) => {
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
    '/api/v1/films': (request, response) => getFilms(request, response, parseRequest(request)),
    '/api/v1/films/:id': getFilm,
    '/api/v1/films/add': addFilm,
    '/api/v1/films/add-page': (request, response) => {
      const result = filmController.getAddFilmPage(request, response);
      sendResponse(response, result);
    },

    '/api/v1/auth/regp': async (request, response) => {
      const result = await authPageController.getRegisterPage(request, response);
      sendResponse(response, result);
    },
    '/api/v1/auth/loginp': async (request, response) => {
      const result = await authPageController.getLoginPage(request, response);
      sendResponse(response, result);
    },
  
  
  };


  if (path in routes) {
    routes[path](request, response);
  } else if (path.startsWith('/api/v1/films/')) {
    const filmId = path.replace('/api/v1/films/', ''); // получаем ID фильма
    if (filmId) {
      getFilm(request, response, filmId); // если ID фильма указан, возвращаем фильм
    } else {
      sendResponse(response, error404); // если ID фильма не указан, это ошибка
    }
  } else {
    sendResponse(response, error404);
  }

});

//запуск сервера
server.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});