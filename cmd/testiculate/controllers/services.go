package controllers

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/shteou/testiculate/cmd/testiculate/models"
	"gorm.io/gorm"
)

// ServicesGetHandler returns a list of all service definitions. The service names are
// used as natural keys for most other endpoints
//   Request -> Response<[]Service>
func (c *Context) ServicesGetHandler(w http.ResponseWriter, r *http.Request) {
	var services []models.Service
	res := c.DB.Find(&services)

	if res.Error != nil {
		if errors.Is(res.Error, gorm.ErrRecordNotFound) {
			json.NewEncoder(w).Encode([]models.Service{})
		} else {
			errorResponse(w, r, res.Error)
			return
		}
	}

	json.NewEncoder(w).Encode(services)
}
