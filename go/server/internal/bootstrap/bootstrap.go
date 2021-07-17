package bootstrap

import (
	"fmt"
	"mime"
	"net"
	"net/http"
	"strconv"

	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/configuration"
)

// Bootstrap contains information from starting up the application
type Bootstrap struct {
	httpServer *http.Server
	listener   net.Listener
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

	// note(jae): 2021-07-17
	// without this, the http server will *not* serve CSS files correctly and they won't be loaded
	// by the browser
	if err := mime.AddExtensionType(".css", "text/css; charset=utf-8"); err != nil {
		return nil, fmt.Errorf("failed to add .css mimetype: %w", err)
	}
	if err := mime.AddExtensionType(".js", "text/javascript; charset=utf-8"); err != nil {
		return nil, fmt.Errorf("failed to add .js mimetype: %w", err)
	}

	http.HandleFunc("/", handleHomePage)
	/* http.HandleFunc("/static/main.css", func(w http.ResponseWriter, r *http.Request) {
		// Manually serving CSS rather than using http.FileServer because Golang's in-built
		// detection methods can't really determine if the file is CSS or not.
		// Chrome complains if you try to load a CSS file with "text/plain". (has errors in Chrome DevTools)
		// See "DetectContentType" in the standard library, in file: net\http\sniff.go
		w.Header().Add("Content-Type", "text/css; charset=utf-8")
		http.ServeFile(w, r, r.URL.Path[1:])
	}) */
	httpServer := &http.Server{
		Addr:    ":" + strconv.Itoa(config.WebServer.Port),
		Handler: nil,
	}
	ln, err := net.Listen("tcp", httpServer.Addr)
	if err != nil {
		return nil, err
	}
	return &Bootstrap{
		httpServer: httpServer,
		listener:   ln,
	}, nil
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
