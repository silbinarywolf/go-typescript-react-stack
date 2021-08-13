package member

import (
	"context"
	"encoding/json"
	"net/http"
	"net/mail"
	"strings"

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

	return module, nil
}

func (module *MemberModule) handleLogin(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "nothing has been implemented for this API yet", http.StatusInternalServerError)
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
			http.Error(w, "Email is already taken", 500)
			return
		}
	}

	var hashedPassword string
	{
		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), 18)
		if err != nil {
			http.Error(w, "Unexpected error registering", http.StatusInternalServerError)
			return
		}
		hashedPassword = string(hash)
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
