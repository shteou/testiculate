package controllers

import "gorm.io/gorm"

type Context struct {
	DB *gorm.DB
}
