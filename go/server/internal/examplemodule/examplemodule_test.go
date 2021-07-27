package examplemodule

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
)

var (
	// testModule can be accessed by various tests
	testModule *ExampleModule
)

func TestMain(m *testing.M) {
	// initialize module once before running all tests.
	// this includes adding routes like "/api/[MODULE]/call"
	var err error
	testModule, err = New()
	if err != nil {
		panic(fmt.Sprintf(`failed to init module: %s`, err))
	}

	// Run Test*** functions
	os.Exit(m.Run())
}

func TestCall(t *testing.T) {
	// create request, setup recorder, then fire request at endpoint
	url := modulePath + "/call"
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
	if status := rec.Code; status != http.StatusInternalServerError {
		t.Errorf("returned wrong status code.\ngot: %v\nwant %v", status, http.StatusInternalServerError)
	}

	// Check it returns what we expect in the HTTP body
	got := strings.TrimSpace(rec.Body.String())
	expected := `nothing has been implemented for this API yet`
	if got != expected {
		t.Errorf("returned unexpected body.\ngot: %v\nwant %v", got, expected)
	}
}
