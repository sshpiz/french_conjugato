"""
Build the standalone HTML and send it to Telegram in one step.

Usage:
  python3 build_and_send.py
  # or with explicit token:
  TELEGRAM_BOT_TOKEN=xxx python3 build_and_send.py
"""

import os
import asyncio
from build import build
from telegram import Bot

CHAT_ID    = 6712839668
FILE_PATH  = 'dist/franconjugue.html'
BOT_TOKEN  = os.getenv("TELEGRAM_BOT_TOKEN")

async def send_file(path):
    bot = Bot(token=BOT_TOKEN)
    print("📤 Sending to Telegram...")
    await bot.send_message(chat_id=CHAT_ID, text="🏗️ New build ready:")
    with open(path, 'rb') as f:
        await bot.send_document(chat_id=CHAT_ID, document=f)
    print("✅ Sent!")

if __name__ == "__main__":
    if not BOT_TOKEN:
        raise SystemExit("❌ Set TELEGRAM_BOT_TOKEN env var first.")
    build(force_jpeg=True)
    asyncio.run(send_file(FILE_PATH))
