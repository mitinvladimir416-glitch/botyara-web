# Botyara Web

Сайт botyara.ru — веб-версия бота: общение, переводчик, промпты (Suno/Картинка/Видео),
обложки треков, избранное. Авторизация через email/пароль или Telegram.

## Стек

React + Vite. Обращается к бэкенду `botyara-api` (тот же, что использует Telegram-бот).

## Файлы

- `src/App.jsx` — всё приложение: экран входа + все разделы
- `src/api.js` — обёртка над запросами к бэкенду, хранение токена в localStorage
- `src/App.css` — стили (тёмная тема, фиолетовый неон, золотые акценты — в цвет бренда бота)

## Локальный запуск

```bash
npm install
npm run dev
```

Откроется на http://localhost:3000

## Важно перед деплоем

1. В `src/api.js` проверь константу `API_BASE` — должна указывать на реальный адрес бэкенда
2. В `src/App.jsx` проверь константу `BOT_USERNAME` — имя твоего Telegram-бота (без `@`)
3. Кнопка "Войти через Telegram" заработает только после того, как в @BotFather выполнишь
   `/setdomain` и укажешь домен, на котором будет жить этот сайт (например `botyara.ru`)

## Деплой на Timeweb Cloud App Platform

1. Загрузи этот код в новый репозиторий на GitHub (например `botyara-web`)
2. Timeweb Cloud → App Platform → "Создать" → тип **Frontend** → **React**
3. Подключи репозиторий, регион — тот же, где бэкенд (Амстердам)
4. Команда сборки обычно определяется автоматически (`npm install && npm run build`)
5. После деплоя привяжи домен `botyara.ru` к этому приложению (Настройки → Домены)

## После первого деплоя сайта — не забыть

1. Указать разрешённые адреса сайта в `CORS_ALLOWED_ORIGINS` у API.
2. В @BotFather выполнить `/setdomain` для рабочего входа через Telegram.

## Configuration

Set `VITE_API_BASE_URL` at build time to point the client at the API. The value must be an absolute HTTP(S) URL. If it is omitted, the current production API URL is used.
