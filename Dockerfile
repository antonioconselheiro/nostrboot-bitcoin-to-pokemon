FROM node:20

WORKDIR /btc2poke
COPY dist/packages/btc2poke/ .
RUN npm install

CMD [ "node", "./src/main.js" ]
