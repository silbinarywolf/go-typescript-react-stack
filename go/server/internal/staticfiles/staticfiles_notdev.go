//go:build !dev
// +build !dev

package staticfiles

import (
	"embed"
	"fmt"
	"io"
	"log"
	"mime"
	"net/http"
	"path/filepath"
)

//go:embed dist
var embeddedFiles embed.FS

func addRoutes() error {
	var fileMap map[string][]byte
	{
		dir := "dist"
		fileInfoList, err := Files.ReadDir(dir)
		if err != nil {
			return fmt.Errorf("failed to read staticfiles from %s: %w", dir, err)
		}
		fileMap = make(map[string][]byte, len(fileInfoList))
		for _, fileInfo := range fileInfoList {
			basename := fileInfo.Name()
			filename := dir + "/" + basename
			f, err := Files.Open(filename)
			if err != nil {
				return fmt.Errorf("failed to read %s: %w", filename, err)
			}
			data, err := io.ReadAll(f)
			if err != nil {
				return fmt.Errorf("failed to ReadAll %s: %w", data, err)
			}
			fileMap[basename] = data
		}
	}
	for f, d := range fileMap {
		// capture values for closure below
		filename := f
		data := d
		http.HandleFunc("/"+filename, func(w http.ResponseWriter, r *http.Request) {
			fileExt := filepath.Ext(filename)
			ctype := mime.TypeByExtension(fileExt)
			if ctype == "" {
				http.Error(w, "can't determine mime type for file: "+filename, http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", ctype)
			if _, err := w.Write(data); err != nil {
				log.Printf("error serving %s: %s", filename, err)
				return
			}
		})
	}
	filename := "index.html"
	d := fileMap[filename]
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if _, err := w.Write(d); err != nil {
			log.Printf("error serving %s: %s", filename, err)
			return
		}
	})
	return nil
}
