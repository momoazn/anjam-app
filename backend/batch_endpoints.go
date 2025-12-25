package main

import (
	"errors"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

type batchUpdateTasksRequest struct {
	TaskIDs []string               `json:"task_ids"`
	Updates map[string]interface{} `json:"updates"`
}

// registerBatchEndpoints exposes bulk operations with permission checks.
func registerBatchEndpoints(app *pocketbase.PocketBase) {
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.POST("/api/v1/tasks/batch-update", func(e *core.RequestEvent) error {
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

			collection, err := e.App.FindCollectionByNameOrId(CollectionTasks)
			if err != nil {
				return e.InternalServerError("Tasks collection not found", err)
			}

			requestInfo, err := e.RequestInfo()
			if err != nil {
				return e.InternalServerError("Failed to resolve request info", err)
			}

			updated := 0
			for _, taskID := range body.TaskIDs {
				record, err := e.App.FindRecordById(CollectionTasks, taskID)
				if err != nil {
					continue
				}

				rule := collection.UpdateRule
				if rule == nil {
					return e.ForbiddenError("Updates are disabled", nil)
				}

				canAccess, _ := e.App.CanAccessRecord(record, requestInfo, rule)
				if !canAccess {
					return e.ForbiddenError("Not allowed to update one or more tasks", nil)
				}

				for key, value := range body.Updates {
					record.Set(key, value)
				}

				if err := e.App.Save(record); err != nil {
					return e.InternalServerError("Failed to update tasks", err)
				}
				updated++
			}

			if updated == 0 {
				return e.BadRequestError("No tasks updated", errors.New("no tasks updated"))
			}

			return e.JSON(200, map[string]any{
				"updated": updated,
			})
		})

		return se.Next()
	})
}
