package examplemodule

import (
	"net/http"

	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/sqlw"
)

// modulePath is namespace where this modules API endpoints belong
// This constant is used by tests as well
const modulePath = "/api/examplemodule"

// ExampleModule holds the arguments we pass to its New function
// such as the db, logger or other things
type ExampleModule struct {
	db *sqlw.DB
}

func New(db *sqlw.DB) (*ExampleModule, error) {
	m := &ExampleModule{}
	m.db = db

	// Setup routes
	http.HandleFunc(modulePath+"/call", m.handleCall)

	return m, nil
}

func (m *ExampleModule) handleCall(w http.ResponseWriter, r *http.Request) {
	// Named query with SQLX library
	// -----------------------------
	/* stmt, err := m.db.PrepareNamedContext(r.Context(), `"SELECT * FROM "Table" WHERE "ID" = :MyIDParam`)
	if err != nil {
		log.Printf("error preparing select query: %s", err)
		http.Error(w, "unexpected error", http.StatusInternalServerError)
		return
	}
	var sliceOfStructs []examplemoduledao.MyDatabaseTable
	if err := stmt.SelectContext(r.Context(), &sliceOfStructs, map[string]interface{}{
		"MyIDParam": "test",
	}); err != nil {
		log.Printf("error getting from table: %s", err)
		http.Error(w, "unexpected error", http.StatusInternalServerError)
		return
	} */
	http.Error(w, "nothing has been implemented for this API yet", http.StatusInternalServerError)
}
