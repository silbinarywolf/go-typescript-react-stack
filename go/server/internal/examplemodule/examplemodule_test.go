package examplemodule

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/bootstrap"
	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/configuration"
)

var (
	// testModule can be accessed by various tests
	testModule *ExampleModule
)

func TestMain(m *testing.M) {
	// Setup bootstrap
	// ie. database
	var bs *bootstrap.Bootstrap
	{
		config := &configuration.Config{}
		config.Database.URL = os.Getenv("DATABASE_URL")
		if config.Database.URL == "" {
			config.Database.URL = "postgres://postgres:password@localhost:5432/postgres?sslmode=disable"
		}
		var err error
		bs, err = bootstrap.InitNoModules(config)
		if err != nil {
			panic(fmt.Sprintf(`failed to init bootstrap: %s`, err))
		}
	}

	// initialize module once before running all tests.
	// this includes adding routes like "/api/[MODULE]/call"
	var err error
	testModule, err = New(bs.DB())
	if err != nil {
		panic(fmt.Sprintf(`failed to init module: %s`, err))
	}

	// Run Test*** functions
	os.Exit(m.Run())
}

func TestList(t *testing.T) {
	// create request, setup recorder, then fire request at endpoint
	url := modulePath + "/list"
	req, err := http.NewRequestWithContext(context.Background(), "GET", url, nil)
	if err != nil {
		t.Fatalf(`failed to create request: %s`, err)
	}
	h, pattern := http.DefaultServeMux.Handler(req)
	if pattern == "" {
		t.Fatalf("failed to find route: %s\nHas the route been registered? (This occurs during module initialization)", url)
	}
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)

	// Check status code matches
	if status := rec.Code; status != http.StatusOK {
		t.Errorf("returned wrong status code.\ngot: %v\nwant %v", status, http.StatusInternalServerError)
	}

	// Check it returns what we expect in the HTTP body
	got := strings.TrimSpace(rec.Body.String())
	expected := `{"items":[{"title":"A Fake Todo Item Title","description":"Something I want to do"}]}`
	if got != expected {
		t.Errorf("returned unexpected body.\ngot: %v\nwant %v", got, expected)
	}
}
