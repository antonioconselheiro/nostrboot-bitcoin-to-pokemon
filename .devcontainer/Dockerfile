FROM node:20

WORKDIR /root/Downloads

RUN npm install typescript node-typescript -g
RUN npm install npx nx -g --force

# Installing nak, the nostr army knife
RUN wget https://github.com/fiatjaf/nak/releases/download/v0.7.6/nak-v0.7.6-linux-amd64
RUN mv nak-v0.7.5-linux-amd64 /usr/bin/nak
RUN chmod +x /usr/bin/nak

WORKDIR /nostrbot

COPY ./.gitconfig /root/.gitconfig
COPY ./.ssh /root/.ssh
RUN chmod 600 -R /root/.ssh
RUN ssh-add -D && ssh-add /root/.ssh/id_ed25519 || true

ENV LANG C.UTF-8
ENV TZ America/Sao_Paulo

# The run the start script
CMD [ "/bin/bash" ]
