FROM node:22-alpine

WORKDIR /app

COPY package.json .npmrc ./
RUN npm install --omit=dev

COPY src ./src
COPY mds ./mds

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
