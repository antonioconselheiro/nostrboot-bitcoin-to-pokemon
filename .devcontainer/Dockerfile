FROM node:20

RUN npm install typescript node-typescript -g
RUN npm install npx nx -g --force
WORKDIR /nostrbot

COPY ./.gitconfig /root/.gitconfig
COPY ./.ssh /root/.ssh
RUN chmod 600 -R /root/.ssh

ENV LANG C.UTF-8
ENV TZ America/Sao_Paulo

# The run the start script
CMD [ "/bin/bash" ]
