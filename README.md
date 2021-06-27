# Shutdown Scout 

Web-service for network resource blockages detection and HTTP-proxy selection.

![Screenshot at 2021-06-27 20-09-52](https://user-images.githubusercontent.com/46386987/123545896-fea8ec80-d749-11eb-9068-aeb827bc8824.png)

## Features

- **Proxy test** (run on server)
- **Network test** (run in browser or on your own server)
- **Free proxy list** (each proxy is tested before response is sent)

You can try our demo-version here: http://scout.somnoynadno.ru

## Installation

We deliver the service version in the Docker-container format. 

To run it on your machine, follow the instructions below.

### Local host

Assuming that you are using a unix-like system and already have Docker installed:

1. Clone this repository: ``` $ git clone https://github.com/somnoynadno/ShutdownScout.git```

2. Start dockerized project by ``` $ cd ShutdownScout && docker-compose up --build -d```

3. Open your web browser and visit http://localhost:5050 after and it's ready to go

Also you can try to start it manually by retyping Dockerfile instructions in your terminal.

### Server

If you want to have an instance of this application on your own remote server:

0. Clone this repository: ``` $ git clone https://github.com/somnoynadno/ShutdownScout.git```

1. Set suitable configuration in ``` ./docker-compose.production.yml``` and set your own domain in ```./frontend/src/config.js```

2. Start dockerized project by ``` $ docker-compose -f docker-compose.production.yml up --build -d```

3. Open your web browser, visit http://<your_ip_or_domain>:5050 and start using it for free

## Services

- **Backend** (API) is available at port 3113
- **Frontend** is listening on 5050
- **PostgreSQL** is accepting connections on 3114

## Troubleshooting

Contact me: @somnoynadno
