import requests
from bs4 import BeautifulSoup
import re
import psycopg2
from dotenv import load_dotenv
import os
import schedule
import time
from datetime import datetime, timedelta

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
    soup = BeautifulSoup(response.text, 'html.parser')

    if soup.title and "Ошибка | ВКонтакте" in soup.title.string:
        print('Нет свежих вакансий')
        return None

    return soup

def create_tables(conn):
    with conn.cursor() as cursor:
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS article (
                article_id SERIAL PRIMARY KEY
            );
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS details (
                details_id SERIAL PRIMARY KEY,
                article_id INTEGER REFERENCES article(article_id),
                type VARCHAR(50),
                value TEXT
            );
        ''')
        conn.commit()

def insert_data(conn, article_id, type, value):
    with conn.cursor() as cursor:
        cursor.execute('''
            INSERT INTO details (article_id, type, value)
            VALUES (%s, %s, %s);
        ''', (article_id, type, value))
        conn.commit()

def extract_info(soup, conn):
    if soup is None:
        return

    cite_tags = soup.find_all('cite', class_='article_decoration_first article_decoration_last')
    elements = soup.find_all(['cite', 'strong', 'p', 'li'], class_=lambda x: x != 'article-list__item' or x == 'article-list__item')
    meta_tag = soup.find('meta', property='og:title')
    date = re.search(r'\d{2}\.\d{2}\.\d{2}', meta_tag['content']).group() if meta_tag else 'Unknown Date'

    with conn.cursor() as cursor:
        cursor.execute('INSERT INTO article DEFAULT VALUES RETURNING article_id;')
        article_id = cursor.fetchone()[0]
        conn.commit()

    for i in range(len(cite_tags)):
        start = elements.index(cite_tags[i])
        end = elements.index(cite_tags[i+1]) if i+1 < len(cite_tags) else len(elements)

        output_texts = []
        special_texts = []

        for element in elements[start:end]:
            element_text = element.get_text(strip=True)
            if element.name == 'strong':
                formatted_text = f"strong:({element_text})"
                special_texts.append(element_text)
                output_texts.append(formatted_text)
                insert_data(conn, article_id, 'strong', element_text)
            elif 'article-list__item' in element.get('class', []):
                formatted_text = f"listitem:({element_text})"
                special_texts.append(element_text)
                output_texts.append(formatted_text)
                insert_data(conn, article_id, 'listitem', element_text)
            elif element.name == 'cite' or element.name == 'meta property="og:description"':
                formatted_text = f"company_name:({element_text})"
                output_texts.append(formatted_text)
                insert_data(conn, article_id, 'company_name', element_text)
            else:
                next_element = elements[elements.index(element) + 1] if elements.index(element) + 1 < len(elements) else None
                if next_element and next_element.name == 'strong' and next_element.get_text(strip=True) == element_text:
                    continue
                output_texts.append(element_text)
                insert_data(conn, article_id, 'text', element_text)

        final_texts = []
        for text in output_texts:
            if text.startswith("strong:(") or text.startswith("listitem:("):
                original_text = text[text.find('(')+1:-1]
                final_texts = [t for t in final_texts if t != original_text]
            final_texts.append(text)

        for text in final_texts:
            print(text)

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
        extract_info(soup, conn)
        conn.close()
        parsed_today = True

schedule.every(3).hours.do(job)

job()

def reset_flag():
    global parsed_today
    parsed_today = False

schedule.every().day.at("00:00").do(reset_flag)

if __name__ == '__main__':
    while True:
        schedule.run_pending()
        time.sleep(1)
