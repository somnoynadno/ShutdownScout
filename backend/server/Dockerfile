FROM ubuntu:latest
#FROM python:3.9

WORKDIR /home/server/

ENV TZ  Europe/Moscow
ENV ENV PRODUCTION

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update && apt-get install firefox python3-pip -y

COPY requirements.txt ./
RUN pip3 install -r requirements.txt

COPY . .

CMD [ "python3", "server.py"]
