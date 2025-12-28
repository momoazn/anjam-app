package main

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/router"
	"anjam/config"
	"anjam/handlers"
)

func TestExtractIPAddress(t *testing.T) {
	t.Run("x-forwarded-for", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "http://example.com", nil)
		req.Header.Set("X-Forwarded-For", "1.1.1.1, 2.2.2.2")

		got := handlers.ExtractIPAddress(req)
		if got != "1.1.1.1" {
			t.Fatalf("expected 1.1.1.1, got %q", got)
		}
	})

	t.Run("x-real-ip", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "http://example.com", nil)
		req.Header.Set("X-Real-IP", "3.3.3.3")

		got := handlers.ExtractIPAddress(req)
		if got != "3.3.3.3" {
			t.Fatalf("expected 3.3.3.3, got %q", got)
		}
	})

	t.Run("remote-addr", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "http://example.com", nil)
		req.RemoteAddr = "4.4.4.4:1234"

		got := handlers.ExtractIPAddress(req)
		if got != "4.4.4.4" {
			t.Fatalf("expected 4.4.4.4, got %q", got)
		}
	})
}

func TestParsePagination(t *testing.T) {
	t.Run("defaults", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "http://example.com", nil)
		got := handlers.ParsePagination(req)
		if got.Page != 1 || got.PerPage != config.DefaultPageSize {
			t.Fatalf("expected page=1 perPage=%d, got page=%d perPage=%d", config.DefaultPageSize, got.Page, got.PerPage)
		}
	})

	t.Run("caps-perPage", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "http://example.com?page=2&perPage=9999", nil)
		got := handlers.ParsePagination(req)
		if got.Page != 2 || got.PerPage != config.MaxPageSize {
			t.Fatalf("expected page=2 perPage=%d, got page=%d perPage=%d", config.MaxPageSize, got.Page, got.PerPage)
		}
	})
}

func TestRequireAdminAndRole(t *testing.T) {
	usersCol := core.NewCollection(core.CollectionTypeAuth, "users")

	makeEvent := func(auth *core.Record) *core.RequestEvent {
		req := httptest.NewRequest(http.MethodGet, "http://example.com", nil)
		rec := httptest.NewRecorder()
		return &core.RequestEvent{
			Auth: auth,
			Event: router.Event{
				Request:  req,
				Response: rec,
			},
		}
	}

	t.Run("requireAdmin denies non-admin", func(t *testing.T) {
		u := core.NewRecord(usersCol)
		u.Set("role", config.RoleEmployee)

		_, err := handlers.RequireAdmin(makeEvent(u))
		if err == nil {
			t.Fatal("expected error, got nil")
		}
	})

	t.Run("requireAdmin allows admin", func(t *testing.T) {
		u := core.NewRecord(usersCol)
		u.Set("role", config.RoleAdmin)

		_, err := handlers.RequireAdmin(makeEvent(u))
		if err != nil {
			t.Fatalf("expected nil error, got %v", err)
		}
	})

	t.Run("requireRole allows one of roles", func(t *testing.T) {
		u := core.NewRecord(usersCol)
		u.Set("role", config.RoleSupervisor)

		_, err := handlers.RequireRole(makeEvent(u), config.RoleAdmin, config.RoleSupervisor)
		if err != nil {
			t.Fatalf("expected nil error, got %v", err)
		}
	})
}
