# Используйте базовый образ Python
FROM python:3.9-slim

# Установка переменной окружения для Python
ENV PYTHONUNBUFFERED 1

# Установка рабочей директории внутри контейнера
WORKDIR /app

# Копирование requirements.txt для установки зависимостей
COPY requirements.txt .

# Установка зависимостей
RUN pip install -r requirements.txt

# Копирование всего содержимого текущего каталога внутрь контейнера /app/
COPY . .
