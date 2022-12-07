package examplemodule

import (
	"encoding/json"
	"fmt"
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
	http.HandleFunc(modulePath+"/list", m.handleList)
	http.HandleFunc(modulePath+"/add", m.handleAdd)

	// note(jae): 2022-12-07
	// We'd normally wrap these routes in another function to handle authorisation
	// and get the member context but currently the test code doesn't have support
	// to deal with this.
	//http.HandleFunc(modulePath+"/list", auth.AuthorizedHandler(m.handleList))
	//http.HandleFunc(modulePath+"/add", auth.AuthorizedHandler(m.handleAdd))

	return m, nil
}

type todoListResponse struct {
	Items []todoListItemAPI `json:"items"`
}

type todoListItemAPI struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

func (m *ExampleModule) handleList(w http.ResponseWriter, r *http.Request) {
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

	//
	// TODO: Make this get a todo list items from the database
	//		 It just needs to get them all, it doesn't need to be attached to the member
	//

	resp := todoListResponse{}
	resp.Items = append(resp.Items, todoListItemAPI{
		Title:       "A Fake Todo Item Title",
		Description: "This data should come from the database instead! Not be mocked in the backend!",
	})
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	if err := json.NewEncoder(w).Encode(&resp); err != nil {
		http.Error(w, "unexpected error with encoding", http.StatusInternalServerError)
		return
	}
}

type todoItemAddRequest struct {
	Title       string `json:"Title"`
	Description string `json:"Description"`
}

func (m *ExampleModule) handleAdd(w http.ResponseWriter, r *http.Request) {
	// Decode and validate request
	var req todoItemAddRequest
	{
		dec := json.NewDecoder(r.Body)
		dec.DisallowUnknownFields()
		if err := dec.Decode(&req); err != nil {
			http.Error(w, "Invalid fields", http.StatusBadRequest)
			return
		}
	}

	//
	// TODO: Make this add an item to the TODO list
	//

	// note(jae): 2022-12-07
	// FYI, it's bad practice security wise to reflect a users data back at them
	message := fmt.Sprintf("not yet implemented but got title: %v and description: %v", req.Title, req.Description)
	http.Error(w, message, http.StatusNotImplemented)
}
