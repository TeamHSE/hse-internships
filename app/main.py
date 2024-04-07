
TOKEN = '6513371989:AAHLdPxtW2y7xJm81LAirrr8FQ1k6atF9FI'
EMAIL_ADRESS = "h3.r@yandex.ru"
PASSWORD="xmeryvetvukgkfss"
import telebot
from flask import Flask, request
import threading
import smtplib as smtp
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


bot = telebot.TeleBot(TOKEN)
server = smtp.SMTP_SSL('smtp.yandex.com.tr:465')
server.ehlo(EMAIL_ADRESS)
server.login(EMAIL_ADRESS, PASSWORD)

app = Flask(__name__)

@bot.message_handler()
def send_chat_id(message):
    chat_id = message.chat.id
    bot.send_message(chat_id, f"Your chat ID is: ```{chat_id}```", parse_mode='MarkdownV2')

def send_email(target_email, event_name, text):
    msg = MIMEMultipart('alternative')
    msg['From'] = EMAIL_ADRESS
    msg['To'] = target_email
    msg['Subject'] = "New event: " + event_name
    msg.attach(MIMEText(text, 'plain', 'utf-8'))

    server.auth_plain()
    server.sendmail(EMAIL_ADRESS, target_email, msg.as_string())

# Endpoint to send messages via GET request
@app.route('/send_message', methods=['GET'])
def send_message():
    users = request.json.get('users')
    event_name  = request.json.get('event_name')
    event_link = request.json.get('event_link')
    
    if not event_name or not event_link or not users:
        return 'Missing params', 400
    
    msg = f"""Привет, появилось новое событие:
Событие: {event_name}
Ссылка: {event_link}
    """
    answer, code = "Message sent successfully!", 200
    for user in users:
        target_id = user['target_id']
        target = user['target']

        match target:
            case "telegram":
                try:
                    bot.send_message(chat_id=target_id, text=msg)
                except Exception as e:
                    answer, code = f'An error occurred: {str(e)}', 500
            case "email":
                try:
                    send_email(target_id, event_name, msg)
                except Exception as e:
                    answer, code = f'An error occurred: {str(e)}', 500
    return answer, code

# Function to run Flask and bot in separate threads
def start_flask_and_bot():
    threading.Thread(target=lambda: app.run(debug=True, use_reloader=False)).start()
    bot.polling()

if __name__ == '__main__':
    start_flask_and_bot()
    server.quit()
