const BOT_TOKEN = "8745336474:AAFNVmAeozCb-YcuHrUDdrQ6b3sPvo5OnV8";

export default {
  async fetch(request, env, ctx) {
    if (request.method === "POST") {
      try {
        const update = await request.json();
        if (update.message && update.message.text) {
          const chatId = update.message.chat.id;
          const text = update.message.text.trim();

          if (text === "/start") {
            await sendMessage(chatId, "👋 **Привет!**\nОтправь ссылку Lootlabs от Delta.");
          } else if (text.includes("lootlabs.gg") || text.includes("links.lootlabs.gg")) {
            await sendMessage(chatId, "⏳ *Маскирую запрос и обхожу ссылку...*");
            
            const result = await trySpoofedBypass(text);

            if (result && result.startsWith("http") && !result.includes("discord")) {
              await sendMessage(chatId, `✅ **BYPASS УСПЕШЕН!**\n\n🔒 **Ссылка:**\n\`${result}\``);
            } else {
              // Теперь бот выдаст сырой ответ сервера, чтобы мы точно знали, банят ли IP
              await sendMessage(chatId, `❌ **API заблокировал запрос Cloudflare.**\nОтвет сервера: \`${result}\``);
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    return new Response("OK", { status: 200 });
  }
};

async function trySpoofedBypass(targetUrl) {
  // Имитируем реальный браузер Google Chrome на Windows
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
    "Origin": "https://bypass.city",
    "Referer": "https://bypass.city/"
  };

  try {
    const url = `https://bypass.city/api/bypass?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(url, { headers });
    const textData = await res.text();
    
    try {
      const data = JSON.parse(textData);
      if (data.destination) return data.destination;
      if (data.result) return data.result;
      return textData.substring(0, 100); // Возвращаем кусок ошибки, если JSON странный
    } catch (parseErr) {
      return textData.substring(0, 100); // Возвращаем HTML-заглушку Cloudflare, если нас забанили
    }
  } catch (e) {
    return e.message;
  }
}

async function sendMessage(chatId, messageText) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: messageText,
      parse_mode: "Markdown",
      disable_web_page_preview: true
    })
  });
}
