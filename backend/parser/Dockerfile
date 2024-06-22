FROM python:3.9-slim

WORKDIR /usr/src/app

COPY . .

COPY .env .env

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 80

CMD ["host.docker.internal:5432", "--", "python", "./vkparser.py"]

