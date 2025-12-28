// Package hooks provides PocketBase lifecycle event handlers for the Anjam application.
package hooks

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"anjam/config"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

// HandleTaskCreation handles task creation events.
// It auto-generates task display IDs, ensures defaults, and validates tags.
// This handler runs before record creation (OnRecordCreateExecute).
func HandleTaskCreation(e *core.RecordEvent) error {
	log.Printf("Task creation attempt by user %s for project %s", e.Record.GetString("creator"), e.Record.GetString("project"))
	if err := setTaskDisplayID(e); err != nil {
		log.Printf("Error setting task display ID: %v", err)
		return err
	}
	setTaskDefaults(e)
	setTaskStatusRef(e)

	// Validate that all tags belong to the same organization as the project
	if err := validateTaskTags(e); err != nil {
		log.Printf("Error validating task tags: %v", err)
		return err
	}

	log.Printf("Task creation successful, display_id: %s", e.Record.GetString("display_id"))
	return e.Next()
}

// setTaskDisplayID generates and sets the display ID for a task.
// The format is {PROJECT_CODE}-{NUMBER} (e.g., "ABC-001").
func setTaskDisplayID(e *core.RecordEvent) error {
	if e.Record.GetString("display_id") != "" {
		return nil
	}

	projectId := e.Record.GetString("project")
	project, err := e.App.FindRecordById(config.CollectionProjects, projectId)
	if err != nil {
		log.Printf("Error fetching project %q for task creation: %v", projectId, err)
		return err
	}
	projectCode := project.GetString("code")

	newTaskNumber, err := getNextTaskNumber(e.App, projectId)
	if err != nil {
		log.Printf("Error getting next task number for project %q: %v", projectId, err)
		return err
	}

	displayID := fmt.Sprintf("%s-%03d", projectCode, newTaskNumber)
	e.Record.Set("display_id", displayID)
	log.Printf("Generated task display_id %q for project %q.", displayID, projectCode)
	return nil
}

// getNextTaskNumber retrieves the next sequential task number for a project.
func getNextTaskNumber(app core.App, projectId string) (int, error) {
	var lastTask struct {
		DisplayID string `db:"display_id"`
	}
	err := app.RecordQuery("tasks").
		Select("display_id").
		Where(dbx.HashExp{"project": projectId}).
		OrderBy("display_id DESC").
		Limit(1).
		One(&lastTask)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 1, nil // No tasks exist yet
		}
		return 0, err
	}

	parts := strings.Split(lastTask.DisplayID, "-")
	if len(parts) != 2 {
		return 0, fmt.Errorf("invalid display_id format %q: expected format 'CODE-NUMBER'", lastTask.DisplayID)
	}

	lastNum, parseErr := strconv.Atoi(parts[1])
	if parseErr != nil {
		return 0, fmt.Errorf("invalid task number in display_id %q: %w", lastTask.DisplayID, parseErr)
	}

	return lastNum + 1, nil
}

// setTaskDefaults sets default values for task fields.
func setTaskDefaults(e *core.RecordEvent) {
	// Set default status
	if e.Record.GetString("status") == "" {
		e.Record.Set("status", config.TaskStatusTodo)
	}
	if e.Record.GetString("priority") == "" {
		e.Record.Set("priority", config.PriorityMedium)
	}
}

// validateTaskTags validates that all task tags belong to the same organization as the project.
func validateTaskTags(e *core.RecordEvent) error {
	projectId := e.Record.GetString("project")
	if projectId == "" {
		return nil // No project, skip validation
	}

	// Get project to find its organization
	project, err := e.App.FindRecordById(config.CollectionProjects, projectId)
	if err != nil {
		return fmt.Errorf("failed to find project: %w", err)
	}

	projectOrgId := project.GetString("organization")
	if projectOrgId == "" {
		return nil // Project has no organization, skip validation
	}

	// Get tags from the task
	tagIds := e.Record.GetStringSlice("tags")
	if len(tagIds) == 0 {
		return nil // No tags, nothing to validate
	}

	// Check each tag belongs to the same organization
	for _, tagId := range tagIds {
		tag, err := e.App.FindRecordById(config.CollectionTags, tagId)
		if err != nil {
			return fmt.Errorf("failed to find tag %s: %w", tagId, err)
		}

		tagOrgId := tag.GetString("organization")
		if tagOrgId != projectOrgId {
			return errors.New(config.ErrTagsMustBeInSameOrganization)
		}
	}

	return nil
}

// setTaskStatusRef sets the status_ref field based on the task's project and status key.
func setTaskStatusRef(e *core.RecordEvent) {
	projectID := resolveTaskProjectID(e)
	statusKey := e.Record.GetString("status")
	if projectID == "" || statusKey == "" {
		return
	}

	record, err := resolveProjectStatus(e.App, projectID, statusKey)
	if err != nil {
		log.Printf("Warning: failed to resolve project status ref for task %s: %v", e.Record.Id, err)
		return
	}

	e.Record.Set("status_ref", record.Id)
	e.Record.Set("updated", time.Now().Format(time.RFC3339))
}

// resolveTaskProjectID returns current project ID from the record or its original state.
func resolveTaskProjectID(e *core.RecordEvent) string {
	projectID := e.Record.GetString("project")
	if projectID != "" {
		return projectID
	}

	if original := e.Record.Original(); original != nil {
		return original.GetString("project")
	}

	return ""
}

// resolveProjectStatus returns matching project_status record for a project and key.
func resolveProjectStatus(app core.App, projectID, key string) (*core.Record, error) {
	if projectID == "" || key == "" {
		return nil, fmt.Errorf("projectID or status key missing")
	}

	record, err := app.FindFirstRecordByFilter(
		"project_statuses",
		"project = {:project} && key = {:key}",
		map[string]any{"project": projectID, "key": key},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch status: %w", err)
	}
	if record == nil {
		return nil, fmt.Errorf("status %q not found for project %s", key, projectID)
	}

	return record, nil
}
