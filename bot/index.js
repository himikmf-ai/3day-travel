import 'dotenv/config';
import { Telegraf, Markup } from 'telegraf';
import fs from 'fs';
import path from 'path';
import express from 'express';

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL;

if (!BOT_TOKEN || !WEBAPP_URL) {
  console.error('BOT_TOKEN или WEBAPP_URL не заданы в .env');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

const tripPath = path.join(process.cwd(), 'bot', 'sochi-trip.json');
const tripData = JSON.parse(fs.readFileSync(tripPath, 'utf-8'));

bot.start((ctx) => {
  return ctx.reply(
    'Привет! Соберём для тебя маршрут "3 дня в Сочи". Можешь открыть мини‑приложение или получить маршрут прямо тут.',
    Markup.keyboard([
      [Markup.button.webApp('Открыть Mini App', WEBAPP_URL)],
      ['Получить маршрут в чат']
    ]).resize()
  );
});

bot.hears('Получить маршрут в чат', (ctx) => {
  const text = formatTripForChat(tripData);
  return ctx.reply(text, { disable_web_page_preview: true });
});

bot.on('web_app_data', (ctx) => {
  try {
    const data = JSON.parse(ctx.webAppData.data);
    ctx.reply('Настройки маршрута получены!');
  } catch (e) {
    ctx.reply('Не удалось обработать данные из Mini App.');
  }
});

function formatTripForChat(trip) {
  let out = `Маршрут: ${trip.title}\n\n`;
  for (const day of trip.days) {
    out += `День ${day.day_number}: ${day.title}\n`;
    for (const item of day.items) {
      out += `• ${item.title}\n`;
    }
    out += '\n';
  }
  return out;
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post(`/bot${BOT_TOKEN}`, (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Bot server running on port ${PORT}`);
});

bot.launch().then(() => console.log('Bot started'));
