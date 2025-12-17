package main

// Context keys for request metadata.
//
// Stored on the active `context.Context` (typically derived from `*http.Request.Context()`)
// so it can be accessed from PocketBase record hooks via `e.Context`.
type contextKey string

const (
	contextKeyRequestID contextKey = "request_id"
	contextKeyIPAddress contextKey = "ip_address"
	contextKeyClient    contextKey = "client"

	contextKeyActorID   contextKey = "actor_id"
	contextKeyActorRole contextKey = "actor_role"
	contextKeyActorType contextKey = "actor_type"
)
