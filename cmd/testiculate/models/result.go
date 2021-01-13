package models

import "gorm.io/gorm"

type Result struct {
	gorm.Model
	Service string `gorm:"index:buildComposite,unique"`
	PR      int    `gorm:"index:buildComposite,unique"`
	Build   int    `gorm:"index:buildComposite,unique"`
	Passed  int
	Failed  int
	Skipped int
	Errored int
}
