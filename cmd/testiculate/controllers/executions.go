package controllers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/shteou/testiculate/cmd/testiculate/models"
)

// ExecutionServiceGetHandler fetches the last 30 days of individual test executions
//   Request -> Response<[]Execution>
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

	if handleDatabaseQueryError(res, w, r) {
		return
	}

	var results []models.TestExecution
	lastMonth := time.Now().Add(-time.Hour * 24 * 30)
	res = c.DB.Where("service_id = ? AND created_at >= ?", service.ID, lastMonth).Find(&results)
	if handleDatabaseQueryError(res, w, r) {
		return
	}

	json.NewEncoder(w).Encode(results)
}
