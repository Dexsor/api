//pageController.js
//////////////CGD controller///////////////
class CGDController {
 
   
  async getCGDPage(req, res, filmsDB, type) {
    try {

      let CGDs;
      let nameCGD;
      let nameCGDs;
      let nameCGD1;
      let nameCGD2;
      let apiCGD;
     if (type === "genre") {
        nameCGD = "жанр";//${nameCGD}
        nameCGDs = "жанров";//${nameCGDs}
        nameCGD1 = "жанра";//${nameCGD1}
        nameCGD2 = "жанр";//${nameCGD2}
        apiCGD = "genres"//${apiCGD}
        CGDs = await filmsDB.getCGDs(0, 0, type);
     } else if (type === "country") {
        nameCGD = "страна";//${nameCGD}
        nameCGDs = "стран";//${nameCGDs}
        nameCGD1 = "страны";//${nameCGD1}
        nameCGD2 = "страну";//${nameCGD2}
        apiCGD = "countries"//${apiCGD}
        CGDs = await filmsDB.getCGDs(0, 0, type);
     } else if (type === "director") {
        nameCGD = "режиссер";//${nameCGD}
        nameCGDs = "режиссеров";//${nameCGDs}
        nameCGD1 = "режиссера";//${nameCGD1}
        nameCGD2 = "режиссера";//${nameCGD2}
        apiCGD = "directors"//${apiCGD}
        CGDs = await filmsDB.getCGDs(0, 0, type);
     } else {
       CGDs = null; // или любое другое значение по умолчанию
     }
      console.log(type);

       // console.log("getCountries");
       // const countries = await filmsDB.getCountries(); // Получаем список стран
        //console.log("Countries:", countries); // Выводим страны в консоль

        // Проверяем, что countries не пустой
        if (!CGDs || CGDs.length === 0) {
            console.log("Нет CGD для отображения.");
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'text/html' },
                body: '<h1>Нет CGDs для отображения.</h1>',
            };
        }

        // Извлекаем данные из объектов модели
        const CGDData = CGDs.map(CGD => ({
            id: CGD._id, // Используем country._id, если это поле доступно
            name: CGD.name // Заменяем на правильное поле
        }));

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Список ${nameCGDs}</title>
                <style>
                    body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
              }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    button { background-color: #4CAF50; color: white; border: none; padding: 10px; cursor: pointer; }
                    button:hover { background-color: #45a049; }

              .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 10px 20px;
                  background-color: #4CAF50;
                  color: white;
              }
              .header h1 {
                  margin: 0;
              }
              .nav {
                  margin: 20px;
                  text-align: center;
              }
              .nav a {
                  margin: 0 15px;
                  text-decoration: none;
                  color: #4CAF50;
                  font-weight: bold;
              }
              .nav a:hover {
                  text-decoration: underline;
              }
              .logout-button {
                  background-color: #f44336; /* Красный цвет для кнопки выхода */
                  color: white;
                  border: none;
                  padding: 10px 15px;
                  border-radius: 5px;
                  cursor: pointer;
              }
              .logout-button:hover {
                  background-color: #d32f2f; /* Темнее при наведении */
              }

              .content {
                  padding: 20px;
                  text-align: center;
              }
                </style>
            </head>
            <body>

               <div class="header">
              <h1>Личный кабинет</h1>
              <button class="logout-button" onclick="logout()">Выход</button>
              </div>

                <div class="nav">
                <a href="/api/v1/ms/films/add-page">Добавить фильм</a>
                <a href="/api/v1/ms/films/list">Список фильмов</a>
                <a href="/api/v1/ms/genres/edit-page">Жанры</a>
                <a href="/api/v1/ms/countries/edit-page">Страны</a>
                <a href="/api/v1/ms/directors/edit-page">Режиссеры</a>
                </div>

                
                <div class="content">
                <h1>Список ${nameCGDs}</h1>
                <table id="CGD-table">
                    <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Действия</th>
                    </tr>
                    ${CGDData.map(CGD => `
                        <tr data-id="${CGD.id}">
                            <td>${CGD.id}</td>
                            <td class="CGD-name" data-id="${CGD.id}">${CGD.name}</td>
                            <td>
                                <button class="edit-button" data-id="${CGD.id}">Редактировать</button>
                                <button class="delete-button" data-id="${CGD.id}">Удалить</button>
                            </td>
                        </tr>
                    `).join('')}
                </table>
                <h2>Добавить ${nameCGD2}</h2>
                <form id="add-CGD-form">
                    <label for="name">Название ${nameCGD1}:</label>
                    <input type="text" id="name" name="name" required>
                    <button type="submit">Добавить ${nameCGD2}</button>
                </form></div>

                <script>
                    const form = document.getElementById('add-CGD-form');

                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();

                        const data = {
                            name: document.getElementById('name').value,
                        };

                        try {
                            const response = await fetch('/api/v1/ms/${apiCGD}/add', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(data),
                            });

                            if (!response.ok) {
                                throw new Error('Ошибка при добавлении ${nameCGD1}');
                            }
                            
                           
                                                      

                            const newCGD = await response.json();
                             if (newCGD.success) {
                             console.log("newCGD.success = "+ newCGD.id + newCGD.name + newCGD.success);
                             const confirmed = confirm('${nameCGD} сущестует в базе');
                             return;
                             }

                            // Обновляем таблицу стран
                            const newRow = \`
                                <tr data-id="\${newCGD.id}">
                                    <td>\${newCGD.id}</td>
                                    <td class="CGD-name" data-id="\${newCGD.id}">\${newCGD.name}</td>
                                    <td>
                                        <button class="edit-button" data-id="\${newCGD.id}">Редактировать</button>
                                        <button class="delete-button" data-id="\${newCGD.id}">Удалить</button>
                                    </td>
                                </tr>
                            \`;
                            document.getElementById('CGD-table').insertAdjacentHTML('beforeend', newRow);
                            document.getElementById('name').value = ''; // Очищаем поле ввода
                        } catch (error) {
                            console.error(error);
                            alert('Произошла ошибка при добавлении ${nameCGD1}. Пожалуйста, попробуйте еще раз.');
                        }
                    });

                                        // Обработка удаления страны
                  document.getElementById('CGD-table').addEventListener('click', async (e) => {
                      if (e.target.classList.contains('delete-button')) {
                          const CGDId = e.target.getAttribute('data-id');
                          

                         
                              try {
                                  const response = await fetch(\`/api/v1/ms/${apiCGD}/delete/\${CGDId}\`, {
                                      method: 'DELETE',
                                  });

                                  if (!response.ok) {
                                      throw new Error('Ошибка при удалении ${nameCGD1}');
                                  }

                                  // Удаляем строку из таблицы
                                  const row = e.target.closest('tr');
                                  row.remove();
                              } catch (error) {
                                  console.error(error);
                                alert('Произошла ошибка при удалении ${nameCGD1}. Пожалуйста, попробуйте еще раз.');
                              }
                          
                      }

                      // Обработка редактирования страны
                     if (e.target.classList.contains('edit-button')) {
                          const button = e.target;
                          const CGDId = button.dataset.id;
                          const row = button.closest('tr');
                          const cell = row.querySelector('.CGD-name');
                          const currentName = cell.innerText;

                          // Создаем поле ввода
                          const input = document.createElement('input');
                          input.type = 'text';
                          input.value = currentName;
                          cell.innerHTML = ''; // Очищаем ячейку
                          cell.appendChild(input);

                          // Заменяем кнопку "Редактировать" на кнопку "Сохранить"
                          button.innerText = 'Сохранить';
                          button.classList.remove('edit-button');
                          button.classList.add('save-button');

                          // Обработка нажатия кнопки "Сохранить"
                          button.addEventListener('click', async () => {
                              const newName = input.value;

                              // Отправляем обновленное название на сервер
                              try {
                                  const response = await fetch(\`/api/v1/ms/${apiCGD}/update/\${CGDId}\`, {
                                      method: 'PUT',
                                      headers: {
                                          'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify({ name: newName }),
                                  });

                                  console.log("Обновляем ${nameCGD2} " + newName);
                                  if (response.ok) {
                                      // Обновляем ячейку с новым названием
                                      cell.innerHTML = newName; // Устанавливаем новое название
                                      button.innerText = 'Редактировать'; // Возвращаем текст кнопки
                                      button.classList.remove('save-button');
                                      button.classList.add('edit-button');
                                  } else {
                                      // Обработка ошибки
                                      alert('Ошибка при обновлении названия ${nameCGD1}');
                                      cell.innerHTML = currentName; // Возвращаем старое название
                                      button.innerText = 'Редактировать'; // Возвращаем текст кнопки
                                      button.classList.remove('save-button');
                                      button.classList.add('edit-button');
                                  }
                              } catch (error) {
                                  console.error(error);
                                  alert('Произошла ошибка при обновлении названия ${nameCGD1}. Пожалуйста, попробуйте еще раз.');
                                  cell.innerHTML = currentName; // Возвращаем старое название
                                  button.innerText = 'Редактировать'; // Возвращаем текст кнопки
                                  button.classList.remove('save-button');
                                  button.classList.add('edit-button');
                              }
                          });

                          // Убираем выделение
                          input.focus();
                      }
                  });

                  function logout() {
                    
                    document.cookie = "token=; Max-Age=0; path=/; SameSite=Lax;"; // Удаляем токен
                    window.location.href = '/api/v1/auth/loginp'; // Перенаправляем на страницу авторизации
                }
              </script>
          </body>
          </html>
      `;

      // Возвращаем HTML-код страницы
      return {
          statusCode: 200,
          headers: { 'Content-Type': 'text/html' },
          body: html,
      };
  } catch (error) {
      console.error('Ошибка при получении ${nameCGDs}:', error);
      return {
          statusCode: 500,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Произошла ошибка при получении ${nameCGDs}.',
      };
  }
} 






async getAddFilmPage(req, res) {
    const html = `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Добавить фильм</title>
        <style>
          body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
              }
                
              .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 10px 20px;
                  background-color: #4CAF50;
                  color: white;
              }
              .header h1 {
                  margin: 0;
              }
              .nav {
                  margin: 20px;
                  text-align: center;
              }
              .nav a {
                  margin: 0 15px;
                  text-decoration: none;
                  color: #4CAF50;
                  font-weight: bold;
              }
              .nav a:hover {
                  text-decoration: underline;
              }
              .logout-button {
                  background-color: #f44336; /* Красный цвет для кнопки выхода */
                  color: white;
                  border: none;
                  padding: 10px 15px;
                  border-radius: 5px;
                  cursor: pointer;
              }
              .logout-button:hover {
                  background-color: #d32f2f; /* Темнее при наведении */
              }

              .content {
                  padding: 20px;
                  text-align: center;
              }
          form {
            width: 500px;
            margin: 40px auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          label {
            display: block;
            margin-bottom: 10px;
          }
          input, select, textarea {
            width: 95.5%;
            height: 40px;
            margin-bottom: 20px;
            padding: 10px;
            border: 1px solid #ccc;
          }
            /* Стили для селекта с id="genre" */
          select[id="genre"], select[id="country"],select[id="director"] {
            height: auto; /* Высота для селекта */
            min-height: 80px; /* Минимальная высота */
          }

          button[type="submit"] {
            width: 100%;
            height: 40px;
            background-color: #4CAF50;
            color: #fff;
            padding: 10px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
          button[type="submit"]:hover {
            background-color: #3e8e41;
          }

          

  

  .selected-option {
    background-color: #4CAF50; /* Цвет фона для выделенных опций */
    color: white; /* Цвет текста для выделенных опций */

  }

</style>
        </style>
      </head>
      <body>
        <div class="header">
              <h1>Личный кабинет</h1>
              <button class="logout-button" onclick="logout()">Выход</button>
              </div>

                <div class="nav">
                <a href="/api/v1/ms/films/add-page">Добавить фильм</a>
                <a href="/api/v1/ms/films/list/">Список фильмов</a>
                <a href="/api/v1/ms/genres/edit-page">Жанры</a>
                <a href="/api/v1/ms/countries/edit-page">Страны</a>
                <a href="/api/v1/ms/directors/edit-page">Режиссеры</a>
                </div>
        <div class="content">
        <h1>Добавить фильм</h1>
        <form id="add-film-form">

           <label for="type">Тип:</label>
           <select id="type" name="type" required>
           <option value="" disabled selected>Выберите тип</option>
           <option value="movie">Фильм</option>
           <option value="series">Сериал</option>
           </select>


          <label for="title">Название:</label>
          <input type="text" id="title" name="title" required>

          <label for="originalname">Оригинальное название:</label>
          <input type="text" id="originalname" name="originalname" required>

          <label for="released">Год выпуска:</label>
          <input type="number" id="released" name="released" required>

          <label for="description">Описание:</label>
          <textarea id="description" name="description" required></textarea>

          <label for="director">Режиссёр:</label>
          <select id="director" name="director" multiple required>
           
          </select>

          <label for="country">Страна:</label>
          <select id="country" name="country" multiple required>
          
          </select>

          <label for="genre">Жанр:</label>
          <select id="genre" name="genre" multiple required>
          
          </select>

          <label for="age">Возрастное ограничение:</label>
          <input type="number" id="age" name="age" required>

          <label for="video_quality">Качество видео:</label>
          <input type="text" id="video_quality" name="video_quality" required>

                    <label for="url_poster">URL постера:</label>
          <input type="text" id="url_poster" name="url_poster" required>

          <label for="url_playlist">URL плейлиста:</label>
          <input type="text" id="url_playlist" name="url_playlist" required>

          <button type="submit">Добавить фильм</button>
        </form></div>

        <script>
          async function loadOptions(url, selectId) {

    try {

      const response = await fetch(url);
      if (!response.ok) throw new Error('Сетевая ошибка');
      const data = await response.json();
      console.log(data);
      const select = document.getElementById(selectId);
      data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id; // Используем id как значение
        option.textContent = item.name; // Используем имя как текст
        select.appendChild(option);
      });
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);

    }

  }

          document.addEventListener('DOMContentLoaded', () => {
            loadOptions('/api/v1/ms/directors', 'director');
            loadOptions('/api/v1/ms/countries', 'country');
            loadOptions('/api/v1/ms/genres', 'genre');
          });


          // Добавляем обработчики событий для выделения опций
    const selects = document.querySelectorAll('select[multiple]');
    selects.forEach(select => {
      select.addEventListener('change', () => {
        Array.from(select.options).forEach(option => {
          if (option.selected) {
            option.classList.add('selected-option'); // Добавляем класс для выделенной опции
          } else {
            option.classList.remove('selected-option'); // Убираем класс для невыделенной опции

          }

        });

      });

    });

  
          const form = document.getElementById('add-film-form');

          form.addEventListener('submit', (e) => {
            e.preventDefault();

            const data = {
              type: document.getElementById('type').value,
              name: document.getElementById('title').value,
              originalname: document.getElementById('originalname').value,
              released: document.getElementById('released').value,
              description: document.getElementById('description').value,
              director: Array.from(document.getElementById('director').selectedOptions).map(option => option.value), // Получаем массив выбранных идентификаторов режиссеров
              country: Array.from(document.getElementById('country').selectedOptions).map(option => option.value), // Получаем массив выбранных идентификаторов стран
              genre: Array.from(document.getElementById('genre').selectedOptions).map(option => option.value), // Получаем массив выбранных идентификаторов жанров
              age: document.getElementById('age').value,
              video_quality: document.getElementById('video_quality').value,
              url_poster: document.getElementById('url_poster').value,
              url_playlist: document.getElementById('url_playlist').value,
            };

            fetch('/api/v1/ms/films/add', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            })
            .then((response) => {
              if (!response.ok) {
                throw new Error('Ошибка при добавлении фильма');
              }
              return response.json();
            })
            .then((data) => {
              console.log(data);
              alert('Фильм успешно добавлен!');
              form.reset(); // Очистить форму после успешного добавления
            })
            .catch((error) => {
              console.error(error);
              alert('Произошла ошибка при добавлении фильма.');
            });
          });
          function logout() {
                    
                    document.cookie = "token=; Max-Age=0; path=/; SameSite=Lax;"; // Удаляем токен
                    window.location.href = '/api/v1/auth/loginp'; // Перенаправляем на страницу авторизации
                }
        </script>
      </body>
      </html>
    `;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html,
    };
  }





  async getEditFilmPage(req, res, filmsDB, filmId) {
    //const film = await filmsDB.getFilm(filmId); // Получаем фильм по ID
    const film = await filmsDB.Film.findOne({ id: filmId }); // Изменено на findOne с использованием поля id

    if (!film) {
      return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body:  JSON.stringify({ error: 'Фильм не найден' }),
      };

      


        
    }

    

    // Получаем всех режиссёров, стран и жанров
    const directors = await filmsDB.getDirectors(); // Получаем всех режиссёров
    const countries = await filmsDB.getCountries(); // Получаем все страны
    const genres = await filmsDB.getGenres(); // Получаем все жанры

    

    // Получаем связанные с фильмом данные
    const filmDirectors = await filmsDB.FilmDirector.find({ film_id: film._id }).populate('director_id');
    const filmCountries = await filmsDB.FilmCountry.find({ film_id: film._id }).populate('country_id');
    const filmGenres = await filmsDB.FilmGenre.find({ film_id: film._id }).populate('genre_id');
    


    
  
    // Извлекаем ID для использования в форме
    const directorIds = filmDirectors.map(fd => fd.director_id._id.toString());
    const countryIds = filmCountries.map(fc => fc.country_id._id.toString());
    const genreIds = filmGenres.map(fg => fg.genre_id._id.toString());

    



    
    const html = `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Редактировать фильм</title>
        <style>
          body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
              }
                
              .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 10px 20px;
                  background-color: #4CAF50;
                  color: white;
              }
              .header h1 {
                  margin: 0;
              }
              .nav {
                  margin: 20px;
                  text-align: center;
              }
              .nav a {
                  margin: 0 15px;
                  text-decoration: none;
                  color: #4CAF50;
                  font-weight: bold;
              }
              .nav a:hover {
                  text-decoration: underline;
              }
              .logout-button {
                  background-color: #f44336; /* Красный цвет для кнопки выхода */
                  color: white;
                  border: none;
                  padding: 10px 15px;
                  border-radius: 5px;
                  cursor: pointer;
              }
              .logout-button:hover {
                  background-color: #d32f2f; /* Темнее при наведении */
              }

              .content {
                  padding: 20px;
                  text-align: center;
              }
          form {
            width: 500px;
            margin: 40px auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          label {
            display: block;
            margin-bottom: 10px;
          }
          input, select, textarea {
            width: 95.5%;
            height: 40px;
            margin-bottom: 20px;
            padding: 10px;
            border: 1px solid #ccc;
          }
          select[id="genre"], select[id="country"], select[id="director"] {
            height: auto; /* Высота для селекта */
            min-height: 80px; /* Минимальная высота */
          }
          button[type="submit"] {
            width: 100%;
            height: 40px;
            background-color: #4CAF50;
            color: #fff;
            padding: 10px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
          button[type="submit"]:hover {
            background-color: #3e8e41;
          }
          /* Стили для выделенных опций */
          .selected-option {
            background-color: #4CAF50; /* Цвет фона для выделенных опций */
            color: white; /* Цвет текста для выделенных опций */
          }
        </style>
      </head>
      <body>

        <div class="header">
              <h1>Личный кабинет</h1>
              <button class="logout-button" onclick="logout()">Выход</button>
              </div>

                <div class="nav">
                <a href="/api/v1/ms/films/add-page">Добавить фильм</a>
                <a href="/api/v1/ms/films/list">Список фильмов</a>
                <a href="/api/v1/ms/genres/edit-page">Жанры</a>
                <a href="/api/v1/ms/countries/edit-page">Страны</a>
                <a href="/api/v1/ms/directors/edit-page">Режиссеры</a>
                </div>
        <div class="content">
        <h1>Редактировать фильм</h1>
        <form id="edit-film-form">
          <label for="type">Тип:</label>
          <select id="type" name="type" required>
          <option value="movie" ${film.type === 'movie' ? 'selected' : ''}>Фильм</option>
          <option value="series" ${film.type === 'series' ? 'selected' : ''}>Сериал</option>
          </select>

          <label for="title">Название:</label>
          <input type="text" id="title" name="title" value="${film.name}" required>

          <label for="originalname">Оригинальное название:</label>
          <input type="text" id="originalname" name="originalname" value="${film.originalname}" required>

          <label for="released">Год выпуска:</label>
          <input type="number" id="released" name="released" value="${film.released}" required>

          <label for="description">Описание:</label>
          <textarea id="description" name="description" required>${film.description}</textarea>

          <label for="director">Режиссёр:</label>
          <select id="director" name="director" multiple required>
            ${directors.map(director => `
              <option value="${director._id}" ${directorIds.includes(director._id.toString()) ? 'selected' : ''}>
                ${director.name}
              </option>
            `).join('')}
          </select>

          <label for="country">Страна:</label>
          <select id="country" name="country" multiple required>
            ${countries.map(country => `
              <option value="${country._id}" ${countryIds.includes(country._id.toString()) ? 'selected' : ''}>
                ${country.name}
              </option>
            `).join('')}
          </select>

          <label for="genre">Жанр:</label>
          <select id="genre" name="genre" multiple required>
            ${genres.map(genre => `
              <option class="selected-option" value="${genre._id}" ${genreIds.includes(genre._id.toString()) ? 'selected' : ''}>
                ${genre.name}
              </option>
            `).join('')}
          </select>

          <label for="age">Возрастное ограничение:</label>
          <input type="number" id="age" name="age" value="${film.age}" required>

          <label for="video_quality">Качество видео:</label>
          <input type="text" id="video_quality" name="video_quality" value="${film.video_quality}" required>

          <label for="url_poster">URL постера:</label>
          <input type="text" id="url_poster" name="url_poster" value="${film.url_poster}" required>

          <label for="url_playlist">URL плейлиста:</label>
          <input type="text" id="url_playlist" name="url_playlist" value="${film.url_playlist}" required>

          <button type="submit">Обновить фильм</button>
        </form></div>

        <script>
          const form = document.getElementById('edit-film-form');

          // Функция для выделения выбранных опций
          function highlightSelectedOptions(selectId) {
            const select = document.getElementById(selectId);
            Array.from(select.options).forEach(option => {
              if (option.selected) {
                option.classList.add('selected-option'); // Добавляем класс для выделенной опции
              } else {
                option.classList.remove('selected-option'); // Убираем класс для невыделенной опции
              }
            });
          }

          // Выделяем опции при загрузке страницы
          highlightSelectedOptions('director');
          highlightSelectedOptions('country');
          highlightSelectedOptions('genre');

          // Обработчик события для выделения опций при изменении
          const selects = document.querySelectorAll('select[multiple]');
          selects.forEach(select => {
            select.addEventListener('change', () => {
              highlightSelectedOptions(select.id);
            });
          });

          form.addEventListener('submit', (e) => {
            e.preventDefault();

            const data = {
              type: document.getElementById('type').value,
              name: document.getElementById('title').value,
              originalname: document.getElementById('originalname').value,
              released: document.getElementById('released').value,
              description: document.getElementById('description').value,
              director: Array.from(document.getElementById('director').selectedOptions).map(option => option.value),
              country: Array.from(document.getElementById('country').selectedOptions).map(option => option.value),
              genre: Array.from(document.getElementById('genre').selectedOptions).map(option => option.value),
              age: document.getElementById('age').value,
              video_quality: document.getElementById('video_quality').value,
              url_poster: document.getElementById('url_poster').value,
              url_playlist: document.getElementById('url_playlist').value,
            };

            fetch('/api/v1/films/${filmId}', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            })
            .then((response) => {
              if (!response.ok) {
                throw new Error('Ошибка при обновлении фильма');
              }
              return response.json();
            })
            .then((data) => {
              console.log(data);
              alert('Фильм успешно обновлен!');
              form.reset(); // Очистить форму после успешного обновления
            })
            .catch((error) => {
              console.error(error);
              alert('Произошла ошибка при обновлении фильма.');
            });
          });

          function logout() {
                    
                    document.cookie = "token=; Max-Age=0; path=/; SameSite=Lax;"; // Удаляем токен
                    window.location.href = '/api/v1/auth/loginp'; // Перенаправляем на страницу авторизации
                }
        </script>
      </body>
      </html>
    `;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html,
    };
}






async getFilmsPage(req, res) {
      const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>Список фильмов</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
              }
              .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 10px 20px;
                  background-color: #4CAF50;
                  color: white;
              }
              .header h1 {
                  margin: 0;
              }
              .nav {
                  margin: 20px;
                  text-align: center;
              }
              .nav a {
                  margin: 0 15px;
                  text-decoration: none;
                  color: #4CAF50;
                  font-weight: bold;
              }
              .nav a:hover {
                  text-decoration: underline;
              }
              .logout-button {
                  background-color: #f44336; /* Красный цвет для кнопки выхода */
                  color: white;
                  border: none;
                  padding: 10px 15px;
                  border-radius: 5px;
                  cursor: pointer;
              }
              .logout-button:hover {
                  background-color: #d32f2f; /* Темнее при наведении */
              }
              .content {
                  padding: 20px;
                  text-align: center;
              }
              .film-list {
                  display: flex;
                  flex-wrap: wrap;
                  justify-content: center;
                  padding: 20px;
              }
              .film-card {
                  background-color: white;
                  border: 1px solid #ccc;
                  border-radius: 10px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  margin: 10px;
                  padding: 10px;
                  width: 200px; /* Ширина карточки */
                  text-align: center;
              }
              .film-card img {
                  max-width: 100%;
                  border-radius: 5px;
              }
              .film-card h3 {
                  margin: 10px 0;
              }
              .film-card p {
                  margin: 5px 0;
              }
              .pagination {
                  text-align: center;
                  margin: 20px 0;
              }
              .pagination button {
                  background-color: #4CAF50;
                  color: white;
                  border: none;
                  padding: 10px 15px;
                  border-radius: 5px;
                  cursor: pointer;
                  margin: 0 5px;
              }
              .pagination button:disabled {
                  background-color: #ccc; /* Серый цвет для отключенной кнопки */
                  cursor: not-allowed;
              }
          </style>
      </head>
      <body>
           <div class="header">
              <h1>Личный кабинет</h1>
              <button class="logout-button" onclick="logout()">Выход</button>
              </div>

                <div class="nav">
                <a href="/api/v1/ms/films/add-page">Добавить фильм</a>
                <a href="/api/v1/ms/films/list">Список фильмов</a>
                <a href="/api/v1/ms/genres/edit-page">Жанры</a>
                <a href="/api/v1/ms/countries/edit-page">Страны</a>
                <a href="/api/v1/ms/directors/edit-page">Режиссеры</a>
                </div>
                
          <div class="content">
              <h1>Список фильмов</h1>
              
          
          <div class="film-list" id="film-list">
              <!-- Фильмы будут загружены сюда -->
          </div>
          <div class="pagination" id="pagination">
              <button id="prev-button" onclick="fetchFilms(currentPage - 1)" disabled>Предыдущая</button>
              <button id="next-button" onclick="fetchFilms(currentPage + 1)">Следующая</button>
          </div>
          </div>
          <script>
              let currentPage = 1; // Текущая страница

              async function fetchFilms(page = 1) {
                  try {
                      const response = await fetch('/api/v1/films?page=' + page);
                      const data = await response.json();
                      const filmList = document.getElementById('film-list');
                      filmList.innerHTML = ''; // Очищаем предыдущие фильмы

                      data.films.forEach(film => {
                          const filmCard = document.createElement('div');
                          filmCard.className = 'film-card';
                          filmCard.innerHTML = \`
                              <img src="\${film.url_poster}" alt="\${film.name}" onerror="this.src='/img/posterError.jpg';">
                              
                              <h3>\${film.name}</h3>
                              <p>Год: \${film.released}</p>
                              <a href="/api/v1/ms/film/edit-page/\${film.id}">Редактировать</a>
                          \`;
                          filmList.appendChild(filmCard);
                      });

                      // Обновляем текущую страницу
                      currentPage = page;

                                              // Управляем состоянием кнопок пагинации
                        document.getElementById('prev-button').disabled = !data.page.current || data.page.current === 1;
                        document.getElementById('next-button').disabled = !data.page.next;

                    } catch (error) {
                        console.error('Ошибка при загрузке фильмов:', error);
                    }
                }

                function logout() {
                    
                    document.cookie = "token=; Max-Age=0; path=/; SameSite=Lax;"; // Удаляем токен
                    window.location.href = '/api/v1/auth/loginp'; // Перенаправляем на страницу авторизации
                }

                // Загружаем фильмы при загрузке страницы
                window.onload = () => fetchFilms(currentPage);
            </script>
        </body>
        </html>
        `;

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'text/html' },
            body: html,
        };
    }
}
///////////////////////////////

module.exports = CGDController ;
