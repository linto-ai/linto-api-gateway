FROM node:latest

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install
COPY . .

HEALTHCHECK CMD curl -f http://localhost

EXPOSE 80
CMD ["node", "app.js" ]