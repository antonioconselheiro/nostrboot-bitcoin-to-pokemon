FROM node:16.3.0

#RUN useradd -d /btc2poke -m btc2poke
WORKDIR /btc2poke
COPY package.json .
RUN npm install

CMD [ "node", "./src/main.js" ]
