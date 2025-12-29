package emails

import (
	"fmt"
	"net/mail"
	"strings"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/mailer"
)

// Send sends an email using PocketBase's configured mail client (SMTP or sendmail).
//
// It fills the From field from PocketBase settings (Meta.SenderName/SenderAddress)
// if missing.
func Send(app core.App, msg *mailer.Message) error {
	if msg == nil {
		return fmt.Errorf("emails: missing message")
	}

	normalizeFrom(app, msg)
	if msg.From.Address == "" {
		return fmt.Errorf("emails: missing From address (configure SMTP_SENDER_ADDRESS or set Message.From)")
	}

	if len(msg.To) == 0 {
		return fmt.Errorf("emails: missing recipient")
	}

	return app.NewMailClient().Send(msg)
}

func normalizeFrom(app core.App, msg *mailer.Message) {
	if msg.From.Address != "" {
		return
	}

	settings := app.Settings()
	if settings == nil {
		return
	}

	name := strings.TrimSpace(settings.Meta.SenderName)
	address := strings.TrimSpace(settings.Meta.SenderAddress)
	if address == "" {
		return
	}

	msg.From = mail.Address{
		Name:    name,
		Address: address,
	}
}
