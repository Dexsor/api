// test/test.js
const request = require('supertest');
const assert = require('assert');
const server = require('../server'); 
const { randomInt } = require('crypto');
let hex = randomInt(1,1000);
let _id;

describe('Films API', function() {

   // this.timeout(5000); // Увеличьте время ожидания до 5 секунд
    let token; // Переменная для хранения токена

describe('Films API', () => {
  
    describe('GET /api/v1/films', () => {
        it('Получение списка фильмов', (done) => {
            request(server) 
                .get('/api/v1/films')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    assert.ok(res.body.films); // Проверяем, что films существует
                    assert(Array.isArray(res.body.films)); // Проверяем, что films - это массив
                    done();
                });
        });
    });

    describe('POST /api/v1/auth/reg', () => {
        
        it('Регистрация нового пользователя', (done) => {
            request(server) 
                .post('/api/v1/auth/reg')
                .send({ username: 'testuser'+ hex, password: 'Test@1234'+ hex, email:  hex +'test@example.com' })
                .expect(201)
                .end((err, res) => {
                    if (err) return done(err);
                    assert.strictEqual(res.body.message, 'Вы успешно зарегистрированы');
                    done();
                });
        });

        it('Ошибка регистрации:имя пользователя занято', (done) => {
            request(server) 
                .post('/api/v1/auth/reg')
                .send({ username: 'testuser'+ hex, password: 'Test@1234'+ hex, email:  hex+'test@example.com' })
                .expect(400)
                .end((err, res) => {
                    if (err) return done(err);
                    assert.strictEqual(res.body.message, 'Логин или почта уже используется');
                    done();
                });
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('Авторизация пользователя', (done) => {
            request(server) 
                .post('/api/v1/auth/login')
                .send({ username: 'testuser'+ hex , password: 'Test@1234'+ hex })
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    assert.strictEqual(res.body.message, 'Вы успешно авторизованы');
                    assert.ok(res.headers['set-cookie'][0].includes('token=')); // Проверяем наличие токена в куках
                    token = res.headers['set-cookie'][0]; // Сохраняем токен
                    done();
                });
        });

        it('Ошибка: неверные логин/пароль', (done) => {
            request(server) 
                .post('/api/v1/auth/login')
                .send({ username: 'wronguser', password: 'wrongpassword' })
                .expect(401)
                .end((err, res) => {
                    if (err) return done(err);
                    assert.strictEqual(res.body.message, 'Неправильный логин или пароль');
                    done();
                });
        });
    });

    describe('GET /api/v1/films/', () => {
        it('Фильм ID найден', (done) => {
            request(server) 
                .get('/api/v1/films/11') // Существующий ID
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    assert.ok(res.body.id);
                    assert.strictEqual(res.body.id, 11); 
                    done();
                });
        });

        it('Фильм ID НЕ найден', (done) => {
            request(server) 
                .get('/api/v1/films/404') // Несуществующий ID
                .expect(404)
                .end((err, res) => {
                    if (err) return done(err);
                    assert.strictEqual(res.body.message, 'Error 404');
                    done();
                });
        });
    });

    describe('PATCH /api/v1/films/10', () => {
        
    
        it('Обновление найденного фильма', (done) => {
            const updatedFilmData = {
                type: "movie",
                name: "ФИЛЬМ 1",
                originalname: "Не указано", // Установите значение по умолчанию, если необходимо
                released: "2027",
                description: "asda asc asasd asdas",
                director: ["672cbcebd52156843cbf1720", "6730d96736d60e1933a1c820", "673327af288fccb576743edc"],
                country: ["6733398eb8d38b8f61d064f6", "67333993b8d38b8f61d064fa", "67333999b8d38b8f61d064fe"],
                genre: ["67333933b8d38b8f61d064c4", "6733394bb8d38b8f61d064c8", "67333956b8d38b8f61d064cc"],
                age: "12",
                video_quality: "HD, FULL HD, UHD",
                url_poster: "http://video.dexsor.ru/img/1.jpg",
                url_playlist: "videotest.mp4"
            };
    
            request(server) 
                .patch('/api/v1/films/10') // Существующий ID
                .set('Cookie', token) // Передаем куки
                .send(updatedFilmData) // Отправляем данные для обновления
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    // Проверяем, что сервер возвращает обновленный фильм
                    assert.strictEqual(res.body.film.name, updatedFilmData.name); // Проверяем, что имя обновлено
                    assert.strictEqual(res.body.film.type, updatedFilmData.type); // Проверяем, что тип обновлен
                    done();
                });
        });

    });

    describe('POST /api/v1/ms/countries/add', () => {
        it('Добавление страны', (done) => {
            request(server) 
                .post('/api/v1/ms/countries/add')
                .set('Cookie', token) // Передаем куки
                .send({ name: 'New Country '+ hex})
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                   // assert.strictEqual(res.body.message, 'страна добавлена');
                    done();
                });
        });
    });

    describe('GET /api/v1/ms/countries', () => {
        it('Возврат списка стран', (done) => {
            request(server) 
                .get('/api/v1/ms/countries')
                .set('Cookie', token) // Передаем куки
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    assert.ok(Array.isArray(res.body)); // Проверяем, что ответ - это массив
                    const lastFilm = res.body[res.body.length - 1]; // Последний элемент массива
                    _id = lastFilm.id; // Получаем ID последнего фильма
                    
                    done();
                });
        });
    });

   

    describe('DELETE /api/v1/ms/countries/delete/', () => {
        it('Удаление страны', (done) => {
            request(server) 
                .delete('/api/v1/ms/countries/delete/'+_id) // Существующий ID
                .set('Cookie', token) // Передаем куки
                .expect(200)
                .end((err) => {
                    if (err) return done(err);
            
                    done();
                });
        });
    });

   
});
});