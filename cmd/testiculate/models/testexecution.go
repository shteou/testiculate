package models

import (
	"gorm.io/gorm"
)

type TestExecution struct {
	gorm.Model
	Service   Service `json:"-"`
	ServiceID uint    `gorm:"index:execuctionComposite"`
	PR        int     `gorm:"index:execuctionComposite"`
	Build     int     `gorm:"index:execuctionComposite"`
	Name      string  `gorm:"index:execuctionComposite"`
	Classname string  `gorm:"index:execuctionComposite"`
	Status    string  `gorm:"index"`
}
