package identity

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

func TestGenValid_Good_EmailNow(t *testing.T) {
	token, err := GenerateJWT("myemail@test.com", time.Now())
	if err != nil {
		t.Fatalf("unable to generate JWT, got unexpected error: %s", err)
	}
	if _, err := ValidateJWT(token); err != nil {
		t.Fatalf("unable to validate after generating JWT, got unexpected error: %s", err)
	}
}

// TestGenValid_Bad_FutureToken
//
// This will test if a token generated for a future time (1 minute into the future) is
// valid. It should not be.
func TestGenValid_Bad_FutureToken(t *testing.T) {
	token, err := GenerateJWT("myemail@test.com", time.Now().Add(1*time.Minute))
	if err != nil {
		t.Fatalf("unable to generate JWT, got unexpected error: %s", err)
	}
	_, err = ValidateJWT(token)
	if err == nil {
		t.Fatalf("expected a validation error from JWT, but got no error")
	}
	jwtErr, ok := err.(*jwt.ValidationError)
	if !ok {
		t.Fatalf("expected *jwt.ValidationError but got %T", err)
	}
	if jwtErr.Errors&jwt.ValidationErrorNotValidYet == 0 {
		t.Fatalf("expected error to have ValidationErrorNotValidYet flag but it didn't, error: %s", err)
	}
	if jwtErr.Errors&jwt.ValidationErrorExpired != 0 {
		t.Fatalf("error should not have validation error expired: %s", err)
	}
}

func TestGenValid_Bad_ExpiredToken(t *testing.T) {
	// Mock "now" time function used by JWT
	// We mock it to be in the future when the token expires
	jwtPrevTimeFunc := jwt.TimeFunc
	jwt.TimeFunc = func() time.Time {
		const testExpiresInTime = 3600 * time.Second
		return time.Now().Add(testExpiresInTime + (1 * time.Minute))
	}
	defer func() {
		// revert at the end of this function
		jwt.TimeFunc = jwtPrevTimeFunc
	}()

	token, err := GenerateJWT("myemail@test.com", time.Now())
	if err != nil {
		t.Fatalf("unable to generate JWT, got unexpected error: %s", err)
	}
	_, err = ValidateJWT(token)
	if err == nil {
		t.Fatalf("expected a validation error from JWT, but got no error")
	}
	jwtErr, ok := err.(*jwt.ValidationError)
	if !ok {
		t.Fatalf("expected *jwt.ValidationError but got %T", err)
	}
	if jwtErr.Errors&jwt.ValidationErrorExpired == 0 {
		t.Fatalf("expected error to have ValidationErrorExpired flag but it didn't, error: %s", err)
	}
}
