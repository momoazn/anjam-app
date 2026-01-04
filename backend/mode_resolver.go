package main

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/pocketbase/pocketbase/core"
)

// OrgMode represents organization operation mode
type OrgMode string

const (
	OrgModeOperations OrgMode = "operations"
	OrgModeProduct    OrgMode = "product"
)

// Build-time mode configuration
// Set via ldflags: go build -ldflags "-X main.organizationMode=product"
var organizationMode = OrgModeProduct // default to product mode

// SetOrganizationMode allows setting the mode at build time via ldflags
func SetOrganizationMode(mode string) {
	mode = strings.TrimSpace(strings.ToLower(mode))
	switch mode {
	case "product":
		organizationMode = OrgModeProduct
	case "operations":
		organizationMode = OrgModeOperations
	default:
		log.Printf("Warning: unknown organization mode '%s', defaulting to 'operations'", mode)
		organizationMode = OrgModeOperations
	}
}

// init reads TM_ORG_MODE environment variable at startup
func init() {
	if mode := os.Getenv("TM_ORG_MODE"); mode != "" {
		SetOrganizationMode(mode)
		log.Printf("Organization mode set to: %s", organizationMode)
	}
}

// GetOrgMode returns the configured organization mode (build-time/environment)
func GetOrgMode() OrgMode {
	return organizationMode
}

// getModeFromOrg extracts the mode from an organization record,
// defaulting to the build-time configured mode if not set.
func getModeFromOrg(org *core.Record) OrgMode {
	mode := org.GetString("mode")
	if mode == "" {
		// Fall back to build-time configured mode
		return GetOrgMode()
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
