package helpers

import (
	"regexp"
	"strings"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/security"

	"anjam/config"
)

// GetProjectName retrieves project name by ID, returns fallback if not found.
func GetProjectName(app core.App, projectId string) string {
	project, err := app.FindRecordById(config.CollectionProjects, projectId)
	if err != nil {
		return "project"
	}
	if name := project.GetString("name"); name != "" {
		return name
	}
	return "project"
}

// Slugify converts text to a URL-safe slug.
func Slugify(text string) string {
	slug := strings.ToLower(strings.TrimSpace(text))
	slug = strings.ReplaceAll(slug, " ", "-")

	reg := regexp.MustCompile("[^a-z0-9-]+")
	slug = reg.ReplaceAllString(slug, "")

	reg = regexp.MustCompile("-+")
	slug = reg.ReplaceAllString(slug, "-")

	slug = strings.Trim(slug, "-")

	return slug
}

// GenerateShortID generates a random short ID for uniqueness.
func GenerateShortID() string {
	return security.RandomString(6)
}

// DeriveUsername creates a username from an email address.
func DeriveUsername(email string) string {
	base := strings.Split(email, "@")[0]
	username := strings.ToLower(base)
	// Replace invalid characters
	username = strings.ReplaceAll(username, ".", "_")
	username = strings.ReplaceAll(username, "+", "_")
	// Ensure minimum length
	if len(username) < 3 {
		username = username + security.RandomString(3-len(username))
	}
	// Truncate if too long
	if len(username) > 50 {
		username = username[:50]
	}
	return username
}
