FROM node:latest
LABEL version="1.0"
LABEL author="Matthew Callens <callensm>"
LABEL description="Discord chat bot for United Operations"

ADD . /bot
WORKDIR /bot

RUN npm install -g pm2
RUN npm install
RUN npm run build

CMD [ "pm2", "start", "build/index.js" ]
