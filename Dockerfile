FROM node:20-alpine

RUN apk add dumb-init

WORKDIR /eisiorbma

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

CMD ["dumb-init", "node", "dist/index.js"]
