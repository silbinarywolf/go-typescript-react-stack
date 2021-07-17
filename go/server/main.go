package main

import (
	"fmt"

	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/bootstrap"
)

func main() {
	bs, err := bootstrap.InitAndListen()
	if err != nil {
		panic(fmt.Errorf("%+w", err))
	}
	if err := bs.Serve(); err != nil {
		panic(fmt.Errorf("%+w", err))
	}
}
