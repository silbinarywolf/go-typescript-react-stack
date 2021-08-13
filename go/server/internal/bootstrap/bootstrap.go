package bootstrap

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"strconv"
	"strings"

	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/configuration"
	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/examplemodule"
	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/member"
	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/sqlw"
	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/staticfiles"

	"github.com/rs/cors"
)

// Bootstrap contains information from starting up the application
type Bootstrap struct {
	db         *sqlw.DB
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
	// close connection to database if serving is cancelled / stopped
	defer bs.db.Close()

	log.Printf("serving on http://localhost%s/", bs.httpServer.Addr)

	// todo(jae): 2021-07-20
	// In a *real* production server, we'd want this to call "ServeTLS" for HTTPS.
	// However for development, we'd still probably want "Serve" to be called.
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
		return nil, fmt.Errorf(`failed to load config: %w`, err)
	}

	// Connect to SQL server (postgres, as of 2021-08-13)
	driverAndURL := strings.SplitN(config.Database.URL, "://", 2)
	if len(driverAndURL) < 2 {
		return nil, fmt.Errorf(`invalid database URL, expected Database.URL to be prefixed with something like "postgres://"`)
	}
	db, err := sqlw.Connect(driverAndURL[0], config.Database.URL)
	if err != nil {
		return nil, fmt.Errorf(`unable to connect to database: %w`, err)
	}

	// Setup CORS (Cross-Origin Resource Sharing) and http server
	httpServer := &http.Server{
		Addr:    ":" + strconv.Itoa(config.WebServer.Port),
		Handler: http.DefaultServeMux,
	}

	// Apply Cross-Origin Resource Sharing
	cors := cors.New(cors.Options{
		// TODO(jae): 2021-08-12
		// change this to be configurable, we don't want to allow requests
		// from localhost:9000 for production
		AllowedOrigins: []string{"http://localhost:9000"},
		AllowedMethods: []string{"GET", "POST", "PUT"},
		AllowedHeaders: []string{"Accept", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization"},
	})
	httpServer.Handler = cors.Handler(httpServer.Handler)

	// Add serving static asset files to routes
	if err := staticfiles.AddRoutes(); err != nil {
		return nil, fmt.Errorf(`failed to setup serving ".js, .css" assets: %w`, err)
	}

	// Setup modules
	//
	// note(jae): 2021-07-20
	// I have a hunch that we'll probably want to change this so modules
	// "register" themselves and then all get initialized naively at this
	// point in time. However we need to see what real use-cases come up first
	// before doing that work.
	{
		if _, err := examplemodule.New(); err != nil {
			return nil, fmt.Errorf(`failed to init module: %w`, err)
		}
		if _, err := member.New(db); err != nil {
			return nil, fmt.Errorf(`failed to init module: %w`, err)
		}
	}

	// Start listening for connections
	ln, err := net.Listen("tcp", httpServer.Addr)
	if err != nil {
		return nil, err
	}
	bs := &Bootstrap{
		db:         db,
		httpServer: httpServer,
		listener:   ln,
	}
	return bs, nil
}
