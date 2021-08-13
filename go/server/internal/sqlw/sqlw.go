// sqlw is our wrapper package around our chosen SQL driver
//
// note(jae); 2021-08-13
// we do this so that if we want to migrate to an alternate driver or library implementation
// we can easily add top-level functions to ease in the migration process.
//
// the reason I have this is because I played around with using "github.com/jackc/pgx" but found
// it to be inflexible. Migrating away even with a small codebase took too many changes.
package sqlw

import (
	"github.com/jmoiron/sqlx"

	_ "github.com/lib/pq"
)

// DB is our wrapper around the database driver
type DB struct {
	*sqlx.DB
}

// Connect to a database and verify with a ping.
func Connect(driverName, dataSourceName string) (*DB, error) {
	// note(jae): 2021-08-13
	// sqlx handles connection *and* pinging. We may need to do the Ping step ourselves
	// if we switch to a library that doesn't do this for us
	dbDriver, err := sqlx.Connect(driverName, dataSourceName)
	if err != nil {
		return nil, err
	}
	db := &DB{
		DB: dbDriver,
	}
	return db, nil
}
