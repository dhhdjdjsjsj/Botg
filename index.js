import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';

const TOKEN = '8745336474:AAFNVmAeozCb-YcuHrUDdrQ6b3sPvo5OnV8';

// Используем Long Polling — Webhook больше не нужен
const bot = new TelegramBot(TOKEN, { polling: true });

console.log('Бот запущен...');

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '👋 **Привет!**\nОтправь мне ссылку Lootlabs от Delta Roblox.');
});

bot.on('message', async (msg) => {
  const text = msg.text;
  if (!text || text.startsWith('/')) return;

  if (text.includes('lootlabs.gg') || text.includes('links.lootlabs.gg')) {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, '⏳ *Обхожу ссылку, подождите немного...*');

    try {
      const res = await fetch(`https://bypass.city/api/bypass?url=${encodeURIComponent(text)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });

      const data = await res.json();
      const finalUrl = data.destination || data.result;

      if (finalUrl && !finalUrl.includes('discord')) {
        bot.sendMessage(chatId, `✅ **BYPASS УСПЕШЕН!**\n\n🔒 **Ссылка:**\n\`${finalUrl}\``, { parse_mode: 'Markdown' });
      } else {
        bot.sendMessage(chatId, '❌ Не удалось обойти ссылку. Попробуйте позже.');
      }
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, '❌ Ошибка сети или блокировка API.');
    }
  }
});
