# STAGE 1 - Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL=http://192.168.148.19:8088/api/
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build