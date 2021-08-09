# Go Backend Web Server

[![Actions Status](https://github.com/silbinarywolf/go-typescript-react-stack/workflows/Go/badge.svg)](https://github.com/silbinarywolf/go-typescript-react-stack/actions)

## Requirements

* [Go 1.16+](https://golang.org/dl/)

## How to build production

- You'll need to build the production [client code](/node/client).

⚠️ *If you don't do this step, you'll get the following Go compilation error as the server can't find and embed the \*.js, \*.css files*

```
internal\staticfiles\staticfiles_notdev.go:15:12: pattern dist: no matching files found
```

- Open a terminal and run the following.

```sh
go build
```

## How run for local development

- Open a terminal and run the following. Building with `-tags dev` tells the server to not try to include the frontend client code.

```sh
go build -tags dev && ./server
```

## How to run integration tests

- Open a terminal in the `internal` folder and run all unit and integration tests with.

```sh
go test -tags dev ./...
```

❗ *We run with `-tags dev` so that `staticfiles` doesn't throw an error if you haven't built the production client code*

## How to run end-to-end tests

These tests will launch the local web server and run Chrome.

### Run for production

- You'll need to build the production [client code](/node/client).

⚠️ *If you don't do this step, you'll get the following Go compilation error as the server can't find and embed the \*.js, \*.css files*

```
internal\staticfiles\staticfiles_notdev.go:15:12: pattern dist: no matching files found
```

- Open a terminal in the `e2etest` folder and run the end-to-end tests with:

```sh
go test
```

### Run for local development

- You'll need to run the local Node web server [client code](/node/client).

⚠️ *If you don't do this step, your end-to-end test will timeout and give a message similar to the following:*

```
--- FAIL: TestButtonClick (5.10s)
    e2etest_test.go:107: button click failed: chromedp has timed out. Exceeded 5s
```

- Open a terminal in the `e2etest` folder and run all integration tests with:

```sh
go test ./...
```
