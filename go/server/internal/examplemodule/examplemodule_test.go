package examplemodule

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestCall(t *testing.T) {
	// initialize module
	//
	// note(jae): 2021-07-20
	// we could consider moving this initialization into a "TestMain" function
	// so that we only initialize the module ONCE per suite of tests rather than per test.
	// But we can decide if that's worth doing later.
	module, err := New()
	if err != nil {
		t.Fatalf(`failed to init module: %s`, err)
	}

	// create request, setup recorder, then fire request at endpoint
	req, err := http.NewRequest("GET", modulePath+"/call", nil)
	if err != nil {
		t.Fatalf(`failed to create request: %s`, err)
	}
	rec := httptest.NewRecorder()
	http.HandlerFunc(module.handleCall).ServeHTTP(rec, req)

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
