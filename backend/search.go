package main

import (
	"log"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	"anjam/config"
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
			"meta": map[string]interface{}{
				"total_results": 0,
			},
		})
	}

	// --- Search Tasks ---
	taskFilter := "title ~ {:q} || display_id ~ {:q}"

	tasks, err := e.App.FindRecordsByFilter(
		config.CollectionTasks,
		taskFilter,
		"-created",
		10,
		0,
		dbx.Params{"q": query},
	)
	if err != nil {
		log.Printf("Search tasks error: %v", err)
		tasks = []*core.Record{}
	}

	// Transform tasks to lightweight DTO
	taskDTOs := make([]map[string]interface{}, 0)
	for _, t := range tasks {
		if canViewRecord(e, t) {
			projectName := ""
			projectId := t.GetString("project")
			if projectId != "" {
				project, err := e.App.FindRecordById(config.CollectionProjects, projectId)
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
		config.CollectionProjects,
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

	projectDTOs := make([]map[string]interface{}, 0)
	for _, p := range projects {
		if canViewRecord(e, p) {
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
		"meta": map[string]interface{}{
			"total_results": len(taskDTOs) + len(projectDTOs),
		},
	})
}

// canViewRecord checks if the current user can view the given record
func canViewRecord(e *core.RequestEvent, record *core.Record) bool {
	requestInfo, err := e.RequestInfo()
	if err != nil {
		return false
	}

	rule := record.Collection().ViewRule
	if rule == nil {
		return false
	}

	canAccess, _ := e.App.CanAccessRecord(record, requestInfo, rule)
	return canAccess
}
