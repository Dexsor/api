const crypto = require('crypto');

class UWebToken {
  constructor(secret) {
    this.secret = secret;
  }

  // Функция для создания токена
  sign(dataload, time) {
    console.log("токентайм = " + time);
    const header = {
      alg: 'HS256',
      typ: 'UWT',
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedDataLoad = this.base64UrlEncode(JSON.stringify({ ...dataload, endTime: this.getEndTime(time) }));

    const signature = this.createSignature(encodedHeader, encodedDataLoad);
    return `${encodedHeader}.${encodedDataLoad}.${signature}`;
  }

  // Функция для проверки токена
  verify(token) {
    if (!token) {
      throw new Error('Токен отсутствует');
    }

    const [header, dataload, signature] = token.split('.');
    const validSignature = this.createSignature(header, dataload);

    if (signature !== validSignature) {
      throw new Error('Ошибка проверки подписи');
    }

    const decodedDataLoad = JSON.parse(this.base64UrlDecode(dataload));
    if (decodedDataLoad.endTime < Math.floor(Date.now() / 1000)) {
      throw new Error('Срок действия токена истек');
    }

    return decodedDataLoad;
  }

  // Функция для создания подписи
  createSignature(header, dataload) {
    const data = `${header}.${dataload}`;
    return this.base64UrlEncode(crypto.createHmac('sha256', this.secret).update(data).digest('base64'));
  }

  // Функция для получения времени истечения токена
  getEndTime(time) {
    return Math.floor((Date.now() / 1000) + Number(time));
  }

  // Функция для кодирования в base64Url
  base64UrlEncode(str) {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  // Функция для декодирования из base64Url
  base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - str.length % 4) % 4);
    return Buffer.from(str + padding, 'base64').toString('utf-8');
  }
}

// Экспорт класса
module.exports = UWebToken;