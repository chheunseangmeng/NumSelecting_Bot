import json
import os
from pathlib import Path

from dotenv import load_dotenv
from telegram import KeyboardButton, ReplyKeyboardMarkup, Update, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters


load_dotenv(dotenv_path=Path(__file__).with_name(".env"))
BOT_TOKEN = os.getenv("BOT_TOKEN", "").strip()
APP_URL = os.getenv("APP_URL", "https://num-selecting-bot.vercel.app/").strip()


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.message:
        return

    keyboard = [[KeyboardButton(text="🚀 Open App", web_app=WebAppInfo(url=APP_URL))]]
    await update.message.reply_text(
        "Tap button to open app:",
        reply_markup=ReplyKeyboardMarkup(keyboard, resize_keyboard=True),
    )


async def on_web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    message = update.effective_message
    if not message or not message.web_app_data:
        return

    raw = message.web_app_data.data
    try:
        data = json.loads(raw)
        await message.reply_text(
            f"Received code: {data.get('code')}\nNumbers: {data.get('selectedNumbers')}"
        )
    except json.JSONDecodeError:
        await message.reply_text(f"Received raw data:\n{raw}")


def main() -> None:
    if not BOT_TOKEN:
        raise RuntimeError("Missing BOT_TOKEN in bot/.env")

    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, on_web_app_data))
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
