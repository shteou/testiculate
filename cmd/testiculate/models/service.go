package models

import "gorm.io/gorm"

// Service a record indicating a service / repository or other identifier for tests
type Service struct {
	gorm.Model
	Name string `gorm:"index,unique"`
}
