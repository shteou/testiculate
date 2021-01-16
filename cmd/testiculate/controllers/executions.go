package controllers

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/shteou/testiculate/cmd/testiculate/models"
	"gorm.io/gorm"
)

func (c *Context) ExecutionServiceGetHandler(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)

	serviceName := params["service"]
	if !validateServiceName(serviceName) {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid service name"})
		return
	}

	service := models.Service{Name: serviceName}
	res := c.DB.Where(&service).First(&service)

	if res.Error != nil {
		if errors.Is(res.Error, gorm.ErrRecordNotFound) {
			w.WriteHeader(http.StatusNotFound)
		} else {
			errorResponse(w, r, res.Error)
		}
		return
	}

	var results []models.TestExecution
	lastMonth := time.Now().Add(-time.Hour * 24 * 30)
	tx := c.DB.Where("service_id = ? AND created_at >= ?", service.ID, lastMonth).Find(&results)
	if tx.Error != nil {
		if errors.Is(tx.Error, gorm.ErrRecordNotFound) {
			w.WriteHeader(http.StatusNotFound)
		} else {
			errorResponse(w, r, tx.Error)
		}
		return
	}
	json.NewEncoder(w).Encode(results)
}
