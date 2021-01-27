package controllers

import (
	"encoding/json"
	"net/http"
)

// GetStatus an endpoint to be queried to ensure the service is up and running
//   Request -> Response<Status>
func GetStatus(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string]string{"status": "up"})
}
