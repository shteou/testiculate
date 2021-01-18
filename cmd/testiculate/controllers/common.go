package controllers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"gorm.io/gorm"
)

func errorResponse(w http.ResponseWriter, r *http.Request, err error) {
	w.WriteHeader(http.StatusInternalServerError)
	json.NewEncoder(w).Encode(map[string]string{"error_string": err.Error()})
}

// Returns true if an error occurred
func handleDatabaseQueryError(res *gorm.DB, w http.ResponseWriter, r *http.Request) bool {
	if res.Error != nil {
		if errors.Is(res.Error, gorm.ErrRecordNotFound) {
			w.WriteHeader(http.StatusNotFound)
		} else {
			errorResponse(w, r, res.Error)
		}
		return true
	}
	return false
}

func handleDatabaseCreateError(res *gorm.DB, w http.ResponseWriter, r *http.Request, record string) bool {
	if res.Error != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": fmt.Sprintf("Failed to write %s record", record)})
		return true
	}
	return false
}
