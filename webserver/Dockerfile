FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache postgresql-client

COPY package.json ./
RUN npm install

COPY . .

RUN npm run build

CMD ["./awaitDB.sh", "npm", "start"]