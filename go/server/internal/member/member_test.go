package member

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/sqlw"
)

var (
	// testModule can be accessed by various tests
	testModule *MemberModule
)

func TestMain(m *testing.M) {
	// todo(jae): 2021-08-13
	// we will need a way for this to:
	// - be configurable or to only point at a test database
	// - ideally get the same "bag of stuff" when bootstrap is initialized
	//
	// For now, we just naively connect

	// init db
	db, err := sqlw.Connect("postgres", "postgres://postgres:password@localhost:5432/postgres?sslmode=disable")
	if err != nil {
		panic(fmt.Errorf(`unable to connect to database: %w`, err))
	}

	// initialize module once before running all tests.
	// this includes adding routes like "/api/[MODULE]/call"
	testModule, err = New(db)
	if err != nil {
		panic(fmt.Errorf(`failed to init module: %w`, err))
	}

	// Remove test data that could've be inserted previously
	if _, err := db.NamedExecContext(
		context.Background(),
		`DELETE FROM "Member" WHERE "Email" = :Email`,
		map[string]interface{}{
			"Email": "register_good_integration_test@test.com",
		},
	); err != nil {
		panic(fmt.Errorf(`failed to clear old data: %w`, err))
	}

	// Run Test*** functions
	os.Exit(m.Run())
}

func TestRegister_Good_SimpleCase(t *testing.T) {
	// create body for POST request
	var body io.Reader
	{
		var reqRecord memberRegistrationRequest
		reqRecord.Email = "register_good_integration_test@test.com"
		reqRecord.Password = "test1234"
		byteData, err := json.Marshal(&reqRecord)
		if err != nil {
			t.Fatalf(`failed to marshal JSON body: %s`, err)
		}
		body = bytes.NewReader(byteData)
	}

	rec := postRegister(t, body)

	// Check status code matches
	if expected := http.StatusOK; rec.Code != expected {
		t.Errorf("returned wrong status code.\ngot: %v\nwant %v", rec.Code, expected)
	}

	// Check it returns what we expect in the HTTP body
	got := strings.TrimSpace(rec.Body.String())
	expected := `Successfully registered`
	if got != expected {
		t.Errorf("returned unexpected body.\ngot: %v\nwant %v", got, expected)
	}
}

func TestRegister_Bad_EmptyUsername(t *testing.T) {
	// create body for POST request
	var body io.Reader
	{
		var reqRecord memberRegistrationRequest
		reqRecord.Email = ""
		reqRecord.Password = "test1234"
		byteData, err := json.Marshal(&reqRecord)
		if err != nil {
			t.Fatalf(`failed to marshal JSON body: %s`, err)
		}
		body = bytes.NewReader(byteData)
	}

	rec := postRegister(t, body)

	// Check status code matches
	if expected := http.StatusBadRequest; rec.Code != expected {
		t.Errorf("returned wrong status code.\ngot: %v\nwant %v", rec.Code, expected)
	}
}

func TestRegister_Bad_EmptyPassword(t *testing.T) {
	// create body for POST request
	var body io.Reader
	{
		var reqRecord memberRegistrationRequest
		reqRecord.Email = ""
		reqRecord.Password = "test1234"
		byteData, err := json.Marshal(&reqRecord)
		if err != nil {
			t.Fatalf(`failed to marshal JSON body: %s`, err)
		}
		body = bytes.NewReader(byteData)
	}

	rec := postRegister(t, body)

	// Check status code matches
	if expected := http.StatusBadRequest; rec.Code != expected {
		t.Errorf("returned wrong status code.\ngot: %v\nwant %v", rec.Code, expected)
	}
}

func TestRegister_Bad_InvalidEmail(t *testing.T) {
	// create body for POST request
	var body io.Reader
	{
		var reqRecord memberRegistrationRequest
		reqRecord.Email = "invalid@"
		reqRecord.Password = "test1234"
		byteData, err := json.Marshal(&reqRecord)
		if err != nil {
			t.Fatalf(`failed to marshal JSON body: %s`, err)
		}
		body = bytes.NewReader(byteData)
	}

	rec := postRegister(t, body)

	// Check status code matches
	if expected := http.StatusBadRequest; rec.Code != expected {
		t.Errorf("returned wrong status code.\ngot: %v\nwant %v", rec.Code, expected)
	}
}

func postRegister(t *testing.T, body io.Reader) *httptest.ResponseRecorder {
	// create request, setup recorder, then fire request at endpoint
	url := modulePath + "/register"
	req, err := http.NewRequestWithContext(context.Background(), "POST", url, body)
	if err != nil {
		t.Fatalf(`failed to create request: %s`, err)
	}
	h, pattern := http.DefaultServeMux.Handler(req)
	if pattern == "" {
		t.Fatalf("failed to find route: %s\nHas the route been registered? (This occurs during module initialization)", url)
	}
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec
}
