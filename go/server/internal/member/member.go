package member

import (
	"net/http"

	"github.com/jackc/pgx/v4"
)

// modulePath is namespace where this modules API endpoints belong
// This constant is used by tests as well
const modulePath = "/api/member"

// MemberModule holds the arguments we pass to its New function
// such as the db, logger or other things
type MemberModule struct {
	db *pgx.Conn
	//logger *logrus.Logger
}

func New(db *pgx.Conn) (*MemberModule, error) {
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

func (module *MemberModule) handleRegister(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "nothing has been implemented for this API yet", http.StatusInternalServerError)
}
