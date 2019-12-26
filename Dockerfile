FROM node:12-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY index.js .
COPY server.js .
COPY db.js .
COPY /models ./models
COPY /routes ./routes
COPY /auxiliar ./auxiliar

EXPOSE 80

CMD npm start