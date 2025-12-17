package main

// contextKey defines keys used for request metadata in context.Context.
type contextKey string

const (
	contextKeyRequestID contextKey = "request_id"
	contextKeyIPAddress contextKey = "ip_address"
	contextKeyClient    contextKey = "client"

	contextKeyActorID   contextKey = "actor_id"
	contextKeyActorRole contextKey = "actor_role"
	contextKeyActorType contextKey = "actor_type"
)
