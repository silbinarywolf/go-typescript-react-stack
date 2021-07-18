package bootstrap

import (
	"fmt"
	"io"
	"log"
	"mime"
	"net"
	"net/http"
	"path/filepath"
	"strconv"

	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/configuration"
	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/staticfiles"
)

// Bootstrap contains information from starting up the application
type Bootstrap struct {
	httpServer *http.Server
	listener   net.Listener
}

type app struct {
	fileMap map[string][]byte
}

// Serve calls the underlying Go implementation. Copy-pasted documentation below.
//
// Serve accepts incoming connections on the Listener l, creating a
// new service goroutine for each. The service goroutines read requests and
// then call srv.Handler to reply to them.
//
// HTTP/2 support is only enabled if the Listener returns *tls.Conn
// connections and they were configured with "h2" in the TLS
// Config.NextProtos.
//
// Serve always returns a non-nil error and closes l.
// After Shutdown or Close, the returned error is ErrServerClosed.
func (bs *Bootstrap) Serve() error {
	if err := bs.httpServer.Serve(bs.listener); err != nil {
		return err
	}
	return nil
}

// InitAndListen will initialize the application. This will not start serving requests.
//
// note(jae): 2021-07-17
// We don't just call ListenAndServe by design so that test code can accurately
// call InitAndListen upfront and detect errors, then serve the http server in a goroutine.
//
// If we don't do this, test code would need to wait an arbitrary amount of milliseconds before
// trying to fire requests at the server and that can be flakey.
func InitAndListen() (*Bootstrap, error) {
	config, err := configuration.LoadConfig()
	if err != nil {
		return nil, fmt.Errorf("failed to load config: %w", err)
	}

	// Serve files
	{
		// note(jae): 2021-07-18
		// This implementation should be simplified and improved later
		// There's probably some first-class Go functions I can use instead

		var fileMap map[string][]byte
		{
			dir := "dist"
			fileInfoList, err := staticfiles.Files.ReadDir(dir)
			if err != nil {
				return nil, fmt.Errorf("failed to read staticfiles from %s: %w", dir, err)
			}
			fileMap = make(map[string][]byte, len(fileInfoList))
			for _, fileInfo := range fileInfoList {
				basename := fileInfo.Name()
				filename := dir + "/" + basename
				f, err := staticfiles.Files.Open(filename)
				if err != nil {
					return nil, fmt.Errorf("failed to read %s: %w", filename, err)
				}
				data, err := io.ReadAll(f)
				if err != nil {
					return nil, fmt.Errorf("failed to ReadAll %s: %w", data, err)
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
	}

	//http.HandleFunc("/", handleHomePage)

	httpServer := &http.Server{
		Addr:    ":" + strconv.Itoa(config.WebServer.Port),
		Handler: nil,
	}
	ln, err := net.Listen("tcp", httpServer.Addr)
	if err != nil {
		return nil, err
	}
	bs := &Bootstrap{
		httpServer: httpServer,
		listener:   ln,
	}
	return bs, nil
}

func handleHomePage(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "boo", http.StatusInternalServerError)
	// type TemplateData struct {
	//	Contacts []contact.Contact
	//}
	//var templateData TemplateData
	//templateData.Contacts = contact.GetAll()
	//if err := templates.ExecuteTemplate(w, "index.html", templateData); err != nil {
	//	http.Error(w, err.Error(), http.StatusInternalServerError)
	//	return
	//}
}
