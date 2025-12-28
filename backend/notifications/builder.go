// Package notifications provides notification creation and management for the Anjam application.
package notifications

import (
	"fmt"

	"github.com/pocketbase/pocketbase/core"
	"anjam/config"
)

// Builder provides a fluent interface for creating notifications.
type Builder struct {
	app              core.App
	userID           string
	notificationType string
	title            string
	message          string
	data             map[string]interface{}
}

// New creates a new notification builder.
func New(app core.App) *Builder {
	return &Builder{app: app}
}

// User sets the user for the notification.
func (b *Builder) User(userID string) *Builder {
	b.userID = userID
	return b
}

// Type sets the type of the notification.
func (b *Builder) Type(notificationType string) *Builder {
	b.notificationType = notificationType
	return b
}

// Title sets the title of the notification.
func (b *Builder) Title(title string) *Builder {
	b.title = title
	return b
}

// Message sets the message of the notification.
func (b *Builder) Message(message string) *Builder {
	b.message = message
	return b
}

// Data sets the data of the notification.
func (b *Builder) Data(data map[string]interface{}) *Builder {
	b.data = data
	return b
}

// Send creates and saves the notification.
func (b *Builder) Send() error {
	return createNotification(b.app, b.userID, b.notificationType, b.title, b.message, b.data)
}

// createNotification creates a notification record in the database.
func createNotification(app core.App, userId, notificationType, title, message string, data map[string]interface{}) error {
	// Validate that the user exists before creating notification
	if userId == "" {
		return fmt.Errorf("cannot create notification: empty user ID")
	}

	notificationsCollection, err := app.FindCollectionByNameOrId(config.CollectionNotifications)
	if err != nil {
		return fmt.Errorf("cannot create notification: notifications collection not found: %w", err)
	}

	record := core.NewRecord(notificationsCollection)
	record.Set("user", userId)
	record.Set("type", notificationType)
	record.Set("title", title)
	record.Set("message", message)
	if data != nil {
		record.Set("data", data)
	}

	if err := app.Save(record); err != nil {
		return fmt.Errorf("cannot create notification for user %s: %w", userId, err)
	}

	return nil
}
