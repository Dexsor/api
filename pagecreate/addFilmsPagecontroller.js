//страница создается сервером для добавления фильмов в дб для тестирования-неполноценная версия
//нет выборки фильм иили сериал
//нет списка жанров, стран, года релиза и тд, пишем руками

class addFilmsPagecontroller {
  async addFilm(req, res) {
    console.log(req.body);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Фильм добавлен!',
    };
  }


  //метод возвращает HTMLстраницу для добавления фильма
//принимает два параметра: req -объект запроса    и res -объект ответа
  getAddFilmPage(req, res) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
      <meta charset="UTF-8">
        <title>Добавить фильм</title>
        <style>
          body {
            font-family: Arial, sans-serif;
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
          input, textarea {
            width: 95.5%;
            height: 40px;
            margin-bottom: 20px;
            padding: 10px;
            border: 1px solid #ccc;
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
        </style>
      </head>
      <body>
        <h1>Добавить фильм</h1>
        <form id="add-film-form">
          <label for="title">Название:</label>
          <input type="text" id="title" name="title" required>
  
          <label for="originname">Оригинальное название:</label>
          <input type="text" id="originname" name="originname" required>
  
          <label for="released">Год выпуска:</label>
          <input type="number" id="released" name="released" required>
  
          <label for="description">Описание:</label>
          <textarea id="description" name="description" required></textarea>
  
          <label for="director">Режиссёр:</label>
          <input type="text" id="director" name="director" required>
  
          <label for="country">Страна:</label>
          <input type="text" id="country" name="country" required>
  
          <label for="genre">Жанр:</label>
          <input type="text" id="genre" name="genre" required>
  
          <label for="age">Возрастное ограничение:</label>
          <input type="number" id="age" name="age" required>
  
          <label for="video_quality">Качество видео:</label>
          <input type="text" id="video_quality" name="video_quality" required>
  
          <label for="url_poster">URL постера:</label>
          <input type="text" id="url_poster" name="url_poster" required>
  
          <label for="url_playlist">URL плейлиста:</label>
          <input type="text" id="url_playlist" name="url_playlist" required>
  
          <button type="submit">Добавить фильм</button>
        </form>
  
        <script>
          const form = document.getElementById('add-film-form');
  
          form.addEventListener('submit', (e) => {
            e.preventDefault();
  
            const data = {
              type: 'movie',
              name: document.getElementById('title').value,
              originname: document.getElementById('originname').value,
              released: document.getElementById('released').value,
              description: document.getElementById('description').value,
              director: document.getElementById('director').value,
              country: document.getElementById('country').value,
              genre: document.getElementById('genre').value,
              age: document.getElementById('age').value,
              video_quality: document.getElementById('video_quality').value,
              url_poster: document.getElementById('url_poster').value,
              url_playlist: document.getElementById('url_playlist').value,
            };
  
            fetch('/api/v1/films/add', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            })
            .then((response) => response.json())
            .then((data) => console.log(data))
            .catch((error) => console.error(error));
          });
       
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

module.exports = addFilmsPagecontroller;