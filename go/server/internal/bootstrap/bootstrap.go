package bootstrap

import (
	"errors"
	"fmt"
	"log"
	"net"
	"net/http"
	"strconv"
	"strings"

	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/auth"
	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/configuration"
	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/sqlw"

	"github.com/rs/cors"
)

var (
	// initModulesFunc is setup by an external module ("modules") and this is how we
	// initialize modules outside of the bootstrap package
	initModulesFunc func(bs *Bootstrap) error
)

// Bootstrap contains information from starting up the application
type Bootstrap struct {
	db         *sqlw.DB
	httpServer *http.Server
	listener   net.Listener
}

func (bs *Bootstrap) DB() *sqlw.DB {
	return bs.db
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

// InitWithModulesAndListen will initialize the application. This will not start serving requests.
//
// note(jae): 2021-07-17
// We don't just call ListenAndServe by design so that test code can accurately
// call InitAndListen upfront and detect errors, then serve the http server in a goroutine.
//
// If we don't do this, test code would need to wait an arbitrary amount of milliseconds before
// trying to fire requests at the server and that can be flakey.
func InitWithModulesAndListen() (*Bootstrap, error) {
	if initModulesFunc == nil {
		return nil, errors.New(`no modules callback registered. Must call RegisterInit before calling this. You may be missing a side-effect import to "(THIS_REPOSITORY)/go/server/internal/modules"`)
	}

	config, err := configuration.LoadConfig()
	if err != nil {
		return nil, fmt.Errorf(`failed to load config: %w`, err)
	}

	// initialize bootstrap with no modules (yet... we do that below)
	bs, err := InitNoModules(config)
	if err != nil {
		return nil, fmt.Errorf(`failed to initialize core: %w`, err)
	}

	// Apply Cross-Origin Resource Sharing
	corsMiddleware := cors.New(cors.Options{
		AllowedOrigins: config.WebServer.CORS.AllowedOrigins,
		AllowedMethods: []string{"GET", "POST", "PUT"},
		AllowedHeaders: []string{"Accept", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization"},
		// NOTE(jae): 2021-08-12
		// AllowCredentials must be true if we're going to allow setting a HttpOnly cookie for JWT tokens
		AllowCredentials: true,
	})
	bs.httpServer.Handler = corsMiddleware.Handler(bs.httpServer.Handler)

	// Setup modules
	//
	// note(jae): 2021-08-22
	// This function callback is setup by another Go package
	// see: "(THIS_REPOSITORY)/go/server/internal/modules"
	if err := initModulesFunc(bs); err != nil {
		return nil, fmt.Errorf(`error initializing modules: %w`, err)
	}

	// Start listening for connections
	bs.listener, err = net.Listen("tcp", bs.httpServer.Addr)
	if err != nil {
		return nil, err
	}
	return bs, nil
}

func InitNoModules(config *configuration.Config) (*Bootstrap, error) {
	// Connect to SQL server (postgres, as of 2021-08-13)
	driverAndURL := strings.SplitN(config.Database.URL, "://", 2)
	if len(driverAndURL) < 2 {
		return nil, fmt.Errorf(`invalid database URL, expected Database.URL to be prefixed with something like "postgres://"`)
	}
	db, err := sqlw.Connect(driverAndURL[0], config.Database.URL)
	if err != nil {
		return nil, fmt.Errorf(`unable to connect to database: %w`, err)
	}
	if err := auth.Init(db); err != nil {
		return nil, fmt.Errorf(`unable to init auth: %w`, err)
	}

	// Setup CORS (Cross-Origin Resource Sharing) and http server
	httpServer := &http.Server{
		Addr:    ":" + strconv.Itoa(config.WebServer.Port),
		Handler: http.DefaultServeMux,
	}

	bs := &Bootstrap{
		db:         db,
		httpServer: httpServer,
	}
	return bs, nil
}

// RegisterInit can only be called once and is used to describe the modules to initialize
func RegisterInit(callback func(bs *Bootstrap) error) {
	if initModulesFunc != nil {
		panic("RegisterInit can only be called once")
	}
	initModulesFunc = callback
}
