# Stage 1 - the build process
FROM node:14.15.0-alpine3.12 as builder
MAINTAINER "Alexander Zorkin"

ENV REACT_APP_HOST_ENV PRODUCTION

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm install --production

COPY . ./
RUN npm run build

# Stage 2 - release
FROM node:14.15.0-alpine3.12 AS release

WORKDIR /app
COPY --from=builder /app/build ./build

RUN npm -g install serve
EXPOSE 5050

CMD ["serve", "-s", "build", "-p", "5050"]
