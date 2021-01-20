package models

import (
	"gorm.io/gorm"
)

// Result an aggregate result, mapping to the ingested JUnit test suite(s)
type Result struct {
	gorm.Model
	Service   Service `json:"-"`
	ServiceID uint    `gorm:"index:buildComposite,unique"`
	PR        int     `gorm:"index:buildComposite,unique"`
	Build     int     `gorm:"index:buildComposite,unique"`
	Passed    int
	Failed    int
	Skipped   int
	Errored   int
}
