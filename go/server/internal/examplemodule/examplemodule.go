package examplemodule

import (
	"encoding/json"
	"net/http"

	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/auth"
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
	http.HandleFunc(modulePath+"/list", auth.AuthorizedHandler(m.handleList))
	http.HandleFunc(modulePath+"/add", auth.AuthorizedHandler(m.handleAdd))

	return m, nil
}

type todoListResponse struct {
	Items []todoListItemAPI `json:"items"`
}

type todoListItemAPI struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

func (m *ExampleModule) handleList(member *auth.Member, w http.ResponseWriter, r *http.Request) {
	// Named query with SQLX library
	// -----------------------------
	/* stmt, err := m.db.PrepareNamedContext(r.Context(), `"SELECT * FROM "TodoItem" WHERE "ID" = :MyIDParam`)
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

	// TODO: Make this get the members todo list items from the database
	resp := todoListResponse{}
	resp.Items = append(resp.Items, todoListItemAPI{
		Title:       "A Fake Todo Item Title",
		Description: "Something I want to do",
	})
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	if err := json.NewEncoder(w).Encode(&resp); err != nil {
		http.Error(w, "unexpected error with encoding", http.StatusInternalServerError)
		return
	}
}

func (m *ExampleModule) handleAdd(member *auth.Member, w http.ResponseWriter, r *http.Request) {
}
