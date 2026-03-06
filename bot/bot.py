from telegram import ReplyKeyboardMarkup, KeyboardButton, WebAppInfo, Update
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters
import json, os
from dotenv import load_dotenv

load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")
APP_URL = "https://num-selecting-bot.vercel.app/"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    kb = [[KeyboardButton(text="🚀 Open App ", web_app=WebAppInfo(url=APP_URL))]]
    await update.message.reply_text("Tap button to open app:", reply_markup=ReplyKeyboardMarkup(kb, resize_keyboard=True))

async def on_web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    raw = update.effective_message.web_app_data.data
    data = json.loads(raw)
    await update.effective_message.reply_text(f"Received code: {data.get('code')}")

app = Application.builder().token(BOT_TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, on_web_app_data))
app.run_polling()
