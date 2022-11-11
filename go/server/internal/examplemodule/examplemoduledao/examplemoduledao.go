package examplemoduledao

// MyDatabaseTable contains fields with `db` tags on their fields
//
// ie. If there's a database column called "id" it'll map to the "ID" struct field
// this is a feature of the SQLX library we use: https://github.com/jmoiron/sqlx
type MyDatabaseTable struct {
	ID   int64  `db:"id"`
	Name string `db:"name"`
}
