package main

import (
	"fmt"
	"log"

	"github.com/pocketbase/pocketbase/core"
)

// OrgMode represents organization operation mode
type OrgMode string

const (
	OrgModeOperations OrgMode = "operations"
	OrgModeProduct    OrgMode = "product"
)

// getModeFromOrg extracts the mode from an organization record,
// defaulting to operations mode if not set.
func getModeFromOrg(org *core.Record) OrgMode {
	mode := org.GetString("mode")
	if mode == "" {
		log.Printf("Warning: organization %s has no mode set, defaulting to operations", org.Id)
		return OrgModeOperations
	}
	return OrgMode(mode)
}

// ResolveOrgModeFromProject traverses the relation chain to find the org mode.
//
// Relation chain: project -> organization -> mode
func ResolveOrgModeFromProject(app core.App, project *core.Record) (OrgMode, error) {
	// Get the organization associated with the project
	orgID := project.GetString("organization")
	if orgID == "" {
		return "", fmt.Errorf("project missing organization reference")
	}

	org, err := app.FindRecordById("organizations", orgID)
	if err != nil {
		return "", fmt.Errorf("failed to fetch organization: %w", err)
	}

	return getModeFromOrg(org), nil
}

// ResolveOrgModeFromTask traverses the relation chain to find the org mode.
//
// Relation chain: task -> project -> organization -> mode
func ResolveOrgModeFromTask(app core.App, task *core.Record) (OrgMode, error) {
	// Get the project associated with the task
	projectID := task.GetString("project")
	if projectID == "" {
		return "", fmt.Errorf("task missing project reference")
	}

	project, err := app.FindRecordById("projects", projectID)
	if err != nil {
		return "", fmt.Errorf("failed to fetch project: %w", err)
	}

	return ResolveOrgModeFromProject(app, project)
}

// ResolveOrgModeFromTimeEntry traverses the relation chain to find the org mode.
//
// Relation chain: time_entries -> task -> project -> organization -> mode
//
// This allows us to enforce mode-based restrictions at the API level
// without requiring the client to know about organizational modes.
func ResolveOrgModeFromTimeEntry(app core.App, timeEntry *core.Record) (OrgMode, error) {
	// Get the task associated with this time entry
	taskID := timeEntry.GetString("task")
	if taskID == "" {
		return "", fmt.Errorf("time entry missing task reference")
	}

	task, err := app.FindRecordById("tasks", taskID)
	if err != nil {
		return "", fmt.Errorf("failed to fetch task: %w", err)
	}

	return ResolveOrgModeFromTask(app, task)
}
