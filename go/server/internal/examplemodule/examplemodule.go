package examplemodule

import (
	"net/http"
)

// modulePath is namespace where this modules API endpoints belong
// This constant is used by tests as well
const modulePath = "/api/examplemodule"

// ExampleModule holds the arguments we pass to its New function
// such as the db, logger or other things
type ExampleModule struct {
	//db *sql.DB
	//logger *logrus.Logger
}

func New() (*ExampleModule, error) {
	module := &ExampleModule{}
	//module.db = db
	//module.logger = logger

	// Setup routes
	http.HandleFunc(modulePath+"/call", module.handleCall)

	return module, nil
}

func (module *ExampleModule) handleCall(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "nothing has been implemented for this API yet", http.StatusInternalServerError)
}
