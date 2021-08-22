# PostgresSQL

## Requirements

* [Docker](https://docs.docker.com/get-docker/)
    - This is for running PostgreSQL
* [Dbmate](https://github.com/amacneil/dbmate#installation)
    - This for handling database migrations
* (Optional) [DBeaver](https://dbeaver.io/)
    - For viewing database data via a user interface. This tool isn't ideal but it's very versatile, free and supports many SQL databases.

## Install DBmate via "go install"

- Make sure Go is installed.

- Run the following:

```
go install github.com/amacneil/dbmate@v1.12.1
```

- Add the go/bin directory to your PATH environment variable

```
%USERPROFILE%\go\bin
```

## Setup for developing

- Install Docker by downloading and installing it.

- From this directory (root), run the following command to start up the PostgreSQL server

```sh
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db && docker-compose logs -f
```

## Run DBMate migrations

- First your local development PostgreSQL database using Docker. See "Setup for developing" above.

- Then make sure you've installed [Dbmate](https://github.com/amacneil/dbmate).

- Run the following command:

```
dbmate --url "postgres://postgres:password@localhost:5432/postgres?sslmode=disable" --no-dump-schema migrate
```

- To rollback database migrations, you can also run:

```
dbmate --url "postgres://postgres:password@localhost:5432/postgres?sslmode=disable" --no-dump-schema rollback
```
