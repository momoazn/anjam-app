package main

import (
	"log"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	"anjam/handlers"
)

// handleGlobalSearch performs a unified search across tasks and projects
func handleGlobalSearch(e *core.RequestEvent) error {
	// Validate authentication
	_, err := handlers.ValidateAuth(e)
	if err != nil {
		return err
	}

	query := e.Request.URL.Query().Get("q")
	if len(query) < 2 {
		return e.JSON(200, map[string]interface{}{
			"data": map[string]interface{}{
				"tasks":    []interface{}{},
				"projects": []interface{}{},
			},
			"meta": map[string]interface{}{},
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
		if canViewTask(e, t) {
			projectName := ""
			projectId := t.GetString("project")
			if projectId != "" {
				project, err := e.App.FindRecordById("projects", projectId)
				if err != nil {
					log.Printf("Warning: failed to fetch project %s for task %s: %v", projectId, t.Id, err)
				} else if project != nil {
					projectName = project.GetString("name")
				}
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
		if canViewProject(e, p) {
			projectDTOs = append(projectDTOs, map[string]interface{}{
				"id":          p.Id,
				"name":        p.GetString("name"),
				"code":        p.GetString("code"),
				"description": p.GetString("description"),
			})
		}
	}

	return e.JSON(200, map[string]interface{}{
		"data": map[string]interface{}{
			"tasks":    taskDTOs,
			"projects": projectDTOs,
		},
		"meta": map[string]interface{}{},
	})
}

// Helper to check view permission for search results (mirroring the API rule roughly)
func canViewTask(e *core.RequestEvent, task *core.Record) bool {
	requestInfo, err := e.RequestInfo()
	if err != nil {
		return false
	}

	rule := task.Collection().ViewRule
	if rule == nil {
		return false
	}

	canAccess, _ := e.App.CanAccessRecord(task, requestInfo, rule)
	return canAccess
}

func canViewProject(e *core.RequestEvent, project *core.Record) bool {
	requestInfo, err := e.RequestInfo()
	if err != nil {
		return false
	}

	rule := project.Collection().ViewRule
	if rule == nil {
		return false
	}

	canAccess, _ := e.App.CanAccessRecord(project, requestInfo, rule)
	return canAccess
}
