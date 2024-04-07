FROM python:3.12-alpine3.18

COPY requirements.txt /app

RUN pip install -r /app/requirements.txt

COPY . /app

CMD ["python", "app/main.py"]

