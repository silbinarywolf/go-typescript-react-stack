//go:build dev
// +build dev

package staticfile

import (
	"embed"
)

// embeddedFiles don't exist for developer builds
var embeddedFiles embed.FS

// note(jae): 2021-07-18
// experimented with adding sugar at this level
// but probably not a great idea
// type myFS embed.FS
//func (fs myFS) Open(name string) (fs.File, error) {
//	return embed.FS(fs).Open(path.Join("dist", name))
//}

func addRoutes() error {
	// do nothing, development mode does not setup the routes to serve assets
	//
	// The expectation is that you're running a seperate NPM development
	// server
	return nil
}
