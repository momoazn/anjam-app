package main

import (
	"errors"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"

	"anjam/config"
)

// batchUpdateTasksRequest represents the request body for batch task updates
type batchUpdateTasksRequest struct {
	TaskIDs []string               `json:"task_ids"`
	Updates map[string]interface{} `json:"updates"`
}

// Maximum number of tasks that can be updated in a single batch operation
const maxBatchSize = 100

// Fields that cannot be updated via batch operations
var protectedBatchFields = map[string]bool{
	"id":          true,
	"created":     true,
	"created_by":  true,
	"updated":     true,
	"updated_by":  true,
	"display_id":  true,
	"task_number": true,
	"deleted":     true,
	"deleted_by":  true,
	"deleted_at":  true,
}

// registerBatchEndpoints exposes bulk operations with permission checks.
func registerBatchEndpoints(app *pocketbase.PocketBase) {
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.POST("/api/v1/tasks/batch-update", handleBatchUpdateTasks)

		return se.Next()
	})
}

// handleBatchUpdateTasks performs batch updates on multiple tasks with permission checks
func handleBatchUpdateTasks(e *core.RequestEvent) error {
	if e.Auth == nil {
		return e.UnauthorizedError("Authentication required", nil)
	}

	var body batchUpdateTasksRequest
	if err := e.BindBody(&body); err != nil {
		return e.BadRequestError("Invalid request body", err)
	}

	if len(body.TaskIDs) == 0 {
		return e.BadRequestError("task_ids is required", nil)
	}

	if len(body.Updates) == 0 {
		return e.BadRequestError("updates is required", nil)
	}

	// Enforce maximum batch size
	if len(body.TaskIDs) > maxBatchSize {
		return e.BadRequestError("Too many tasks in batch update", nil)
	}

	// Validate that no protected fields are being updated
	for key := range body.Updates {
		if protectedBatchFields[key] {
			return e.BadRequestError("Cannot update protected field: "+key, nil)
		}
	}

	collection, err := e.App.FindCollectionByNameOrId(config.CollectionTasks)
	if err != nil {
		return e.InternalServerError("Tasks collection not found", err)
	}

	requestInfo, err := e.RequestInfo()
	if err != nil {
		return e.InternalServerError("Failed to resolve request info", err)
	}

	updated := 0
	failed := 0
	var lastErr error

	for _, taskID := range body.TaskIDs {
		record, err := e.App.FindRecordById(config.CollectionTasks, taskID)
		if err != nil {
			failed++
			continue
		}

		rule := collection.UpdateRule
		if rule == nil {
			return e.ForbiddenError("Updates are disabled", nil)
		}

		canAccess, _ := e.App.CanAccessRecord(record, requestInfo, rule)
		if !canAccess {
			failed++
			continue
		}

		for key, value := range body.Updates {
			record.Set(key, value)
		}

		// Re-evaluate permissions after applying changes to prevent bypass via updates
		canAccessUpdated, _ := e.App.CanAccessRecord(record, requestInfo, rule)
		if !canAccessUpdated {
			failed++
			continue
		}

		if err := e.App.Save(record); err != nil {
			failed++
			lastErr = err
			continue
		}
		updated++
	}

	if updated == 0 {
		return e.BadRequestError("No tasks updated", errors.New("no tasks with permission to update"))
	}

	response := map[string]any{
		"updated": updated,
		"failed":  failed,
	}
	if lastErr != nil {
		response["error"] = lastErr.Error()
	}

	return e.JSON(200, response)
}
