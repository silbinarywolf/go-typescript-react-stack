package configuration

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
)

type Config struct {
	WebServer     WebServerConfig
	Database      DatabaseConfig
	DataDirectory string
}

type WebServerConfig struct {
	Port int
	CORS struct {
		AllowedOrigins []string
	}
}

type DatabaseConfig struct {
	URL string
}

func LoadConfig() (*Config, error) {
	filename := "config.json"
	b, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, fmt.Errorf("unable to load %s: %w", filename, err)
	}
	config := new(Config)
	d := json.NewDecoder(bytes.NewReader(b))
	d.DisallowUnknownFields()
	if err := d.Decode(config); err != nil {
		return nil, fmt.Errorf("unable to decode %s: %w", filename, err)
	}
	// Set default values if they aren't set
	if config.DataDirectory == "" {
		config.DataDirectory = "./data"
	}
	if config.WebServer.Port == 0 {
		config.WebServer.Port = 8080
	}
	// Validate
	if err := validateConfig(*config); err != nil {
		return nil, err
	}
	return config, nil
}

type configErrorList struct {
	errors []error
}

// compile-time assert that configErrorList{} implements "error" interface
var _ error = configErrorList{}

func (errList configErrorList) Error() string {
	var s string = "configuration error(s):"
	for _, err := range errList.errors {
		s += "\n- " + err.Error()
	}
	return s
}

func validateConfig(config Config) error {
	var errorList configErrorList
	if config.DataDirectory == "" {
		errorList.errors = append(errorList.errors, errors.New("DataDirectory cannot be empty"))
	}
	if config.WebServer.Port == 0 {
		errorList.errors = append(errorList.errors, errors.New("WebServer.Port cannot be 0"))
	}
	if config.Database.URL == "" {
		errorList.errors = append(errorList.errors, errors.New("Database.URL cannot be empty"))
	}
	// note(jae): 2021-07-17
	// keeping this here as an example of doing deeper config validation
	//if dir := config.DataDirectory; dir != "" {
	//if _, err := os.Stat(dir); os.IsNotExist(err) {
	//	errorList.errors = append(errorList.errors, errors.New("DataDirectory does not exist: "+dir))
	//}
	//}
	if len(errorList.errors) > 0 {
		return errorList
	}
	return nil
}
