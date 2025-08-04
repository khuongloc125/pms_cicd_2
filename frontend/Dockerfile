# Stage 1: Build React app
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Chạy Node.js với Express
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/build ./build
COPY src/server.jsx ./server.jsx
COPY package.json .
RUN npm install express prom-client connect-history-api-fallback
EXPOSE 80
CMD ["node", "server.jsx"]