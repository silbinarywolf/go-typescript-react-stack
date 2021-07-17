package staticfiles

import "embed"

//go:embed static/*.*
var EmbeddedFiles embed.FS
