package auth

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"crypto/rand"

	"github.com/golang-jwt/jwt/v4"
)

// Member holds data that is exposed to authenticated requests
type Member struct {
	ID    int64
	Email string
}

// claims are what we store in the JWT token
type claims struct {
	ID    int64  `json:"id"`
	Email string `json:"email"`
	jwt.StandardClaims
}

// For HMAC signing method, the key can be any []byte. It is recommended to generate
// a key using crypto/rand or something equivalent. You need the same key for signing
// and validating.
//
// NOTE: Replacing this secret will invalidate all current login sessions
//
// generateHMACSecret function below can be used to generate a new key.
var hmacSecret []byte = []byte{123, 123, 205, 11, 226, 32, 57, 149, 101, 36, 248, 157, 23, 171, 122, 157, 121, 93, 231, 151, 140, 231, 80, 9, 6, 250, 29, 252, 8, 94, 188, 58}

// expiresInTime is in how many seconds a JWT will expire
//
// ie.
// - 3600 * time.Second = 1 hour
const expiresInTime = 3600 * time.Second

// generateHMACSecret is used *internally* to print out a new hmac secret key. By internally I mean this can
// be called to print something out to console temporarily and then we just copy-paste the new secret into this package.
func generateHMACSecret() string {
	// signingBits is 256 as we're using jwt.SigningMethodHS256 which is 256-bits
	const signingBits = 256
	hmac := make([]byte, signingBits/8)
	_, err := rand.Read(hmac)
	if err != nil {
		panic(err)
	}
	var output string
	output = "[]byte{"
	for i, b := range hmac {
		if i != 0 {
			output += ","
		}
		output += strconv.Itoa(int(b))
	}
	output += "}"
	return output
}

// GenerateJWT will create a new JWT token for a user
func GenerateJWT(id int64, email string, now time.Time) (string, error) {
	if id == 0 {
		return "", errors.New("ID cannot be 0 for GenerateJWT")
	}
	if email == "" {
		return "", errors.New("Email cannot be blank for GenerateJWT")
	}
	// Create a new token object, specifying signing method and the claims
	// you would like it to contain.
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, &claims{
		ID:    id,
		Email: email,
		StandardClaims: jwt.StandardClaims{
			// ExpiresAt maps to "exp" in the JWT spec
			ExpiresAt: now.Add(expiresInTime).Unix(),
			IssuedAt:  now.Unix(),
			// Issuer maps to "iss" in the JWT spec
			Issuer: "example-product",
			// nbf maps to "not before" time. ie. the token can only be used *after*
			// this time
			NotBefore: now.Unix(),
			// todo(jae): 2021-08-16
			// Need to think about whether I want/should/can use Id/Subject
			//Id: "",
			//Subject:   "",
		},
	})

	// Sign and get the complete encoded token as a string using the secret
	tokenString, err := token.SignedString(hmacSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func validateJWT(tokenString string) (*claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &claims{}, func(token *jwt.Token) (interface{}, error) {
		// Don't forget to validate the alg is what you expect:
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}
		return hmacSecret, nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*claims)
	if !ok {
		return nil, fmt.Errorf("unexpected claim type: %T", token.Claims)
	}
	if !token.Valid {
		return nil, errors.New("token is invalid")
	}
	return claims, nil
}

// AuthorizedHandler requires a user be logged-in for the request to work
func AuthorizedHandler(endpoint func(*Member, http.ResponseWriter, *http.Request)) func(http.ResponseWriter, *http.Request) {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("Authorization")
		if err == http.ErrNoCookie {
			http.Error(w, `missing "Authorization" cookie`, http.StatusBadRequest)
			return
		}
		token := cookie.Value
		if token == "" {
			http.Error(w, `invalid "Authorization" cookie, cannot be empty`, http.StatusBadRequest)
			return
		}
		if !strings.HasPrefix(token, "Bearer ") {
			http.Error(w, `invalid "Authorization" cookie, missing "Bearer " prefix`, http.StatusBadRequest)
			return
		}
		token = token[len("Bearer "):]
		claims, err := validateJWT(token)
		if err != nil {
			http.Error(w, "invalid JWT", http.StatusUnauthorized)
			return
		}
		if claims.ID == 0 {
			http.Error(w, "unexpected error, JWT missing ID", http.StatusInternalServerError)
			return
		}
		if claims.Email == "" {
			http.Error(w, "unexpected error, JWT missing Email", http.StatusInternalServerError)
			return
		}
		member := &Member{
			ID:    claims.ID,
			Email: claims.Email,
		}
		endpoint(member, w, r)
	})
}
