FROM library/node:argon-slim

WORKDIR /app

COPY package.json /app
RUN npm install --production
COPY . /app
RUN npm run transpile

CMD ["npm", "run", "prod"]
