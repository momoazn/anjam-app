package main

import (
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

// registerPermissionsEndpoint exposes the computed permissions for the current context.
func registerPermissionsEndpoint(app *pocketbase.PocketBase) {
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/api/v1/permissions", func(e *core.RequestEvent) error {
			user := e.Auth
			if user == nil {
				return e.UnauthorizedError("Authentication required", nil)
			}

			orgID := e.Request.URL.Query().Get("organization_id")
			projectID := e.Request.URL.Query().Get("project_id")

			if orgID == "" {
				return e.BadRequestError("organization_id is required", nil)
			}

			ctx, err := GetPermissionContext(e.App, user.Id, orgID, projectID)
			if err != nil {
				return e.InternalServerError("Failed to resolve permissions", err)
			}

			return e.JSON(200, map[string]any{
				"user_id":           ctx.UserID,
				"organization_id":   ctx.OrganizationID,
				"organization_role": ctx.OrganizationRole,
				"project_id":        ctx.ProjectID,
				"project_role":      ctx.ProjectRole,
				"is_org_owner":      ctx.IsOrgOwner,
				"is_org_admin":      ctx.IsOrgAdmin,
				"permissions":       ctx.Permissions,
			})
		})

		return se.Next()
	})
}
