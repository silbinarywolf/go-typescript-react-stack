package main

import (
	"fmt"

	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/bootstrap"
	_ "github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/modules"
)

func main() {
	bs, err := bootstrap.InitWithModulesAndListen()
	if err != nil {
		panic(fmt.Errorf("%+w", err))
	}
	if err := bs.Serve(); err != nil {
		panic(fmt.Errorf("%+w", err))
	}
}
