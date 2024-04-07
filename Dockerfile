FROM python:3.12-alpine3.18

COPY requirements.txt requirements.txt 

RUN pip install -r requirements.txt

COPY ./app/main.py main.py
CMD ["python", "main.py"]

