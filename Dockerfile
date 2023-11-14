FROM node:latest

WORKDIR /

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


EXPOSE 50051

CMD [ "node", "dist/src/server.js" ]