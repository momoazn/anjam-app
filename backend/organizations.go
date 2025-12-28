package main

import (
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/security"
)

// registerOrganizationEndpoints sets up org creation and listing routes.
func registerOrganizationEndpoints(app *pocketbase.PocketBase) {
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.POST("/api/v1/organizations", func(e *core.RequestEvent) error {
			user := e.Auth
			if user == nil {
				return e.UnauthorizedError("Authentication required", nil)
			}

			var body struct {
				Name        string `json:"name"`
				Description string `json:"description"`
			}

			if err := e.BindBody(&body); err != nil {
				return e.BadRequestError("Invalid request body", err)
			}

			name := strings.TrimSpace(body.Name)
			if name == "" {
				return e.BadRequestError("Organization name is required", nil)
			}
			if len(name) > 200 {
				return e.BadRequestError("Organization name too long (max 200 chars)", nil)
			}

			slug := slugify(name)
			for i := 0; i < 5; i++ {
				existingOrg, err := e.App.FindFirstRecordByFilter(
					CollectionOrganizations,
					"slug = {:slug}",
					dbx.Params{"slug": slug},
				)
				if err != nil || existingOrg == nil {
					break
				}
				slug = fmt.Sprintf("%s-%s", slug, generateShortID())
			}

			var newOrg *core.Record
			err := e.App.RunInTransaction(func(txApp core.App) error {
				orgCollection, err := txApp.FindCollectionByNameOrId(CollectionOrganizations)
				if err != nil {
					return err
				}

				newOrg = core.NewRecord(orgCollection)
				newOrg.Set("name", name)
				newOrg.Set("slug", slug)
				newOrg.Set("description", body.Description)
				newOrg.Set("active", true)
				newOrg.Set("plan", "free")

				if err := txApp.Save(newOrg); err != nil {
					return fmt.Errorf("failed to create organization: %w", err)
				}

				memberCollection, err := txApp.FindCollectionByNameOrId(CollectionOrgMembers)
				if err != nil {
					return err
				}

				member := core.NewRecord(memberCollection)
				member.Set("organization", newOrg.Id)
				member.Set("user", user.Id)
				member.Set("role", OrgRoleOwner)
				member.Set("status", MemberStatusActive)
				member.Set("joined_at", time.Now().Format(time.RFC3339))

				if err := txApp.Save(member); err != nil {
					return fmt.Errorf("failed to add owner membership: %w", err)
				}

				return nil
			})

			if err != nil {
				return e.InternalServerError("Failed to create organization", err)
			}

			return e.JSON(201, map[string]any{
				"organization": newOrg,
			})
		})

		se.Router.GET("/api/v1/organizations", func(e *core.RequestEvent) error {
			user := e.Auth
			if user == nil {
				return e.UnauthorizedError("Authentication required", nil)
			}

			memberships, err := e.App.FindRecordsByFilter(
				CollectionOrgMembers,
				"user = {:user} && status = 'active'",
				"-created",
				0,
				0,
				dbx.Params{"user": user.Id},
			)
			if err != nil {
				return e.InternalServerError("Failed to fetch memberships", err)
			}

			type OrgWithRole struct {
				Organization        *core.Record `json:"organization"`
				Role                string       `json:"role"`
				JoinedAt            string       `json:"joined_at"`
				OnboardingCompleted bool         `json:"onboarding_completed"`
			}

			result := make([]OrgWithRole, 0, len(memberships))
			for _, membership := range memberships {
				orgID := membership.GetString("organization")
				org, err := e.App.FindRecordById(CollectionOrganizations, orgID)
				if err != nil {
					continue
				}

				result = append(result, OrgWithRole{
					Organization:        org,
					Role:                membership.GetString("role"),
					JoinedAt:            membership.GetString("joined_at"),
					OnboardingCompleted: membership.GetBool("onboarding_completed"),
				})
			}

			return e.JSON(200, map[string]any{
				"organizations": result,
			})
		})

		return se.Next()
	})
}

func slugify(text string) string {
	slug := strings.ToLower(strings.TrimSpace(text))
	slug = strings.ReplaceAll(slug, " ", "-")

	reg := regexp.MustCompile("[^a-z0-9-]+")
	slug = reg.ReplaceAllString(slug, "")

	reg = regexp.MustCompile("-+")
	slug = reg.ReplaceAllString(slug, "-")

	slug = strings.Trim(slug, "-")

	return slug
}

func generateShortID() string {
	return security.RandomString(6)
}
