//uenv.js
const fs = require('fs');

function parseEnvFile(data) {
    const result = {};
    const lines = data.split('\n');

    for (let line of lines) {
        line = line.trim();
        // Игнорируем пустые строки и комментарии
        if (line && !line.startsWith('#')) {
            const [key, value] = line.split('=');
            if (key && value !== undefined) {
                result[key.trim()] = value.trim();
            }
        }
    }

    return result;
}

function loadEnv(filePath = '.env') {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Файл ${filePath} не найден`);
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    const envVariables = parseEnvFile(data);

    for (const key in envVariables) {
        process.env[key] = envVariables[key];
    }
}

module.exports = { loadEnv };