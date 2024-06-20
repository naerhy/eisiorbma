# eisiorbma

Backend for ambroisie.

## Description

eisiorbma is a Node application built with Express and PostgreSQL.

## Usage

### Environment variables

Create a .env file at root with the following properties.

```
NODE_ENV=production
PORT=3001
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=eisiorbma
JWT_SECRET=secret
ADMIN_PW=password
DIR=static
```

### Commands

```bash
# build the compose services
docker compose build

# start the containers (and create them if necessary)
docker compose up -d

# stop and remove containers
docker compose down

# view containers' logs ouput
docker compose logs
```
