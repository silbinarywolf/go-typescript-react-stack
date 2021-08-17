package member

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/mail"
	"strings"
	"time"

	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/identity"
	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/sqlutil"
	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/sqlw"
	"golang.org/x/crypto/bcrypt"
)

// modulePath is namespace where this modules API endpoints belong
// This constant is used by tests as well
const modulePath = "/api/member"

var memberFieldList = sqlutil.GetDBFieldList(&Member{})

var memberRegisterFieldList = sqlutil.GetDBFieldList(&MemberRegister{})

var memberRegisterInterpolateFieldList = sqlutil.GetDBInterpolateList(&MemberRegister{})

// MemberModule holds the arguments we pass to its New function
// such as the db, logger or other things
type MemberModule struct {
	db *sqlw.DB
	//logger *logrus.Logger
}

func New(db *sqlw.DB) (*MemberModule, error) {
	module := &MemberModule{}
	module.db = db
	//module.logger = logger

	// Setup routes
	http.HandleFunc(modulePath+"/login", module.handleLogin)
	http.HandleFunc(modulePath+"/register", module.handleRegister)
	http.HandleFunc(modulePath+"/menu", identity.AuthorizedHandler(module.handleMenu))

	return module, nil
}

type memberLoginRequest struct {
	Email    string `json:"Email"`
	Password string `json:"Password"`
}

type memberLoginResponse struct {
	AccessToken string `json:"access_token"`
	//TokenType    string `json:"token_type"`
	//ExpiresIn    string `json:"expires_in"`
	//RefreshToken string `json:"refresh_token"`
	//Scope        string `json:"scope"`
}

func (m *MemberModule) handleLogin(w http.ResponseWriter, r *http.Request) {
	// Decode and validate request
	var req memberLoginRequest
	{
		dec := json.NewDecoder(r.Body)
		dec.DisallowUnknownFields()
		if err := dec.Decode(&req); err != nil {
			http.Error(w, "Invalid fields", http.StatusBadRequest)
			return
		}
		req.Email = strings.ToLower(req.Email)

		if strings.TrimSpace(req.Email) == "" {
			http.Error(w, "Email cannot be blank", http.StatusBadRequest)
			return
		}
		if strings.TrimSpace(req.Password) == "" {
			http.Error(w, "Password cannot be blank", http.StatusBadRequest)
			return
		}
		_, err := mail.ParseAddress(req.Email)
		if err != nil {
			http.Error(w, "Email is not a valid email address", http.StatusBadRequest)
			return
		}
	}

	// Check if member exists
	var member MemberRegister
	{
		stmt, err := m.db.PrepareNamedContext(
			context.Background(),
			`SELECT `+memberRegisterFieldList+` FROM "Member" WHERE "Email" = :Email`,
		)
		if err != nil {
			log.Printf("login: prepared query error: %s", err)
			http.Error(w, "Unexpected error logging in", http.StatusInternalServerError)
			return
		}
		var memberList []MemberRegister
		if err := stmt.SelectContext(
			context.Background(),
			&memberList,
			map[string]interface{}{
				"Email": req.Email,
			},
		); err != nil {
			log.Printf("login: select query error: %s", err)
			http.Error(w, "Unexpected error logging in", http.StatusInternalServerError)
			return
		}
		if len(memberList) == 0 {
			http.Error(w, "No account exists", http.StatusNotFound)
			return
		}
		member = memberList[0]
	}

	// Validate password
	switch member.PasswordType {
	case "bcrypt":
		if err := bcrypt.CompareHashAndPassword([]byte(member.Password), []byte(req.Password)); err != nil {
			http.Error(w, "Invalid password", http.StatusUnauthorized)
			return
		}
	default:
		// note(jae): 2021-08-16
		// this should never happen. Database has constraints to prevent PasswordType from being anything
		// but "bcrypt" for now.
		// Looking at how bcrypt works too, it's probably unlikely it'll change for another decade or so.
		http.Error(w, "Account exists but has an invalid password type", http.StatusInternalServerError)
		return
	}

	// Generate token
	tokenString, err := identity.GenerateJWT(member.Email, time.Now())
	if err != nil {
		http.Error(w, "Unexpected error generating JWT", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:  "Authorization",
		Value: "Bearer " + tokenString,
		Path:  "/",
		// note(jae): 2021-08-16
		// - HttpOnly, only accessible via browser requests. JavaScript cannot read it
		// - SameSite
		// - Secure
		//
		// These three properties are recommended as best practice for JWT tokens.
		// The key reason being that if you store this token in LocalStorage/SessionStorage, it could be stolen
		// by client-side JS code.
		//
		// See here if you're curious: https://blog.logrocket.com/jwt-authentication-best-practices
		// Mirror: https://web.archive.org/web/20210816043710/https://blog.logrocket.com/jwt-authentication-best-practices/
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		// todo(jae): 2021-08-16
		// This should be true for non-development builds
		Secure: true,
	})
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Login successful")
}

type memberRegistrationRequest struct {
	Email    string `json:"Email"`
	Password string `json:"Password"`
}

func (m *MemberModule) handleRegister(w http.ResponseWriter, r *http.Request) {
	// Decode and validate request
	var req memberRegistrationRequest
	{
		dec := json.NewDecoder(r.Body)
		dec.DisallowUnknownFields()
		if err := dec.Decode(&req); err != nil {
			http.Error(w, "Invalid fields", http.StatusBadRequest)
			return
		}
		req.Email = strings.ToLower(req.Email)

		if strings.TrimSpace(req.Email) == "" {
			http.Error(w, "Email cannot be blank", http.StatusBadRequest)
			return
		}
		if strings.TrimSpace(req.Password) == "" {
			http.Error(w, "Password cannot be blank", http.StatusBadRequest)
			return
		}
		_, err := mail.ParseAddress(req.Email)
		if err != nil {
			http.Error(w, "Email is not a valid email address", http.StatusBadRequest)
			return
		}
	}

	// Check if member exists
	{
		res, err := m.db.NamedExecContext(
			context.Background(),
			`SELECT "Email" FROM "Member" WHERE "Email" = :Email`,
			map[string]interface{}{
				"Email": req.Email,
			},
		)
		if err != nil {
			http.Error(w, "Unexpected error registering", http.StatusInternalServerError)
			return
		}
		rowCount, err := res.RowsAffected()
		if err != nil {
			http.Error(w, "Unexpected error registering", http.StatusInternalServerError)
			return
		}
		if rowCount > 0 {
			http.Error(w, "Email is already taken", http.StatusConflict)
			return
		}
	}

	// Get hashed password
	var hashedPassword string
	{
		// note(jae): 2021-08-13
		//
		// I chose a value of "16". At the time of writing this operation takes ~3 seconds in my machine
		// (AMD Ryzen 5 3600 6-Core Processor, ~3.6 GHZ)
		//
		// Notes about the "cost" parameter are here:
		// https://security.stackexchange.com/questions/17207/recommended-of-rounds-for-bcrypt/83382#83382
		//
		// tldr: bigger = slower to process, which in turn means it'd take longer to crack
		const bcryptCost = 16

		// note(jae): 2021-08-13
		// Go's bcrypt implementation does salting as well
		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcryptCost)
		if err != nil {
			http.Error(w, "Unexpected error registering", http.StatusInternalServerError)
			return
		}
		hashedPassword = string(hash)

		// If hashing took less than N amount of time, sleep until it takes that time
		//
		// note(jae): 2021-08-13
		// we may not need this immediately, but pen testers tend to notice when something like
		// login/registration time taken varies. We may want something like this to occur on the entire
		//if expectedWaitTime := time.Second * 5; time.Since(now) < expectedWaitTime {
		//	sleepTime := expectedWaitTime - time.Since(now)
		//	if sleepTime > 0 {
		//		time.Sleep(sleepTime)
		//	}
		//}
		//log.Printf("time since: %v", time.Since(now))
	}

	// Register new member
	{
		record := &MemberRegister{}
		record.Email = req.Email
		record.Password = hashedPassword
		record.PasswordType = "bcrypt"
		if _, err := m.db.NamedExecContext(
			context.Background(),
			`INSERT INTO "Member" (`+memberRegisterFieldList+`) VALUES
		(`+memberRegisterInterpolateFieldList+`)`,
			record,
		); err != nil {
			http.Error(w, "Unexpected error registering", http.StatusInternalServerError)
			return
		}
	}

	http.Error(w, "Successfully registered", http.StatusOK)
}

type Member struct {
	Email     string `db:"Email"`
	FirstName string `db:"FirstName"`
	LastName  string `db:"LastName"`
}

type MemberRegister struct {
	Member
	Password     string `db:"Password"`
	PasswordType string `db:"PasswordType"`
}

func (m *MemberModule) handleMenu(claims *identity.Claims, w http.ResponseWriter, r *http.Request) {
	http.Error(w, "TODO(jae): add menu endpoint", http.StatusBadRequest)
}
