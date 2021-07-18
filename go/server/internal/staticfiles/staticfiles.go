package staticfiles

import (
	"embed"
)

//go:embed dist
var embeddedFiles embed.FS

var Files embed.FS = embeddedFiles

// note(jae): 2021-07-18
// experimented with adding sugar at this level
// but probably not a great idea
// type myFS embed.FS
//func (fs myFS) Open(name string) (fs.File, error) {
//	return embed.FS(fs).Open(path.Join("dist", name))
//}
