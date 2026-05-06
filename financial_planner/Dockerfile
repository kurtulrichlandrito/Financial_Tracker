FROM node:22-slim AS frontend

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
COPY --from=frontend /app/frontend/dist /app/frontend/dist

RUN sed -i 's/\r$//' start.sh \
    && chmod +x start.sh

CMD ["./start.sh"]
