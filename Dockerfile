FROM node:alpine
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm install
EXPOSE 4000
CMD ["node","server.js"]