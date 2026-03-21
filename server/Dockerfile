FROM node:22-alpine
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm install
COPY src ./src
ENV NODE_ENV=production
EXPOSE 4000
CMD ["npx", "ts-node", "src/index.ts"]