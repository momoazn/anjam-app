package helpers

import (
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/pocketbase/pocketbase/core"

	"anjam/config"
)

// SetTaskStatusRef sets the status_ref field based on the task's project and status key.
func SetTaskStatusRef(e *core.RecordEvent) {
	projectID := ResolveTaskProjectID(e)
	statusKey := e.Record.GetString("status")
	if projectID == "" || statusKey == "" {
		return
	}

	record, err := ResolveProjectStatus(e.App, projectID, statusKey)
	if err != nil {
		log.Printf("Warning: failed to resolve project status ref for task %s: %v", e.Record.Id, err)
		return
	}

	e.Record.Set("status_ref", record.Id)
	e.Record.Set("updated", time.Now().Format(time.RFC3339))
}

// ResolveTaskProjectID returns current project ID from the record or its original state.
func ResolveTaskProjectID(e *core.RecordEvent) string {
	projectID := e.Record.GetString("project")
	if projectID != "" {
		return projectID
	}

	if original := e.Record.Original(); original != nil {
		return original.GetString("project")
	}

	return ""
}

// ResolveProjectStatus returns matching project_status record for a project and key.
func ResolveProjectStatus(app core.App, projectID, key string) (*core.Record, error) {
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

// ValidateTaskStatusTransition validates that a task status transition is allowed.
// It prevents reopening a task that has been marked as done.
func ValidateTaskStatusTransition(e *core.RecordEvent) error {
	statusKey := e.Record.GetString("status")
	if statusKey == "" {
		return nil
	}

	projectID := ResolveTaskProjectID(e)
	if projectID == "" {
		return nil
	}

	newStatus, err := ResolveProjectStatus(e.App, projectID, statusKey)
	if err != nil {
		return errors.New(config.ErrInvalidTaskStatus)
	}

	if original := e.Record.Original(); original != nil {
		oldStatus := original.GetString("status")
		if oldStatus != "" && oldStatus != statusKey {
			oldStatusRecord, err := ResolveProjectStatus(e.App, projectID, oldStatus)
			if err == nil && isStatusMarkedDone(oldStatusRecord) && !isStatusMarkedDone(newStatus) {
				return errors.New(config.ErrCannotReopenFinalStatus)
			}
		}
	}

	return nil
}

// isStatusMarkedDone checks if a project status is marked as done.
func isStatusMarkedDone(status *core.Record) bool {
	return status.GetBool("is_done")
}
