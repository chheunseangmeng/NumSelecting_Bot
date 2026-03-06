import json
import logging
import os
import threading
from pathlib import Path

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from telegram import Bot, KeyboardButton, ReplyKeyboardMarkup, Update, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters

load_dotenv(dotenv_path=Path(__file__).with_name(".env"))
BOT_TOKEN = os.getenv("BOT_TOKEN", "").strip().strip("'\"")
APP_URL = os.getenv("APP_URL", "https://num-selecting-bot.vercel.app/").strip()

logging.basicConfig(
    format="%(asctime)s | %(levelname)s | %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("telegram").setLevel(logging.WARNING)
logging.getLogger("telegram.ext").setLevel(logging.WARNING)

# ── FastAPI app ──────────────────────────────────────────────────────────────
fastapi_app = FastAPI()

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins (your Vercel frontend)
    allow_methods=["*"],
    allow_headers=["*"],
)

class SubmitPayload(BaseModel):
    chat_id: int
    selectedNumbers: list
    code: str
    message: str
    selectedCount: int
    startParam: str | None = None
    submittedAt: str

@fastapi_app.post("/submit")
async def submit(payload: SubmitPayload):
    try:
        bot = Bot(token=BOT_TOKEN)
        await bot.send_message(
            chat_id=payload.chat_id,
            text=f"✅ Submitted!\nCode: {payload.code}\nNumbers: {payload.selectedNumbers}"
        )
        logger.info("Submit success | chat_id=%s | code=%s", payload.chat_id, payload.code)
        return {"status": "ok"}
    except Exception as e:
        logger.error("Failed to send message: %s", e)
        return {"status": "error", "detail": str(e)}

# ── Telegram bot handlers ────────────────────────────────────────────────────
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
    logger.info("WEB_APP_DATA received from chat_id=%s: %s", update.effective_chat.id if update.effective_chat else "unknown", raw)
    try:
        data = json.loads(raw)
        await message.reply_text(
            f"Received code: {data.get('code')}\nNumbers: {data.get('selectedNumbers')}"
        )
    except json.JSONDecodeError:
        await message.reply_text(f"Received raw data:\n{raw}")

# ── Run both bot + FastAPI ───────────────────────────────────────────────────
def run_fastapi():
    logger.info("FastAPI running on http://0.0.0.0:8000")
    uvicorn.run(fastapi_app, host="0.0.0.0", port=8000, log_level="warning")

def main() -> None:
    if not BOT_TOKEN:
        raise RuntimeError("Missing BOT_TOKEN in bot/.env")

    # Run FastAPI in a separate thread
    thread = threading.Thread(target=run_fastapi, daemon=True)
    thread.start()

    logger.info("Bot is starting...")
    logger.info("Mini App URL: %s", APP_URL)
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, on_web_app_data))
    logger.info("Bot is running. Press Ctrl+C to stop.")
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()