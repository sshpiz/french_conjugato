import os
import time
import argparse
import asyncio
from telegram import Bot

async def watch_and_send(bot_token, chat_id, file_path, poll_interval=2):
    bot = Bot(token=bot_token)
    last_mtime = None
    sent_once = False

    print(f"📂 Watching {file_path} for changes...")

    while True:
        try:
            if not os.path.isfile(file_path):
                print(f"⚠️ File not found: {file_path}")
                await asyncio.sleep(poll_interval)
                continue

            mtime = os.path.getmtime(file_path)
            if last_mtime is None:
                last_mtime = mtime

            if not sent_once or mtime != last_mtime:
                last_mtime = mtime
                sent_once = True
                await bot.send_message(chat_id=chat_id, text="📤 Sending updated file...")
                with open(file_path, 'rb') as f:
                    await bot.send_document(chat_id=chat_id, document=f)
                print(f"✅ Sent updated file: {file_path}")
        except Exception as e:
            print(f"❌ Error: {e}")

        await asyncio.sleep(poll_interval)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Watch a file and send it to Telegram when updated.")
    parser.add_argument("--bot_token", help="Telegram bot token", default=os.getenv("TELEGRAM_BOT_TOKEN"))
    parser.add_argument("--chat_id", help="Your chat ID (or @channelusername)", type=int, default=6712839668)
    parser.add_argument("--file_path", help="Path to the file to watch", default='dist/index.html')
    parser.add_argument("--interval", type=int, default=10, help="Polling interval in seconds")

    args = parser.parse_args()

    asyncio.run(watch_and_send(
        bot_token=args.bot_token,
        chat_id=args.chat_id,
        file_path=args.file_path,
        poll_interval=args.interval
    ))
