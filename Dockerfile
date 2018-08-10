FROM node:latest
LABEL version="1.0"
LABEL author="Matthew Callens <callensm>"
LABEL description="Discord chat bot for United Operations"
LABEL repository="https://github.com/unitedoperations/uo-discordbot.git"

ADD . /bot
WORKDIR /bot

RUN npm install -g pm2
RUN npm install
RUN npm run build
RUN mv .env.prod .env

CMD [ "pm2-runtime", "./build/index.js" ]
