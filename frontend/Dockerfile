FROM node:18

WORKDIR /code/
COPY package*.json .
COPY tailwind.config.js .
COPY tsconfig.json .
COPY . .
RUN npm install
COPY ./src ./src
COPY ./public ./public
EXPOSE 3000

CMD ["npm", "start"]
