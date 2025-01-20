FROM node:20

WORKDIR /root/Downloads

RUN apt update
RUN apt install jq tor curl torsocks -y
RUN apt clean
RUN rm -rf /var/lib/apt/lists/*

# Installing nak, the nostr army knife
RUN wget https://github.com/fiatjaf/nak/releases/download/v0.10.1/nak-v0.10.1-linux-amd64
RUN mv nak-v0.10.1-linux-amd64 /usr/bin/nak
RUN chmod +x /usr/bin/nak

WORKDIR /btc2poke
COPY dist/packages/btc2poke/ .
RUN npm install

CMD [ "service", "tor", "start" ]
ENTRYPOINT ["node", "./src/main.js"]
