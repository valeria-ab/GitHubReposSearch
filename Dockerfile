FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache yarn

COPY package.json .

RUN yarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "dev"]

# build:  docker build -t gh-repos-search .
# run:  docker run -it -p 3000:3000 react-app
