FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt gunicorn
COPY . . 
CMD gunicorn -w 1 --threads 100 -b 0.0.0.0:$PORT app:app
# 