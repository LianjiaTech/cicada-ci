FROM node:12-slim

WORKDIR /usr/app

RUN apt-get update
RUN apt-get -y install git
RUN apt-get install -y build-essential
RUN apt-get install -y curl
RUN apt-get install -y python gcc g++

COPY . /usr/app

RUN cd /usr/app && yarn \
  && cd /usr/app/webclient && yarn \
  && cd /usr/app/webserver && yarn \
  && cd /usr/app/ciserver && yarn