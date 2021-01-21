package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/rs/cors"

	"github.com/shteou/testiculate/cmd/testiculate/controllers"
	"github.com/shteou/testiculate/cmd/testiculate/models"
)

func main() {
	db, err := gorm.Open(sqlite.Open("gorm.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Unable ")
	}

	autoMigrate(db)

	log.Println("Listening on port 8080...")
	router := makeRouter(&controllers.Context{DB: db})
	http.Handle("/", router)
	srv := &http.Server{
		Handler:      handlers.CompressHandler(corsHeaders().Handler(router)),
		Addr:         "0.0.0.0:8080",
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}
	log.Fatal(srv.ListenAndServe())
}

func autoMigrate(db *gorm.DB) {
	db.AutoMigrate(&models.Service{})
	db.AutoMigrate(&models.Result{})
	db.AutoMigrate(&models.TestExecution{})
}

func corsHeaders() *cors.Cors {
	return cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET"},
	})
}

func setHeader(header, value string, handle http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		w.Header().Set(header, value)
		handle.ServeHTTP(w, req)
	})
}

func makeRouter(context *controllers.Context) *mux.Router {
	r := mux.NewRouter()
	r.Handle("/status", handlers.LoggingHandler(os.Stdout, http.HandlerFunc(controllers.StatusHandler)))
	r.Handle("/services", handlers.LoggingHandler(os.Stdout, http.HandlerFunc(context.ServicesGetHandler)))
	r.Handle("/executions/{service}", handlers.LoggingHandler(os.Stdout, http.HandlerFunc(context.ExecutionServiceGetHandler))).
		Methods("GET")
	r.Handle("/tests/{service}", handlers.LoggingHandler(os.Stdout, http.HandlerFunc(context.TestServiceGetHandler))).
		Methods("GET")
	r.Handle("/tests/{service}/{pr}", handlers.LoggingHandler(os.Stdout, http.HandlerFunc(context.TestPrGetHandler))).
		Methods("GET")
	r.Handle("/tests/{service}/{pr}/{build}", handlers.LoggingHandler(os.Stdout, http.HandlerFunc(context.TestBuildGetHandler))).
		Methods("GET")
	r.Handle("/tests/{service}/{pr}/{build}", handlers.LoggingHandler(os.Stdout, http.HandlerFunc(context.TestsHandler))).
		Methods("PUT")
	r.PathPrefix("/static/js/").Handler(
		http.StripPrefix("/static/js/", setHeader("Content-Type", "application/javascript", http.FileServer(http.Dir("./static/js/")))))
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("./static/"))))
	r.PathPrefix("/").Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/index.html")
	}))

	return r
}
