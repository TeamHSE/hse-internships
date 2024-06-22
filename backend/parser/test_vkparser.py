import unittest
from unittest.mock import patch, MagicMock
import requests
from bs4 import BeautifulSoup
import psycopg2
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import os

from vkparser import fetch_and_parse, create_tables, insert_data, extract_info, db_params, job

class TestYourModule(unittest.TestCase):

    @patch('requests.get')
    def test_fetch_and_parse_success(self, mock_get):
        mock_response = MagicMock()
        mock_response.text = '<html><head><title>Test</title></head><body></body></html>'
        mock_get.return_value = mock_response

        url = 'http://example.com'
        soup = fetch_and_parse(url)
        self.assertIsInstance(soup, BeautifulSoup)
        self.assertEqual(soup.title.string, 'Test')

    @patch('requests.get')
    def test_fetch_and_parse_error(self, mock_get):
        mock_response = MagicMock()
        mock_response.text = '<html><head><title>Ошибка | ВКонтакте</title></head><body></body></html>'
        mock_get.return_value = mock_response

        url = 'http://example.com'
        soup = fetch_and_parse(url)
        self.assertIsNone(soup)

    @patch('requests.get')
    def test_fetch_and_parse_empty(self, mock_get):
        mock_response = MagicMock()
        mock_response.text = ''
        mock_get.return_value = mock_response

        url = 'http://example.com'
        soup = fetch_and_parse(url)
        self.assertIsNone(soup)

    @patch('psycopg2.connect')
    def test_create_tables(self, mock_connect):
        mock_conn = mock_connect.return_value
        mock_cursor = mock_conn.cursor.return_value.__enter__.return_value

        create_tables(mock_conn)
        mock_cursor.execute.assert_called_once_with('''
            CREATE TABLE IF NOT EXISTS articles (
                article_id SERIAL PRIMARY KEY,
                value TEXT
            );
        ''')
        mock_conn.commit.assert_called_once()

    @patch('psycopg2.connect')
    def test_create_tables_error(self, mock_connect):
        mock_conn = mock_connect.return_value
        mock_cursor = mock_conn.cursor.return_value.__enter__.return_value
        mock_cursor.execute.side_effect = psycopg2.Error

        with self.assertRaises(psycopg2.Error):
            create_tables(mock_conn)

    @patch('psycopg2.connect')
    def test_insert_data(self, mock_connect):
        mock_conn = mock_connect.return_value
        mock_cursor = mock_conn.cursor.return_value.__enter__.return_value

        value = 'Test article'
        insert_data(mock_conn, value)
        mock_cursor.execute.assert_called_once_with('''
            INSERT INTO articles (value)
            VALUES (%s);
        ''', (value,))
        mock_conn.commit.assert_called_once()

    @patch('psycopg2.connect')
    def test_insert_data_error(self, mock_connect):
        mock_conn = mock_connect.return_value
        mock_cursor = mock_conn.cursor.return_value.__enter__.return_value
        mock_cursor.execute.side_effect = psycopg2.Error

        value = 'Test article'
        with self.assertRaises(psycopg2.Error):
            insert_data(mock_conn, value)

    @patch('selenium.webdriver.Chrome')
    @patch('psycopg2.connect')
    def test_extract_info(self, mock_connect, mock_chrome):
        mock_conn = mock_connect.return_value
        mock_cursor = mock_conn.cursor.return_value.__enter__.return_value

        mock_driver = mock_chrome.return_value
        mock_element = MagicMock()
        mock_element.get_attribute.return_value = '<div class="article_view">Test article</div>'
        mock_driver.find_element.return_value = mock_element

        url = 'http://example.com'
        soup = BeautifulSoup('<html></html>', 'html.parser')
        extract_info(soup, mock_conn, url)

        mock_driver.get.assert_called_once_with(url)
        mock_driver.find_element.assert_called_once_with(By.CLASS_NAME, 'article_view')
        mock_driver.quit.assert_called_once()
        mock_cursor.execute.assert_called_once_with('''
            INSERT INTO articles (value)
            VALUES (%s);
        ''', ('<div class="article_view">Test article</div>',))
        mock_conn.commit.assert_called_once()

    @patch('selenium.webdriver.Chrome')
    @patch('psycopg2.connect')
    def test_extract_info_no_element(self, mock_connect, mock_chrome):
        mock_conn = mock_connect.return_value
        mock_cursor = mock_conn.cursor.return_value.__enter__.return_value

        mock_driver = mock_chrome.return_value
        mock_driver.find_element.side_effect = Exception("Element not found")

        url = 'http://example.com'
        soup = BeautifulSoup('<html></html>', 'html.parser')
        with self.assertRaises(Exception):
            extract_info(soup, mock_conn, url)

        mock_driver.get.assert_called_once_with(url)
        mock_driver.quit.assert_called_once()

    @patch('psycopg2.connect')
    @patch('vkparser.fetch_and_parse')
    @patch('vkparser.extract_info')
    @patch('builtins.print')
    @patch('vkparser.parsed_today', True)
    def test_job_already_parsed(self, mock_print, mock_extract_info, mock_fetch_and_parse, mock_connect):
        job()

        mock_fetch_and_parse.assert_not_called()
        mock_connect.assert_not_called()
        mock_extract_info.assert_not_called()
        mock_print.assert_any_call('Got all the vacancies today, waiting for the next day')

    @patch('requests.get')
    def test_fetch_and_parse_invalid_html(self, mock_get):
        mock_response = MagicMock()
        mock_response.text = '<html><head><title>Invalid</title></head><body><div></div></body></html>'
        mock_get.return_value = mock_response

        url = 'http://example.com'
        soup = fetch_and_parse(url)
        self.assertIsInstance(soup, BeautifulSoup)
        self.assertEqual(soup.title.string, 'Invalid')

    @patch('psycopg2.connect')
    def test_create_tables_once(self, mock_connect):
        mock_conn = mock_connect.return_value
        mock_cursor = mock_conn.cursor.return_value.__enter__.return_value

        create_tables(mock_conn)
        mock_cursor.execute.assert_called_once_with('''
            CREATE TABLE IF NOT EXISTS articles (
                article_id SERIAL PRIMARY KEY,
                value TEXT
            );
        ''')
        mock_conn.commit.assert_called_once()

        mock_cursor.reset_mock()
        mock_conn.commit.reset_mock()

        create_tables(mock_conn)
        mock_cursor.execute.assert_called_once_with('''
            CREATE TABLE IF NOT EXISTS articles (
                article_id SERIAL PRIMARY KEY,
                value TEXT
            );
        ''')
        mock_conn.commit.assert_called_once()

    @patch('psycopg2.connect')
    def test_insert_multiple_data(self, mock_connect):
        mock_conn = mock_connect.return_value
        mock_cursor = mock_conn.cursor.return_value.__enter__.return_value

        values = ['Test article 1', 'Test article 2']
        for value in values:
            insert_data(mock_conn, value)
        self.assertEqual(mock_cursor.execute.call_count, 2)
        mock_conn.commit.assert_called()

    @patch('selenium.webdriver.Chrome')
    @patch('psycopg2.connect')
    def test_extract_info_driver_quit_on_exception(self, mock_connect, mock_chrome):
        mock_conn = mock_connect.return_value
        mock_cursor = mock_conn.cursor.return_value.__enter__.return_value

        mock_driver = mock_chrome.return_value
        mock_driver.find_element.side_effect = Exception("Element not found")

        url = 'http://example.com'
        soup = BeautifulSoup('<html></html>', 'html.parser')
        with self.assertRaises(Exception):
            extract_info(soup, mock_conn, url)

        mock_driver.get.assert_called_once_with(url)
        mock_driver.quit.assert_called_once()

    @patch('psycopg2.connect')
    @patch('vkparser.fetch_and_parse')
    @patch('vkparser.extract_info')
    @patch('builtins.print')
    @patch('vkparser.parsed_today', False)
    def test_job_not_parsed(self, mock_print, mock_extract_info, mock_fetch_and_parse, mock_connect):
        mock_fetch_and_parse.return_value = BeautifulSoup('<html></html>', 'html.parser')
        job()

        mock_fetch_and_parse.assert_called_once()
        mock_connect.assert_called_once()
        mock_extract_info.assert_called_once()
        mock_print.assert_any_call('Fetching URL: https://vk.com/@hsecareerperm-vakansii-ot-150624')

if __name__ == '__main__':
    unittest.main()
