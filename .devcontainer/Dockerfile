FROM node:20

RUN apt update
RUN apt install jq tor curl -y
RUN apt clean
RUN rm -rf /var/lib/apt/lists/*

WORKDIR /root/Downloads

RUN npm install typescript node-typescript -g
RUN npm install npx nx -g --force

# Installing nak, the nostr army knife
RUN wget https://github.com/fiatjaf/nak/releases/download/v0.10.1/nak-v0.10.1-linux-amd64
RUN mv nak-v0.10.1-linux-amd64 /usr/bin/nak
RUN chmod +x /usr/bin/nak

WORKDIR /nostrbot

ENV LANG=C.UTF-8
ENV TZ=America/Sao_Paulo

# The run the start script
CMD [ "/bin/bash" ]
