package staticfile

import (
	"embed"
)

var Files embed.FS = embeddedFiles

// AddRoutes will serve compiled asset files from this Go webserver
//
// This will do nothing with "dev" build tags.
func AddRoutes() error {
	if err := addRoutes(); err != nil {
		return err
	}
	return nil
}
