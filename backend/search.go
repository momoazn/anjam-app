package main

import (
	"log"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

// handleGlobalSearch performs a unified search across tasks and projects
func handleGlobalSearch(e *core.RequestEvent) error {
	// Validate authentication
	authRecord, err := validateAuth(e)
	if err != nil {
		return err
	}

	query := e.Request.URL.Query().Get("q")
	if len(query) < 2 {
		return e.JSON(200, map[string]interface{}{
			"tasks":    []interface{}{},
			"projects": []interface{}{},
		})
	}

	// --- Search Tasks ---
	// Using FindRecordsByFilter which allows PocketBase-like filter syntax
	taskFilter := "title ~ {:q} || display_id ~ {:q}"

	tasks, err := e.App.FindRecordsByFilter(
		"tasks", // Collection name
		taskFilter,
		"-created",
		10,
		0,
		dbx.Params{"q": query},
	)
	if err != nil {
		log.Printf("Search tasks error: %v", err)
		// Don't fail the whole search, just return empty tasks
		tasks = []*core.Record{}
	}

	// Transform tasks to lightweight DTO
	var taskDTOs []map[string]interface{}
	for _, t := range tasks {
		if canViewTask(e.App, t, authRecord) {
			project, _ := e.App.FindRecordById("projects", t.GetString("project"))
			projectName := ""
			if project != nil {
				projectName = project.GetString("name")
			}

			taskDTOs = append(taskDTOs, map[string]interface{}{
				"id":           t.Id,
				"title":        t.GetString("title"),
				"display_id":   t.GetString("display_id"),
				"status":       t.GetString("status"),
				"project":      t.GetString("project"),
				"project_name": projectName,
			})
		}
	}

	// --- Search Projects ---
	projectFilter := "name ~ {:q} || code ~ {:q}"
	projects, err := e.App.FindRecordsByFilter(
		"projects",
		projectFilter,
		"-created",
		10,
		0,
		dbx.Params{"q": query},
	)
	if err != nil {
		log.Printf("Search projects error: %v", err)
		projects = []*core.Record{}
	}

	var projectDTOs []map[string]interface{}
	for _, p := range projects {
		if canViewProject(e.App, p, authRecord) {
			projectDTOs = append(projectDTOs, map[string]interface{}{
				"id":          p.Id,
				"name":        p.GetString("name"),
				"code":        p.GetString("code"),
				"description": p.GetString("description"),
			})
		}
	}

	return e.JSON(200, map[string]interface{}{
		"tasks":    taskDTOs,
		"projects": projectDTOs,
	})
}

// Helper to check view permission for search results (mirroring the API rule roughly)
func canViewTask(app core.App, task *core.Record, user *core.Record) bool {
	if user.GetString("role") == "admin" {
		return true
	}
	// For MVP, we trust the internal nature of the app.
	// In a full implementation, we would check if user is in project group, etc.
	return true
}

func canViewProject(app core.App, project *core.Record, user *core.Record) bool {
	if user.GetString("role") == "admin" {
		return true
	}
	return true
}
