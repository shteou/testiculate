package controllers

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/shteou/testiculate/cmd/testiculate/models"

	"github.com/joshdk/go-junit"
)

func validateServiceName(s string) bool {
	return true
}

func (c *Context) TestServiceGetHandler(w http.ResponseWriter, r *http.Request) {
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

	var results []models.Result
	res = c.DB.Where(&models.Result{ServiceID: service.ID}).Find(&results)
	if handleDatabaseQueryError(res, w, r) {
		return
	}
	json.NewEncoder(w).Encode(results)
}

func (c *Context) TestBuildGetHandler(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)

	serviceName := params["service"]
	if !validateServiceName(serviceName) {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid service name"})
		return
	}

	prNum, err := strconv.Atoi(params["pr"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid PR number"})
		return
	}

	buildNum, err := strconv.Atoi(params["build"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid build number"})
		return
	}

	service := models.Service{Name: serviceName}
	res := c.DB.Where(&service).First(&service)

	if handleDatabaseQueryError(res, w, r) {
		return
	}

	var results []models.Result
	res = c.DB.Where(&models.Result{PR: prNum, Build: buildNum, Service: service}).First(&results)
	if handleDatabaseQueryError(res, w, r) {
		return
	}

	json.NewEncoder(w).Encode(results)
}

func (c *Context) TestPrGetHandler(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)

	serviceName := params["service"]
	if !validateServiceName(serviceName) {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid service name"})
		return
	}

	prNum, err := strconv.Atoi(params["pr"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid PR number"})
		return
	}

	service := models.Service{Name: serviceName}
	res := c.DB.Where(&service).First(&service)

	if handleDatabaseQueryError(res, w, r) {
		return
	}

	var results []models.Result
	res = c.DB.Where(&models.Result{PR: prNum, Service: service}).Find(&results)
	if handleDatabaseQueryError(res, w, r) {
		return
	}

	json.NewEncoder(w).Encode(results)
}

func (c *Context) TestsHandler(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)

	serviceName := params["service"]
	if !validateServiceName(serviceName) {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid service name"})
		return
	}

	prNum, err := strconv.Atoi(params["pr"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid PR number"})
		return
	}

	buildNum, err := strconv.Atoi(params["build"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid build number"})
		return
	}

	defer r.Body.Close()

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to read body"})
		return
	}

	suites, err := junit.Ingest(body)
	if err != nil || len(suites) != 1 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unable to parse XML"})
		return
	}

	suiteTotals := suites[0].Totals
	service := models.Service{Name: serviceName}
	res := c.DB.FirstOrCreate(&service, &service)
	if handleDatabaseCreateError(res, w, r, "service") {
		return
	}

	result := models.Result{Errored: suiteTotals.Error, Skipped: suiteTotals.Skipped,
		Passed: suiteTotals.Passed, Failed: suiteTotals.Failed,
		Service: service, PR: prNum, Build: buildNum}

	res = c.DB.Create(&result)
	if handleDatabaseCreateError(res, w, r, "result") {
		return
	}

	testcases := []models.TestExecution{}

	for i := 0; i < len(suites[0].Tests); i++ {
		test := suites[0].Tests[i]
		testcases = append(testcases, models.TestExecution{Service: service, Status: string(test.Status), PR: prNum, Build: buildNum, Name: test.Name, Classname: test.Classname})
	}

	res = c.DB.CreateInBatches(testcases, 100)
	if handleDatabaseCreateError(res, w, r, "test execution") {
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"stored": strconv.Itoa(len(suites))})
}
