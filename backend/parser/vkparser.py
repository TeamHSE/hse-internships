from flask import Flask, jsonify
import threading
import requests
from bs4 import BeautifulSoup
import re
import psycopg2
from dotenv import load_dotenv
import os
import schedule
import time
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

load_dotenv()

db_params = {
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': os.getenv('DB_PORT')
}

parsed_today = False

def fetch_and_parse(url):
    response = requests.get(url)
    if not response.text:
        return None
    soup = BeautifulSoup(response.text, 'html.parser')

    if soup.title and "Ошибка | ВКонтакте" in soup.title.string:
        print('Нет свежих вакансий')
        return None

    return soup

def create_tables(conn):
    with conn.cursor() as cursor:
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS articles (
                article_id SERIAL PRIMARY KEY,
                value TEXT
            );
        ''')
        conn.commit()

def insert_data(conn, value):
    with conn.cursor() as cursor:
        cursor.execute('''
            INSERT INTO articles (value)
            VALUES (%s);
        ''', (value,))
        conn.commit()

def extract_info(soup, conn, url):
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    try:
        driver.get(url)
        driver.implicitly_wait(10)
        article_element = driver.find_element(By.CLASS_NAME, 'article_view')
        article_html = article_element.get_attribute('outerHTML')
        insert_data(conn, article_html)
    finally:
        driver.quit()

def job():
    global parsed_today

    today = datetime.now().strftime('%d%m%y')
    url = f'https://vk.com/@hsecareerperm-vakansii-ot-{today}'
    print(f"Fetching URL: {url}")

    if parsed_today:
        print('Got all the vacancies today, waiting for the next day')
        return

    soup = fetch_and_parse(url)
    if soup is not None:
        conn = psycopg2.connect(**db_params)
        create_tables(conn)
        extract_info(soup, conn, url)
        conn.close()
        parsed_today = True

schedule.every(3).hours.do(job)

def reset_flag():
    global parsed_today
    parsed_today = False

schedule.every().day.at("00:00").do(reset_flag)

app = Flask(__name__)

@app.route('/manual_parse', methods=['GET'])
def manual_parse():
    job()
    return jsonify({"status": "Parsing job executed"}), 200

if __name__ == '__main__':
    threading.Thread(target=lambda: schedule.run_pending()).start()
    app.run(host='0.0.0.0', port=5000)
