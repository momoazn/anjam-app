package main

import (
	"github.com/pocketbase/pocketbase/core"
)

func handleAuditLogEnrich(e *core.RecordEnrichEvent) error {
	if e.RequestInfo == nil || e.RequestInfo.Auth == nil {
		e.Record.Hide("changes")
		return e.Next()
	}

	orgID := e.Record.GetString("organization")
	if orgID == "" {
		e.Record.Hide("changes")
		return e.Next()
	}

	membership, err := e.App.FindFirstRecordByFilter(
		"organization_members",
		"organization = {:org} && user = {:user} && status = 'active'",
		map[string]any{"org": orgID, "user": e.RequestInfo.Auth.Id},
	)
	if err != nil || membership == nil {
		e.Record.Hide("changes")
		return e.Next()
	}

	role := membership.GetString("role")
	if role != OrgRoleOwner && role != OrgRoleAdmin {
		e.Record.Hide("changes")
	}

	return e.Next()
}
