FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# This project uses webpack 4, which needs OpenSSL's legacy provider on modern Node.
ENV NODE_OPTIONS=--openssl-legacy-provider
ENV NODE_ENV=production

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "prod:one"]
