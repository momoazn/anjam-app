// Package hooks provides PocketBase lifecycle event handlers for the Anjam application.
package hooks

import (
	"database/sql"
	"errors"
	"fmt"
	"sync"

	"anjam/config"
	"anjam/helpers"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

// projectMutexes provides per-project locking for task number generation.
// This allows concurrent task creation in different projects while ensuring
// sequential number generation within each project.
var (
	projectMutexes     = make(map[string]*sync.Mutex)
	projectMutexesLock sync.Mutex
)

// getProjectMutex returns the mutex for a specific project, creating one if needed.
func getProjectMutex(projectId string) *sync.Mutex {
	projectMutexesLock.Lock()
	defer projectMutexesLock.Unlock()

	if mu, exists := projectMutexes[projectId]; exists {
		return mu
	}

	mu := &sync.Mutex{}
	projectMutexes[projectId] = mu
	return mu
}

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

	displayID := fmt.Sprintf("%s-%06d", projectCode, newTaskNumber)
	e.Record.Set("display_id", displayID)
	e.Record.Set("task_number", newTaskNumber)
	return nil
}

// getNextTaskNumber retrieves the next sequential task number for a project.
// Uses task_number field for ordering, which is an integer and avoids string
// sorting issues (e.g., "ABC-1000" sorting before "ABC-999").
func getNextTaskNumber(app core.App, projectId string) (int, error) {
	// Use per-project mutex to allow concurrent task creation in different projects
	mu := getProjectMutex(projectId)
	mu.Lock()
	defer mu.Unlock()

	var lastTask struct {
		TaskNumber int `db:"task_number"`
	}
	err := app.RecordQuery("tasks").
		Select("task_number").
		Where(dbx.HashExp{"project": projectId}).
		OrderBy("task_number DESC").
		Limit(1).
		One(&lastTask)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 1, nil // No tasks exist yet
		}
		return 0, err
	}

	return lastTask.TaskNumber + 1, nil
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
