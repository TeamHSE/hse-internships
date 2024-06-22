FROM python:3.9-slim

WORKDIR /usr/src/app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8888

CMD ["python", "./vkparser.py"]

