import 'dotenv/config';
import { Telegraf, Markup } from 'telegraf';
import fs from 'fs';
import path from 'path';
import express from 'express';

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL;
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN || !WEBAPP_URL) {
  console.error('BOT_TOKEN или WEBAPP_URL не заданы в .env');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const app = express();

const tripPath = path.join(process.cwd(), 'bot', 'sochi-trip.json');
let tripData = {};

try {
  tripData = JSON.parse(fs.readFileSync(tripPath, 'utf-8'));
} catch (e) {
  console.warn('Не удалось прочитать sochi-trip.json, использую default данные');
  tripData = { trip_id: 'default', title: '3 дня в Сочи', days: [] };
}

bot.start((ctx) => {
  return ctx.reply(
    'Привет! Наш маршрут «3 дня в Сочи» готов!',
    Markup.keyboard([
      [Markup.button.webApp('Выбор дня', WEBAPP_URL)],
      ['Получить маршрут']
    ]).resize()
  );
});

bot.hears('Получить маршрут', (ctx) => {
  let text = `*Маршрут: ${tripData.title}*\n\n`;
  if (tripData.days && tripData.days.length > 0) {
    for (const day of tripData.days) {
      text += `\n*День ${day.day_number}: ${day.title}*\n`;
      if (day.items) {
        for (const item of day.items) {
          text += `• ${item.title}\n`;
        }
      }
    }
  } else {
    text += 'Маршрут доступен через мини-приложение.';
  }
  return ctx.replyWithMarkdown(text);
});

bot.on('web_app_data', (ctx) => {
  try {
    const data = JSON.parse(ctx.webAppData.data);
    return ctx.reply('✅ Настройки маршрута сохранены!');
  } catch (e) {
    return ctx.reply('❌ Ошибка обработки данных.');
  }
});

app.use(express.json());

app.post(`/bot${BOT_TOKEN}`, (req, res) => {
  try {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
  } catch (e) {
    console.error('Webhook error:', e);
    res.sendStatus(500);
  }
});

app.get('/', (req, res) => {
  res.send('Бот работает! ✏️');
});

app.listen(PORT, async () => {
  console.log(`Bot server running on port ${PORT}`);
  try {
  await bot.telegram.setWebhook(`https://threeday-travel.onrender.com/bot${BOT_TOKEN}`);    console.log('✅ Webhook установлен!');
  } catch (e) {
    console.warn('⚠️ При установке webhook:', e.message);
  }
});
