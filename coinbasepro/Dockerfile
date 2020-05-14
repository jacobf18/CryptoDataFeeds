FROM node:14
WORKDIR /home/jacob/Documents/crypto/CryptoDataFeeds/coinbasepro/
COPY package*.json ./
RUN npm install
RUN npm ci --only=production
COPY . .
CMD [ "node", "getTicks.js" ]