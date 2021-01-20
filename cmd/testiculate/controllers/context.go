package controllers

import "gorm.io/gorm"

// Context a context for all API handlers
type Context struct {
	DB *gorm.DB
}
