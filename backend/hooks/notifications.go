// Package hooks provides PocketBase lifecycle event handlers for the Anjam application.
package hooks

import (
	"fmt"
	"log"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	"anjam/config"
	"anjam/notifications"
)

// HandleTaskAssignmentNotification notifies the assigned user when a task is created.
// This handler runs after successful record creation (OnRecordAfterCreateSuccess).
func HandleTaskAssignmentNotification(e *core.RecordEvent) error {
	assigneeId := e.Record.GetString("assignee")
	if assigneeId == "" {
		return e.Next() // No assignee, skip notification
	}

	// Don't notify if the assignee is the same as the creator/updater
	if e.Record.GetString("creator") == assigneeId {
		return e.Next()
	}

	taskTitle := e.Record.GetString("title")
	projectId := e.Record.GetString("project")

	project, err := e.App.FindRecordById(config.CollectionProjects, projectId)
	if err != nil {
		log.Printf("Error fetching project for notification: %v", err)
		return e.Next()
	}

	projectName := project.GetString("name")

	return notifications.New(e.App).
		User(assigneeId).
		Type("task_assigned").
		Title(fmt.Sprintf(config.MsgTaskAssigned, taskTitle)).
		Message(fmt.Sprintf(config.MsgTaskAssignedDesc, taskTitle, projectName)).
		Data(map[string]interface{}{
			"taskId":    e.Record.Id,
			"projectId": projectId,
		}).
		Send()
}

// HandleTaskUpdateNotification notifies the assignee when task status changes.
// This handler runs after successful record update (OnRecordAfterUpdateSuccess).
func HandleTaskUpdateNotification(e *core.RecordEvent) error {
	// Only notify on status changes or important updates
	oldStatus := e.Record.Original().GetString("status")
	newStatus := e.Record.GetString("status")

	if oldStatus == newStatus {
		return e.Next()
	}

	assigneeId := e.Record.GetString("assignee")
	if assigneeId == "" {
		return e.Next()
	}

	taskTitle := e.Record.GetString("title")

	return notifications.New(e.App).
		User(assigneeId).
		Type("task_assigned").
		Title(fmt.Sprintf(config.MsgTaskUpdated, taskTitle)).
		Message(fmt.Sprintf(config.MsgTaskStatusChanged, taskTitle, translateStatus(oldStatus), translateStatus(newStatus))).
		Data(map[string]interface{}{
			"taskId": e.Record.Id,
		}).
		Send()
}

// HandleProjectUpdateNotification notifies project members when the project is updated.
// This handler runs after successful record update (OnRecordAfterUpdateSuccess).
func HandleProjectUpdateNotification(e *core.RecordEvent) error {
	projectName := e.Record.GetString("name")

	// Get all users in this project
	var projectUsers []struct {
		UserId string `db:"user"`
	}
	err := e.App.DB().NewQuery(`
		SELECT user FROM project_members WHERE project = {:projectId}
	`).Bind(dbx.Params{"projectId": e.Record.Id}).All(&projectUsers)

	if err != nil {
		log.Printf("Error fetching project users for notification: %v", err)
		return e.Next()
	}

	// Create notifications for all project members
	for _, pu := range projectUsers {
		if pu.UserId == e.Record.GetString("updated_by") {
			continue // Don't notify the updater
		}

		err := notifications.New(e.App).
			User(pu.UserId).
			Type("project_updated").
			Title(fmt.Sprintf(config.MsgProjectUpdated, projectName)).
			Message(fmt.Sprintf(config.MsgProjectUpdatedDesc, projectName)).
			Data(map[string]interface{}{
				"projectId": e.Record.Id,
			}).
			Send()
		if err != nil {
			// Log the error but don't fail the parent operation
			log.Printf("Warning: failed to create project update notification for user %s: %v", pu.UserId, err)
		}
	}

	return e.Next()
}

// HandleCommentNotification notifies the task assignee when a new comment is added.
// This handler runs after successful record creation (OnRecordAfterCreateSuccess).
func HandleCommentNotification(e *core.RecordEvent) error {
	commentText := e.Record.GetString("content")
	if commentText == "" {
		return e.Next()
	}

	taskId := e.Record.GetString("task")
	if taskId == "" {
		return e.Next()
	}

	// Get task details
	task, err := e.App.FindRecordById(config.CollectionTasks, taskId)
	if err != nil {
		log.Printf("Error fetching task for comment notification: %v", err)
		return e.Next()
	}

	taskTitle := task.GetString("title")
	assigneeId := task.GetString("assignee")

	if assigneeId == "" || assigneeId == e.Record.GetString("created_by") {
		return e.Next() // No assignee or self-comment
	}

	return notifications.New(e.App).
		User(assigneeId).
		Type("comment").
		Title(fmt.Sprintf(config.MsgNewComment, taskTitle)).
		Message(fmt.Sprintf(config.MsgNewCommentDesc, taskTitle, truncateString(commentText, 100))).
		Data(map[string]interface{}{
			"taskId":    taskId,
			"commentId": e.Record.Id,
		}).
		Send()
}

// translateStatus translates English status to Persian.
func translateStatus(status string) string {
	switch status {
	case config.TaskStatusTodo:
		return config.StatusTodo
	case config.TaskStatusInProgress:
		return config.StatusInProgress
	case config.TaskStatusDone:
		return config.StatusDone
	case config.TaskStatusCanceled:
		return config.StatusCanceled
	default:
		return status
	}
}

// truncateString truncates a string to a maximum length.
func truncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen-3] + "..."
}
