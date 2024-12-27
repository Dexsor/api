class authPageController {
  static async getRegisterPage(req, res) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
      <meta charset="UTF-8">
        <title>Регистрация</title>
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
          .error {
            color: red;
            font-size: 14px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        
        <form id="register-form">
          <h1>Регистрация</h1>
          <label for="username">Логин:</label>
          <input type="text" id="username" name="username" required>
    
          <label for="password">Пароль:</label>
          <input type="password" id="password" name="password" required>
    
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" required>
    
          <button type="submit">Зарегистрироваться</button>
          <div id="error-message" class="error"></div>

          <div class="toggle-link">
          <a href="/api/v1/auth/loginp">Уже зарегистрированы? Войдите</a>
          </div>
        </form>
    
        <script>
          const form = document.getElementById('register-form');
          const errorMessage = document.getElementById('error-message');
    
          form.addEventListener('submit', (e) => {
            e.preventDefault();
    
            const data = {
              username: document.getElementById('username').value,
              password: document.getElementById('password').value,
              email: document.getElementById('email').value,
            };
    
            fetch('/api/v1/auth/reg', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            })
            .then((response) => response.json())
            .then((data) => {
              if (data.message === 'Логин или почта уже используется') {
                errorMessage.textContent = 'Логин или почта уже используется';
              } else if (data.message === 'Слабый пароль') {
                errorMessage.textContent = 'Пароль должен быть не менее 8 символов в длину и содержать хотя бы одну букву в верхнем и нижнем регистре, одну цифру и один специальный символ';
              } else if (data.message === 'Вы успешно зарегистрированы') {
                errorMessage.textContent = 'Вы успешно зарегистрированы';
              }
            })
            .catch((error) => {
              errorMessage.textContent = 'Ошибка регистрации';
            });
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

  static async getLoginPage(req, res) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
      <meta charset="UTF-8">
        <title>Авторизация</title>
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
          .error {
            color: red;
            font-size: 14px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        
        <form id="login-form">
          <h1>Авторизация</h1>
          <label for="username">Логин:</label>
          <input type="text" id="username" name="username" required>
    
          <label for="password">Пароль:</label>
          <input type="password" id="password" name="password" required>
  
          <button type="submit">Войти</button>
          <div id="error-message" class="error"></div>
          <div class="toggle-link">
          <a href="/api/v1/auth/regp">Нет аккаунта? Регистрируйтесь</a>
          </div>
        </form>
    
        <script>
          const form = document.getElementById('login-form');
          const errorMessage = document.getElementById('error-message');
    
          form.addEventListener('submit', (e) => {
            e.preventDefault();
    
            const data = {
              username: document.getElementById('username').value,
              password: document.getElementById('password').value,
            };
    
            fetch('/api/v1/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            })
            .then((response) => response.json())
            .then((data) => {
              if (data.message === 'Неправильный логин или пароль') {
                errorMessage.textContent = 'Неправильный логин или пароль';
              } else if (data.token) {
                // Сохраняем токен в куки
                document.cookie = "token=" + data.token + "; path=/;  SameSite=Lax;"; // Устанавливаем куки
                errorMessage.textContent = 'Вы успешно авторизованы';
                // Перенаправление на защищенный маршрут или главную страницу
                window.location.href = '/api/v1/auth/lk';
              }
            })
            .catch((error) => {
              errorMessage.textContent = 'Ошибка авторизации';
            });
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




  static async getDashboardPage(req, res) {
      const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>Личный кабинет</title>
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
              <h2>Добро пожаловать в ваш личный кабинет!</h2>
              <p>Здесь вы можете управлять своими предпочтениями.</p>
          </div>

          <script>
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
}




module.exports = authPageController;