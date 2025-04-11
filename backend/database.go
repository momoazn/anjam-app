package main

import (
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func initDatabase() *gorm.DB {
	db, err := gorm.Open(sqlite.Open("gorm.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	db.AutoMigrate(&User{}, &Project{}, &Task{}, &Comment{})

	return db
}

type User struct {
	gorm.Model
	Username string `json:"username"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type Project struct {
	gorm.Model
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type Task struct {
	gorm.Model
	ID             int       `json:"id"`
	Title          string    `json:"title"`
	Description    string    `json:"description"`
	AssignedUserID int       `json:"assignedUserId"`
	Department     string    `json:"department"`
	Priority       string    `json:"priority"`
	Status         string    `json:"status"`
	Deadline       string    `json:"deadline"`
	CreatedAt      string    `json:"createdAt"`
	UpdatedAt      string    `json:"updatedAt"`
	Tags           []string  `json:"tags"`
	Comments       []Comment `json:"comments"`
	ProjectID      int       `json:"projectId"`
}

type Comment struct {
	ID        int    `json:"id"`
	UserID    int    `json:"userId"`
	Content   string `json:"content"`
	CreatedAt string `json:"createdAt"`
}
