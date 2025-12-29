// Package hooks provides PocketBase lifecycle event handlers for the Anjam application.
package hooks

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"time"

	"anjam/config"
	"anjam/notifications"
	"anjam/utils"

	"github.com/pocketbase/pocketbase/core"
)

// HandleProjectCreatedMember automatically adds the project supervisor as a project owner.
// This handler runs after successful record creation (OnRecordAfterCreateSuccess).
func HandleProjectCreatedMember(e *core.RecordEvent) error {
	projectID := e.Record.Id
	supervisorID := e.Record.GetString("supervisor")

	if projectID == "" || supervisorID == "" {
		return e.Next()
	}

	collection, err := e.App.FindCollectionByNameOrId(config.CollectionProjectMembers)
	if err != nil {
		return err
	}

	// Check if already exists
	existing, _ := e.App.FindFirstRecordByFilter(
		config.CollectionProjectMembers,
		"project = {:project} && user = {:user}",
		map[string]any{"project": projectID, "user": supervisorID},
	)
	if existing != nil {
		return e.Next()
	}

	record := core.NewRecord(collection)
	record.Set("project", projectID)
	record.Set("user", supervisorID)
	record.Set("role", config.ProjectRoleOwner)
	record.Set("added_at", time.Now().Format(time.RFC3339))

	if err := e.App.Save(record); err != nil {
		return err
	}

	return e.Next()
}

// HandleProjectCreation generates a unique project code if not already set.
// This handler runs before record creation (OnRecordCreateExecute).
func HandleProjectCreation(e *core.RecordEvent) error {
	if e.Record.GetString("code") != "" {
		return e.Next()
	}

	projectCode, err := generateUniqueProjectCode(e.App)
	if err != nil {
		log.Printf("Error generating unique project code: %v", err)
		return err
	}

	e.Record.Set("code", projectCode)
	return e.Next()
}

// generateUniqueProjectCode generates a unique 3-letter uppercase project code.
// It uses collision detection and retry logic to ensure uniqueness.
func generateUniqueProjectCode(app core.App) (string, error) {
	for attempt := 0; attempt < config.MaxCodeGenerationAttempts; attempt++ {
		projectCode := utils.GenerateRandomCode()

		// Validate format before checking collision
		if len(projectCode) != config.CodeLength {
			return "", fmt.Errorf("generated code has invalid length %d (expected %d)", len(projectCode), config.CodeLength)
		}

		exists, err := app.FindFirstRecordByData(config.CollectionProjects, "code", projectCode)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return "", fmt.Errorf("database error checking code collision for %q: %w", projectCode, err)
		}
		if exists == nil {
			return projectCode, nil
		}
		log.Printf("Project code collision for %q, generating a new one (attempt %d/%d).", projectCode, attempt+1, config.MaxCodeGenerationAttempts)
	}
	return "", fmt.Errorf("failed to generate unique project code after %d attempts (possible collision rate too high)", config.MaxCodeGenerationAttempts)
}

// HandleProjectMembersCreatedNotify notifies users when they are added to a project.
// This handler runs after successful record creation (OnRecordAfterCreateSuccess).
func HandleProjectMembersCreatedNotify(e *core.RecordEvent) error {
	userId := e.Record.GetString("user")
	projectId := e.Record.GetString("project")
	if userId == "" || projectId == "" {
		return e.Next()
	}

	projectName := getProjectName(e.App, projectId)
	return notifications.New(e.App).
		User(userId).
		Type("system").
		Title(fmt.Sprintf(config.MsgAddedToProject, projectName)).
		Message(fmt.Sprintf(config.MsgAddedToProjectDesc, projectName)).
		Data(map[string]interface{}{
			"projectId": projectId,
		}).
		Send()
}

// getProjectName retrieves project name by ID, returns fallback if not found.
func getProjectName(app core.App, projectId string) string {
	project, err := app.FindRecordById(config.CollectionProjects, projectId)
	if err != nil {
		return "project"
	}
	if name := project.GetString("name"); name != "" {
		return name
	}
	return "project"
}
