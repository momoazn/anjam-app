package main

import (
	"fmt"

	"github.com/pocketbase/pocketbase/core"
)

// PermissionContext holds the resolved permissions for a user in a specific context.
type PermissionContext struct {
	UserID    string
	UserEmail string

	OrganizationID   string
	OrganizationRole string
	IsOrgOwner       bool
	IsOrgAdmin       bool
	IsOrgMember      bool

	ProjectID   string
	ProjectRole string

	Permissions map[string]bool
}

// GetPermissionContext resolves all permissions for a user in the given context.
func GetPermissionContext(app core.App, userID, orgID, projectID string) (*PermissionContext, error) {
	ctx := &PermissionContext{
		UserID:         userID,
		OrganizationID: orgID,
		ProjectID:      projectID,
		Permissions:    make(map[string]bool),
	}

	user, err := app.FindRecordById(CollectionUsers, userID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	ctx.UserEmail = user.GetString("email")

	if orgID != "" {
		orgMembership, err := app.FindFirstRecordByFilter(
			CollectionOrgMembers,
			"organization = {:org} && user = {:user} && status = 'active'",
			map[string]any{"org": orgID, "user": userID},
		)

		if err == nil && orgMembership != nil {
			ctx.OrganizationRole = orgMembership.GetString("role")
			ctx.IsOrgOwner = ctx.OrganizationRole == OrgRoleOwner
			ctx.IsOrgAdmin = ctx.OrganizationRole == OrgRoleOwner || ctx.OrganizationRole == OrgRoleAdmin
			ctx.IsOrgMember = true
		}
	}

	if projectID != "" {
		projectMembership, err := app.FindFirstRecordByFilter(
			"project_members",
			"project = {:project} && user = {:user}",
			map[string]any{"project": projectID, "user": userID},
		)

		if err == nil && projectMembership != nil {
			ctx.ProjectRole = projectMembership.GetString("role")
		}
	}

	ctx.computePermissions()

	return ctx, nil
}

func (ctx *PermissionContext) computePermissions() {
	ctx.Permissions["org.view"] = ctx.IsOrgMember
	ctx.Permissions["org.update"] = ctx.IsOrgOwner
	ctx.Permissions["org.delete"] = ctx.IsOrgOwner
	ctx.Permissions["org.manage_billing"] = ctx.IsOrgOwner
	ctx.Permissions["org.manage_members"] = ctx.IsOrgAdmin
	ctx.Permissions["org.invite_members"] = ctx.IsOrgAdmin
	ctx.Permissions["org.create_project"] = ctx.IsOrgAdmin

	if ctx.IsOrgAdmin {
		ctx.Permissions["project.view"] = true
		ctx.Permissions["project.update"] = true
		ctx.Permissions["project.delete"] = ctx.IsOrgOwner
		ctx.Permissions["project.manage_members"] = true
		ctx.Permissions["project.manage_statuses"] = true
		ctx.Permissions["task.view"] = true
		ctx.Permissions["task.create"] = true
		ctx.Permissions["task.update"] = true
		ctx.Permissions["task.delete"] = true
		ctx.Permissions["task.assign"] = true
		ctx.Permissions["comment.create"] = true
		ctx.Permissions["comment.delete_any"] = true
		ctx.Permissions["time_entry.create"] = true
		ctx.Permissions["time_entry.delete_any"] = true
		return
	}

	switch ctx.ProjectRole {
	case ProjectRoleOwner:
		ctx.Permissions["project.view"] = true
		ctx.Permissions["project.update"] = true
		ctx.Permissions["project.delete"] = true
		ctx.Permissions["project.manage_members"] = true
		ctx.Permissions["project.manage_statuses"] = true
		ctx.Permissions["task.view"] = true
		ctx.Permissions["task.create"] = true
		ctx.Permissions["task.update"] = true
		ctx.Permissions["task.delete"] = true
		ctx.Permissions["task.assign"] = true
		ctx.Permissions["comment.create"] = true
		ctx.Permissions["comment.delete_any"] = true
		ctx.Permissions["time_entry.create"] = true
		ctx.Permissions["time_entry.delete_any"] = true

	case ProjectRoleAdmin:
		ctx.Permissions["project.view"] = true
		ctx.Permissions["project.update"] = true
		ctx.Permissions["project.manage_members"] = true
		ctx.Permissions["project.manage_statuses"] = true
		ctx.Permissions["task.view"] = true
		ctx.Permissions["task.create"] = true
		ctx.Permissions["task.update"] = true
		ctx.Permissions["task.delete"] = true
		ctx.Permissions["task.assign"] = true
		ctx.Permissions["comment.create"] = true
		ctx.Permissions["comment.delete_any"] = true
		ctx.Permissions["time_entry.create"] = true
		ctx.Permissions["time_entry.delete_any"] = true

	case ProjectRoleMember:
		ctx.Permissions["project.view"] = true
		ctx.Permissions["task.view"] = true
		ctx.Permissions["task.create"] = true
		ctx.Permissions["task.update_own"] = true
		ctx.Permissions["comment.create"] = true
		ctx.Permissions["comment.delete_own"] = true
		ctx.Permissions["time_entry.create"] = true
		ctx.Permissions["time_entry.delete_own"] = true

	case ProjectRoleViewer:
		ctx.Permissions["project.view"] = true
		ctx.Permissions["task.view"] = true
		ctx.Permissions["comment.view"] = true
	}
}

// Can checks if the context has a specific permission.
func (ctx *PermissionContext) Can(permission string) bool {
	return ctx.Permissions[permission]
}

func (ctx *PermissionContext) CanViewProject() bool {
	return ctx.Can("project.view")
}

func (ctx *PermissionContext) CanManageProject() bool {
	return ctx.Can("project.update")
}

func (ctx *PermissionContext) CanManageProjectMembers() bool {
	return ctx.Can("project.manage_members")
}

func (ctx *PermissionContext) CanCreateTask() bool {
	return ctx.Can("task.create")
}

func (ctx *PermissionContext) CanUpdateTask() bool {
	return ctx.Can("task.update")
}

func (ctx *PermissionContext) CanUpdateOwnTask() bool {
	return ctx.Can("task.update") || ctx.Can("task.update_own")
}

func (ctx *PermissionContext) CanDeleteTask() bool {
	return ctx.Can("task.delete")
}

// GetPermissionContextFromRequest extracts context from request headers.
func GetPermissionContextFromRequest(app core.App, e *core.RequestEvent) (*PermissionContext, error) {
	user := e.Auth
	if user == nil {
		return nil, fmt.Errorf("not authenticated")
	}

	orgID := e.Request.Header.Get("X-Organization-ID")
	if orgID == "" {
		orgID = e.Request.URL.Query().Get("organization_id")
	}

	projectID := e.Request.URL.Query().Get("project_id")

	return GetPermissionContext(app, user.Id, orgID, projectID)
}

// RequirePermission is a middleware that checks for a specific permission.
func RequirePermission(permission string) func(*core.RequestEvent) error {
	return func(e *core.RequestEvent) error {
		ctx, err := GetPermissionContextFromRequest(e.App, e)
		if err != nil {
			return e.UnauthorizedError("Permission check failed", err)
		}

		if !ctx.Can(permission) {
			return e.ForbiddenError(
				fmt.Sprintf("You don't have permission to: %s", permission),
				nil,
			)
		}

		return nil
	}
}
