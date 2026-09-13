FROM node:22-alpine

WORKDIR /app

COPY package.json .npmrc ./
RUN npm install --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV MDS_DIR=/data/mds
EXPOSE 3000

CMD ["npm", "start"]
