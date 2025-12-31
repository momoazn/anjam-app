package main

import (
	"fmt"

	"anjam/helpers"

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

/**
 * Product mode statuses (simpler set for startups)
 *
 * Linear-inspired: Backlog, Todo, In Progress, Done, Canceled
 * Cleaner workflow for product teams
 */
var productModeStatuses = []defaultProjectStatus{
	{Key: "pending", Name: "Backlog", Color: "slate", Order: 1},
	{Key: "todo", Name: "Todo", Color: "blue", Order: 2, IsDefault: true},
	{Key: "in_progress", Name: "In Progress", Color: "purple", Order: 3},
	{Key: "done", Name: "Done", Color: "green", Order: 4, IsDone: true},
	{Key: "canceled", Name: "Canceled", Color: "gray", Order: 5, IsDone: true},
}

/**
 * Operations mode statuses (comprehensive set for HR)
 *
 * Full workflow: Todo, In Progress, Review, Testing, Pending, Blocked, On Hold, Done, Canceled
 * Supports detailed tracking for operations/HR teams
 */
var operationsModeStatuses = []defaultProjectStatus{
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

	// Resolve organization mode for this project
	project, err := app.FindRecordById("projects", projectID)
	if err != nil {
		return fmt.Errorf("failed to fetch project: %w", err)
	}

	orgID := project.GetString("organization")
	if orgID == "" {
		return fmt.Errorf("project missing organization reference")
	}

	org, err := app.FindRecordById("organizations", orgID)
	if err != nil {
		return fmt.Errorf("failed to fetch organization: %w", err)
	}

	// Select status set based on mode
	mode := org.GetString("mode")
	var statuses []defaultProjectStatus
	if mode == "product" {
		statuses = productModeStatuses
	} else {
		statuses = operationsModeStatuses
	}

	for _, status := range statuses {
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
	helpers.SetTaskStatusRef(e)
}

func validateTaskStatusTransition(e *core.RecordEvent) error {
	return helpers.ValidateTaskStatusTransition(e)
}
