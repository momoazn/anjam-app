package main

import (
	"database/sql"
	"log"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

// handleTimeEntryCreated synchronizes the parent task's time after a new entry is created.
func handleTimeEntryCreated(e *core.RecordEvent) error {
	syncTaskTime(e.App, e.Record.GetString("task"))
	return e.Next()
}

// handleTimeEntryUpdated synchronizes the parent task's time after an entry is updated.
func handleTimeEntryUpdated(e *core.RecordEvent) error {
	syncTaskTime(e.App, e.Record.GetString("task"))
	return e.Next()
}

// handleTimeEntryDeleted synchronizes the parent task's time after an entry is deleted.
func handleTimeEntryDeleted(e *core.RecordEvent) error {
	syncTaskTime(e.App, e.Record.GetString("task"))
	return e.Next()
}

// syncTaskTime recalculates the aggregated minutes for a task based on its time entries.
func syncTaskTime(app core.App, taskID string) {
	if taskID == "" {
		return
	}

	var result struct {
		Total sql.NullInt64 `db:"total"`
	}

	query := `
		SELECT COALESCE(SUM(minutes), 0) AS total
		FROM time_entries
		WHERE task = {:task}
	`
	if err := app.DB().NewQuery(query).Bind(dbx.Params{"task": taskID}).One(&result); err != nil {
		log.Printf("Warning: failed to calculate time entries sum for task %s: %v", taskID, err)
		return
	}

	task, err := app.FindRecordById(CollectionTasks, taskID)
	if err != nil {
		log.Printf("Warning: failed to fetch task %s for time sync: %v", taskID, err)
		return
	}

	minutes := 0
	if result.Total.Valid {
		minutes = int(result.Total.Int64)
	}

	task.Set("time_spent_minutes", minutes)
	if err := app.Save(task); err != nil {
		log.Printf("Warning: failed to update task %s time_spent_minutes: %v", taskID, err)
	}
}
