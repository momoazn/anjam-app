package main

import (
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/pocketbase/pocketbase/core"
)

type defaultProjectStatus struct {
	Key       string
	Name      string
	Color     string
	Order     int
	IsDefault bool
	IsDone    bool
}

var defaultProjectStatuses = []defaultProjectStatus{
	{Key: "todo", Name: "Todo", Color: "slate", Order: 1, IsDefault: true},
	{Key: "in_progress", Name: "In Progress", Color: "blue", Order: 2},
	{Key: "review", Name: "Review", Color: "purple", Order: 3},
	{Key: "testing", Name: "Testing", Color: "amber", Order: 4},
	{Key: "pending", Name: "Pending", Color: "cyan", Order: 5},
	{Key: "blocked", Name: "Blocked", Color: "orange", Order: 6},
	{Key: "on_hold", Name: "On Hold", Color: "gray", Order: 7},
	{Key: "done", Name: "Done", Color: "green", Order: 8, IsDone: true},
	{Key: "canceled", Name: "Canceled", Color: "gray", Order: 9, IsDone: true},
}

func ensureDefaultProjectStatuses(app core.App, projectID string) error {
	collection, err := app.FindCollectionByNameOrId("project_statuses")
	if err != nil {
		return err
	}

	for _, status := range defaultProjectStatuses {
		existing, _ := app.FindFirstRecordByFilter(
			"project_statuses",
			"project = {:project} && key = {:key}",
			map[string]any{"project": projectID, "key": status.Key},
		)
		if existing != nil {
			continue
		}

		record := core.NewRecord(collection)
		record.Set("project", projectID)
		record.Set("key", status.Key)
		record.Set("name", status.Name)
		record.Set("color", status.Color)
		record.Set("order", status.Order)
		record.Set("is_default", status.IsDefault)
		record.Set("is_done", status.IsDone)

		if err := app.Save(record); err != nil {
			return fmt.Errorf("failed to create default status %s: %w", status.Key, err)
		}
	}

	return nil
}

func handleProjectCreatedStatuses(e *core.RecordEvent) error {
	projectID := e.Record.Id
	if projectID == "" {
		return e.Next()
	}

	if err := ensureDefaultProjectStatuses(e.App, projectID); err != nil {
		return err
	}

	return e.Next()
}

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

// resolveTaskProjectID returns the current project ID from the record or its original state.
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

// resolveProjectStatus returns the matching project_status record for a project and key.
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

func validateTaskStatusTransition(e *core.RecordEvent) error {
	statusKey := e.Record.GetString("status")
	if statusKey == "" {
		return nil
	}

	projectID := resolveTaskProjectID(e)
	if projectID == "" {
		return nil
	}

	newStatus, err := resolveProjectStatus(e.App, projectID, statusKey)
	if err != nil {
		return errors.New(ErrInvalidTaskStatus)
	}

	if original := e.Record.Original(); original != nil {
		oldStatus := original.GetString("status")
		if oldStatus != "" && oldStatus != statusKey {
			oldStatusRecord, err := resolveProjectStatus(e.App, projectID, oldStatus)
			if err == nil && isStatusMarkedDone(oldStatusRecord) && !isStatusMarkedDone(newStatus) {
				return errors.New(ErrCannotReopenFinalStatus)
			}
		}
	}

	return nil
}

func isStatusMarkedDone(record *core.Record) bool {
	if record == nil {
		return false
	}
	return record.GetBool("is_done")
}
