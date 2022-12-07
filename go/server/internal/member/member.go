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

	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/auth"
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
	http.HandleFunc(modulePath+"/me", auth.AuthorizedHandler(module.handleMe))

	return module, nil
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
			r.Context(),
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

	doLogin(w, member.Email)

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
			if strings.Contains(err.Error(), `relation "Member" does not exist`) {
				log.Printf("error checking for existing email: %v\n\nSuggestion:\n- Member table doesn't seem to exist, have you run dbmate migrations or are you connecting to the correct database?", err)
			} else {
				log.Printf("error checking for existing email: %v", err)
			}
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
		// I experimented with a value of "16". At the time of writing this operation takes ~3 seconds in my machine
		// (AMD Ryzen 5 3600 6-Core Processor, ~3.6 GHZ)
		//
		// Notes about the "cost" parameter are here:
		// https://security.stackexchange.com/questions/17207/recommended-of-rounds-for-bcrypt/83382#83382
		//
		// tldr: bigger = slower to process, which in turn means it'd take longer to crack
		const bcryptCost = 13

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
	member := &MemberRegister{}
	{
		member.Email = req.Email
		member.Password = hashedPassword
		member.PasswordType = "bcrypt"
		if _, err := m.db.NamedExecContext(
			context.Background(),
			`INSERT INTO "Member" (`+memberRegisterFieldList+`) VALUES
		(`+memberRegisterInterpolateFieldList+`)`,
			member,
		); err != nil {
			http.Error(w, "Unexpected error registering", http.StatusInternalServerError)
			return
		}
	}

	// Login after registration
	doLogin(w, member.Email)

	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Successfully registered")
}

type memberMeResponse struct {
	// Profile will return member profile data
	Profile memberMeProfile `json:"Profile"`
	// note(jae): 2021-08-18
	// I suspect in the future we may need a "Config" property that returns
	// certain feature flags of the application for logged-in users.
	// Whether this is just a bag of stuff or not remains to be seen but I thought
	// it was worth documenting why we don't just have the "Profile" information embedded
	// directly here
	// Config configflags.Config `json:"Config"`
}

type memberMeProfile struct {
	// todo(jae): 2021-08-18
	// stubbed for later, we can return some information about
	// the logged-in user here

	// Email is the email address of the current profile
	Email string `json:"Email"`
}

func (m *MemberModule) handleMe(claims *auth.Member, w http.ResponseWriter, r *http.Request) {
	var resp memberMeResponse
	resp.Profile.Email = claims.Email

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	if err := json.NewEncoder(w).Encode(&resp); err != nil {
		http.Error(w, "unexpected error with encoding", http.StatusInternalServerError)
		return
	}
}

// doLogin will generate the login token for the given member email address
func doLogin(w http.ResponseWriter, email string) {
	// Generate token
	tokenString, err := auth.GenerateJWT(email, time.Now())
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
		Secure:   true,
	})
}
