// Package handlers provides HTTP request handlers for the Anjam API.
package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"anjam/config"
)

// PaginationParams holds pagination parameters
type PaginationParams struct {
	Page    int
	PerPage int
}

// parsePagination extracts pagination parameters from request query.
// Returns default values if not provided or invalid.
func parsePagination(r *http.Request) PaginationParams {
	return ParsePagination(r)
}

// ParsePagination extracts pagination parameters from request query.
// Returns default values if not provided or invalid.
func ParsePagination(r *http.Request) PaginationParams {
	page := 1
	perPage := config.DefaultPageSize

	if pageStr := r.URL.Query().Get("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if perPageStr := r.URL.Query().Get("perPage"); perPageStr != "" {
		if pp, err := strconv.Atoi(perPageStr); err == nil && pp > 0 {
			if pp > config.MaxPageSize {
				perPage = config.MaxPageSize
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

// ExtractIPAddress extracts the client IP address from the request.
// It checks X-Forwarded-For, X-Real-IP, and finally RemoteAddr.
func ExtractIPAddress(r *http.Request) string {
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

// ValidateAuth is a helper that validates authentication for API handlers.
// Returns the authenticated user record or an error response.
func ValidateAuth(e *core.RequestEvent) (*core.Record, error) {
	requestInfo, err := e.RequestInfo()
	if err != nil {
		return nil, e.BadRequestError("Invalid request", err)
	}
	authRecord := requestInfo.Auth
	if authRecord == nil {
		return nil, e.JSON(401, map[string]string{"error": config.ErrAuthRequired})
	}
	return authRecord, nil
}

// requireAdmin validates that the authenticated user is an admin.
// Returns the user record and error if validation fails.
func requireAdmin(e *core.RequestEvent) (*core.Record, error) {
	return RequireAdmin(e)
}

// RequireAdmin validates that the authenticated user is an admin.
// Returns the user record and error if validation fails.
func RequireAdmin(e *core.RequestEvent) (*core.Record, error) {
	authRecord, err := ValidateAuth(e)
	if err != nil {
		return nil, err
	}

	if authRecord.GetString("role") != config.RoleAdmin {
		return nil, apis.NewForbiddenError(config.ErrOnlyAdmin, nil)
	}

	return authRecord, nil
}

// requireRole validates that the authenticated user has one of the specified roles.
// Returns the user record and error if validation fails.
func requireRole(e *core.RequestEvent, roles ...string) (*core.Record, error) {
	return RequireRole(e, roles...)
}

// RequireRole validates that the authenticated user has one of the specified roles.
// Returns the user record and error if validation fails.
func RequireRole(e *core.RequestEvent, roles ...string) (*core.Record, error) {
	authRecord, err := ValidateAuth(e)
	if err != nil {
		return nil, err
	}

	userRole := authRecord.GetString("role")
	for _, role := range roles {
		if userRole == role {
			return authRecord, nil
		}
	}

	return nil, apis.NewForbiddenError("دسترسی محدود شده", nil)
}
