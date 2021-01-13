package controllers

import (
	"encoding/json"
	"net/http"
)

func errorResponse(w http.ResponseWriter, r *http.Request, err error) {
	w.WriteHeader(http.StatusInternalServerError)
	json.NewEncoder(w).Encode(map[string]string{"error_string": err.Error()})
}
