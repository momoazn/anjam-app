// Package hooks provides PocketBase lifecycle event handlers for the Anjam application.
package hooks

import (
	"database/sql"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"sync"

	"anjam/config"
	"anjam/helpers"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

var taskNumberMutex sync.Mutex

// HandleTaskCreation handles task creation events.
// It auto-generates task display IDs, ensures defaults, and validates tags.
// This handler runs before record creation (OnRecordCreateExecute).
func HandleTaskCreation(e *core.RecordEvent) error {
	if err := setTaskDisplayID(e); err != nil {
		return err
	}
	setTaskDefaults(e)
	helpers.SetTaskStatusRef(e)

	// Validate that all tags belong to the same organization as the project
	if err := validateTaskTags(e); err != nil {
		return err
	}

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
		return err
	}
	projectCode := project.GetString("code")

	newTaskNumber, err := getNextTaskNumber(e.App, projectId)
	if err != nil {
		return err
	}

	displayID := fmt.Sprintf("%s-%03d", projectCode, newTaskNumber)
	e.Record.Set("display_id", displayID)
	return nil
}

// getNextTaskNumber retrieves the next sequential task number for a project.
// Note: This function has a potential race condition when tasks are created concurrently.
// TODO: Consider implementing database-level constraint with retry logic for better concurrent safety.
func getNextTaskNumber(app core.App, projectId string) (int, error) {
	taskNumberMutex.Lock()
	defer taskNumberMutex.Unlock()

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
