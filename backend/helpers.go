package main

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/pocketbase/pocketbase/core"
)

// PaginationParams holds pagination parameters
type PaginationParams struct {
	Page    int
	PerPage int
}

// extractIPAddress extracts the client IP address from the request
// It checks X-Forwarded-For, X-Real-IP, and finally RemoteAddr
func extractIPAddress(r *http.Request) string {
	// Check X-Forwarded-For header (commonly used by proxies/load balancers)
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		// X-Forwarded-For can contain multiple IPs separated by commas
		// The first one is usually the original client IP
		ips := strings.Split(xff, ",")
		if len(ips) > 0 {
			return strings.TrimSpace(ips[0])
		}
	}

	// Check X-Real-IP header (alternative proxy header)
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return xri
	}

	// Fall back to RemoteAddr
	// RemoteAddr includes port, so we need to strip it
	host := r.RemoteAddr
	if idx := strings.LastIndex(host, ":"); idx != -1 {
		return host[:idx]
	}
	return host
}

// parsePagination extracts pagination parameters from request query
// Returns default values if not provided or invalid
func parsePagination(r *http.Request) PaginationParams {
	page := 1
	perPage := DefaultPageSize

	if pageStr := r.URL.Query().Get("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if perPageStr := r.URL.Query().Get("perPage"); perPageStr != "" {
		if pp, err := strconv.Atoi(perPageStr); err == nil && pp > 0 {
			if pp > MaxPageSize {
				perPage = MaxPageSize
			} else {
				perPage = pp
			}
		}
	}

	return PaginationParams{
		Page:    page,
		PerPage: perPage,
	}
}

// requireAdmin validates that the authenticated user is an admin
// Returns the user record and error if validation fails
func requireAdmin(e *core.RequestEvent) (*core.Record, error) {
	authRecord, err := validateAuth(e)
	if err != nil {
		return nil, err
	}

	if authRecord.GetString("role") != RoleAdmin {
		return nil, core.NewForbiddenError(ErrOnlyAdmin, nil)
	}

	return authRecord, nil
}

// requireRole validates that the authenticated user has one of the specified roles
// Returns the user record and error if validation fails
func requireRole(e *core.RequestEvent, roles ...string) (*core.Record, error) {
	authRecord, err := validateAuth(e)
	if err != nil {
		return nil, err
	}

	userRole := authRecord.GetString("role")
	for _, role := range roles {
		if userRole == role {
			return authRecord, nil
		}
	}

	return nil, core.NewForbiddenError("دسترسی محدود شده", nil)
}
