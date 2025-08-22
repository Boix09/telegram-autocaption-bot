import express from "express";
import { Telegraf } from "telegraf";
import axios from "axios";
import FormData from "form-data";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.TELEGRAM_TOKEN;
const API_KEY = process.env.AUTOCAPTION_API_KEY;
const API_BASE = "https://api.autocaption.io/v1";
const bot = new Telegraf(TOKEN);
const app = express();

const client = axios.create({ baseURL: API_BASE });
client.defaults.headers.common["x-api-key"] = API_KEY;

bot.on("video", async (ctx) => {
  const chatId = ctx.chat.id;
  await ctx.reply("⏳ Génération des sous-titres en cours...");

  try {
    // 1) Récupérer la vidéo depuis Telegram
    const file = await ctx.telegram.getFile(ctx.message.video.file_id);
    const url = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
    const buffer = await (await fetch(url)).arrayBuffer();
    const videoBuffer = Buffer.from(buffer);
    const filename = `video_${Date.now()}.mp4`;

    // 2) GET signed URL
    const { filename: fileKey, url: uploadUrl, fields } =
      (await client.get(`/signedUrl?file=${filename}`)).data;

    // 3) Upload
    const form = new FormData();
    Object.entries(fields).forEach(([k, v]) => form.append(k, v));
    form.append("file", videoBuffer, { filename });
    await axios.post(uploadUrl, form, {
      headers: { "Content-Type": `multipart/form-data; boundary=${form._boundary}` },
    });

    // 4) Generate transcript
    const { job_id } = (
      await client.post("/transcript", {
        input: fileKey,
        language: "fr",
      })
    ).data;

    // 5) Polling
    let status = "",
      transcriptUrl = "";
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const res = (await client.get(`/transcript/${job_id}`)).data;
      status = res.status;
      if (status === "done") {
        transcriptUrl = res.output;
        break;
      }
      if (status === "failed") throw new Error("Échec de la génération");
    }

    if (status !== "done") return ctx.reply("⏱ Trop long... réessaie plus tard.");

    // 6) Télécharger la vidéo sous-titrée
    const outBuf = await (await fetch(transcriptUrl)).arrayBuffer();
    const videoOut = Buffer.from(outBuf);

    // 7) Envoyer à Telegram
    await ctx.replyWithVideo(
      { source: videoOut },
      { caption: "🎬 Voici ta vidéo avec sous-titres FR !" }
    );
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ Une erreur est survenue lors de la génération des sous-titres.");
  }
});

// --- Lancement du bot (polling) ---
bot.launch();
console.log("Bot lancé (mode polling)");

// --- Fake web server pour Render ---
app.get("/", (req, res) => {
  res.send("Bot is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Fake server running on port ${PORT}`);
});
           
