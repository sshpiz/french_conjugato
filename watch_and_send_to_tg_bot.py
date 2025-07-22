import os
import time
import argparse
import asyncio
import shutil
from telegram import Bot

async def send_with_retry(bot, chat_id, file_path, max_retries=3):
    """Send file with retry logic."""
    for attempt in range(max_retries):
        try:
            print(f"📤 Sending updated file... (attempt {attempt + 1}/{max_retries})")
            await bot.send_message(chat_id=chat_id, text="📤 Sending updated file...")
            
            with open(file_path, 'rb') as f:
                await bot.send_document(chat_id=chat_id, document=f)
            
            print(f"✅ Successfully sent file: {file_path}")
            return True
            
        except Exception as e:
            print(f"❌ Attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
                print(f"⏳ Retrying in {wait_time} seconds...")
                await asyncio.sleep(wait_time)
            else:
                print(f"💥 All {max_retries} attempts failed!")
                return False

async def watch_and_send(bot_token, chat_id, file_path, poll_interval=2, max_retries=3):
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
                
                # Use retry function instead of direct sending
                success = await send_with_retry(bot, chat_id, file_path, max_retries)
                if not success:
                    print(f"⚠️ Failed to send file after {max_retries} attempts. Will try again on next change.")
                
        except Exception as e:
            print(f"❌ Unexpected error: {e}")

        await asyncio.sleep(poll_interval)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Watch a file and send it to Telegram when updated.")
    parser.add_argument("--bot_token", help="Telegram bot token", default=os.getenv("TELEGRAM_BOT_TOKEN"))
    parser.add_argument("--chat_id", help="Your chat ID (or @channelusername)", type=int, default=6712839668)
    parser.add_argument("--file_path", help="Path to the file to watch", default='dist/index.html')
    parser.add_argument("--interval", type=int, default=10, help="Polling interval in seconds")
    parser.add_argument("--retries", type=int, default=3, help="Number of retry attempts for failed uploads")

    args = parser.parse_args()

    asyncio.run(watch_and_send(
        bot_token=args.bot_token,
        chat_id=args.chat_id,
        file_path=args.file_path,
        poll_interval=args.interval,
        max_retries=args.retries
    ))
