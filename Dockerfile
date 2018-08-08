FROM node:latest

ADD . /bot
WORKDIR /bot

RUN npm install
CMD [ "npm", "run", "dev" ]
