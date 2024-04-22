FROM node:18-alpine

WORKDIR /home/node/app

COPY package.json package-lock.json ./

RUN npm i

COPY . .

EXPOSE 8000

RUN npm run build

CMD ["npm", "run", "prod"]
