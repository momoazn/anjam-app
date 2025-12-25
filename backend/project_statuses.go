package main

import (
	"fmt"
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
	if e.Record.GetString("status_ref") != "" {
		return
	}

	projectID := e.Record.GetString("project")
	statusKey := e.Record.GetString("status")
	if projectID == "" || statusKey == "" {
		return
	}

	record, err := e.App.FindFirstRecordByFilter(
		"project_statuses",
		"project = {:project} && key = {:key}",
		map[string]any{"project": projectID, "key": statusKey},
	)
	if err != nil || record == nil {
		return
	}

	e.Record.Set("status_ref", record.Id)
	e.Record.Set("updated", time.Now().Format(time.RFC3339))
}
