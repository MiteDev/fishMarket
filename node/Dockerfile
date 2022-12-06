FROM node:16.15.1
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN npm install pm2 --global
COPY . .
EXPOSE 8000
CMD ['npm', 'start']
