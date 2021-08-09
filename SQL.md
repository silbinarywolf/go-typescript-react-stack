# PostgresSQL

## Requirements

* [Docker](https://docs.docker.com/get-docker/)

## Setup for developing

- Install Docker by downloading and installing it.

- From this directory (root), run the following command to start up the PostgreSQL server

```sh
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db && docker-compose logs -f
```
