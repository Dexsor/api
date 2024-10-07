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
        <h1>Регистрация</h1>
        <form id="register-form">
          <label for="username">Логин:</label>
          <input type="text" id="username" name="username" required>
    
          <label for="password">Пароль:</label>
          <input type="password" id="password" name="password" required>
    
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" required>
    
          <button type="submit">Зарегистрироваться</button>
          <div id="error-message" class="error"></div>
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
        <h1>Авторизация</h1>
        <form id="login-form">
          <label for="username">Логин:</label>
          <input type="text" id="username" name="username" required>
    
          <label for="password">Пароль:</label>
          <input type="password" id="password" name="password" required>

                <button type="submit">Войти</button>
                <div id="error-message" class="error"></div>
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
              } else if (data.message === 'Вы успешно авторизованы') {
                errorMessage.textContent = 'Вы успешно авторизованы';
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
}

module.exports = authPageController;