package modules

import (
	"fmt"

	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/bootstrap"
	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/examplemodule"
	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/member"
	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/staticfiles"
)

// init is called automatically at start-up if this package is imported with side-effects
//
// ie. import (_ "thispackage")
func init() {
	bootstrap.RegisterInit(func(bs *bootstrap.Bootstrap) error {
		// Add serving static asset files to routes
		if err := staticfiles.AddRoutes(); err != nil {
			return fmt.Errorf(`failed to setup serving ".js, .css" assets: %w`, err)
		}
		if _, err := examplemodule.New(); err != nil {
			return fmt.Errorf(`failed to init module: %w`, err)
		}
		// Setup member
		if _, err := member.New(bs.DB()); err != nil {
			return fmt.Errorf(`failed to init module: %w`, err)
		}
		return nil
	})
}
