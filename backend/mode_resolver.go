package main

import (
	"fmt"
	"log"

	"github.com/pocketbase/pocketbase/core"
)

// OrgMode represents the organization operation mode
type OrgMode string

const (
	OrgModeOperations OrgMode = "operations"
	OrgModeProduct    OrgMode = "product"
)

// ResolveOrgModeFromTimeEntry traverses the relation chain to find org mode
//
// Relation chain: time_entries -> task -> project -> organization -> mode
//
// This allows us to enforce mode-based restrictions at the API level
// without requiring the client to know about organizational modes.
func ResolveOrgModeFromTimeEntry(app core.App, timeEntry *core.Record) (OrgMode, error) {
	// Step 1: Get the task associated with this time entry
	taskID := timeEntry.GetString("task")
	if taskID == "" {
		return "", fmt.Errorf("time entry missing task reference")
	}

	task, err := app.FindRecordById("tasks", taskID)
	if err != nil {
		return "", fmt.Errorf("failed to fetch task: %w", err)
	}

	// Step 2: Get the project associated with the task
	projectID := task.GetString("project")
	if projectID == "" {
		return "", fmt.Errorf("task missing project reference")
	}

	project, err := app.FindRecordById("projects", projectID)
	if err != nil {
		return "", fmt.Errorf("failed to fetch project: %w", err)
	}

	// Step 3: Get the organization associated with the project
	orgID := project.GetString("organization")
	if orgID == "" {
		return "", fmt.Errorf("project missing organization reference")
	}

	org, err := app.FindRecordById("organizations", orgID)
	if err != nil {
		return "", fmt.Errorf("failed to fetch organization: %w", err)
	}

	// Step 4: Get the mode from the organization
	// Default to operations mode if not set (backward compatibility)
	mode := org.GetString("mode")
	if mode == "" {
		log.Printf("Warning: organization %s has no mode set, defaulting to operations", orgID)
		return OrgModeOperations, nil
	}

	return OrgMode(mode), nil
}

// ResolveOrgModeFromProject traverses the relation chain to find org mode
//
// Relation chain: project -> organization -> mode
func ResolveOrgModeFromProject(app core.App, project *core.Record) (OrgMode, error) {
	// Step 1: Get the organization associated with the project
	orgID := project.GetString("organization")
	if orgID == "" {
		return "", fmt.Errorf("project missing organization reference")
	}

	org, err := app.FindRecordById("organizations", orgID)
	if err != nil {
		return "", fmt.Errorf("failed to fetch organization: %w", err)
	}

	// Step 2: Get the mode from the organization
	// Default to operations mode if not set (backward compatibility)
	mode := org.GetString("mode")
	if mode == "" {
		log.Printf("Warning: organization %s has no mode set, defaulting to operations", orgID)
		return OrgModeOperations, nil
	}

	return OrgMode(mode), nil
}

// ResolveOrgModeFromTask traverses the relation chain to find org mode
//
// Relation chain: task -> project -> organization -> mode
func ResolveOrgModeFromTask(app core.App, task *core.Record) (OrgMode, error) {
	// Step 1: Get the project associated with the task
	projectID := task.GetString("project")
	if projectID == "" {
		return "", fmt.Errorf("task missing project reference")
	}

	project, err := app.FindRecordById("projects", projectID)
	if err != nil {
		return "", fmt.Errorf("failed to fetch project: %w", err)
	}

	// Step 2: Get the organization associated with the project
	orgID := project.GetString("organization")
	if orgID == "" {
		return "", fmt.Errorf("project missing organization reference")
	}

	org, err := app.FindRecordById("organizations", orgID)
	if err != nil {
		return "", fmt.Errorf("failed to fetch organization: %w", err)
	}

	// Step 3: Get the mode from the organization
	// Default to operations mode if not set (backward compatibility)
	mode := org.GetString("mode")
	if mode == "" {
		log.Printf("Warning: organization %s has no mode set, defaulting to operations", orgID)
		return OrgModeOperations, nil
	}

	return OrgMode(mode), nil
}
