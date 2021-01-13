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

	db.AutoMigrate(&models.Result{})

	context := controllers.Context{DB: db}

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET"},
	})

	r := mux.NewRouter()
	r.Handle("/status", handlers.LoggingHandler(os.Stdout, http.HandlerFunc(controllers.StatusHandler)))
	r.Handle("/tests/{service}/{pr}", handlers.LoggingHandler(os.Stdout, http.HandlerFunc(context.TestPrGetHandler))).
		Methods("GET")
	r.Handle("/tests/{service}/{pr}/{build}", handlers.LoggingHandler(os.Stdout, http.HandlerFunc(context.TestBuildGetHandler))).
		Methods("GET")
	r.Handle("/tests/{service}/{pr}/{build}", handlers.LoggingHandler(os.Stdout, http.HandlerFunc(context.TestsHandler))).
		Methods("PUT")
	r.PathPrefix("/").Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/index.html")
	}))
	http.Handle("/", r)

	log.Println("Listening on port 8080...")
	srv := &http.Server{
		Handler:      c.Handler(r),
		Addr:         "0.0.0.0:8080",
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}
	log.Fatal(srv.ListenAndServe())
}
