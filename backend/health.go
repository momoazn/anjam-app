// Package main provides health check endpoints for monitoring and orchestration.
package main

import (
	"runtime"
	"time"

	"github.com/pocketbase/pocketbase/core"
)

// Version information - can be set at build time via ldflags
var (
	version   = "dev"
	buildTime = "unknown"
)

// HealthResponse represents the response for /api/health endpoint
type HealthResponse struct {
	Status    string    `json:"status"`
	Version   string    `json:"version"`
	BuildTime string    `json:"build_time"`
	Timestamp time.Time `json:"timestamp"`
	Uptime    string    `json:"uptime"`
}

// ReadinessResponse represents the response for /api/ready endpoint
type ReadinessResponse struct {
	Status string                 `json:"status"`
	Checks map[string]CheckResult `json:"checks"`
}

// CheckResult represents the result of an individual readiness check
type CheckResult struct {
	Status  string `json:"status"`
	Message string `json:"message,omitempty"`
}

var startTime = time.Now()

const memoryWarnThresholdMB uint64 = 500

// registerHealthEndpoints adds health check and readiness endpoints to the application.
// These endpoints are useful for container orchestration (Kubernetes, Docker Swarm)
// and load balancer health checks.
func registerHealthEndpoints(app core.App) {
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// Health check endpoint - always returns 200 if the server is running
		// Used by load balancers for basic liveness checks
		se.Router.GET("/api/status", func(e *core.RequestEvent) error {
			uptime := time.Since(startTime)

			return e.JSON(200, HealthResponse{
				Status:    "healthy",
				Version:   version,
				BuildTime: buildTime,
				Timestamp: time.Now().UTC(),
				Uptime:    uptime.Round(time.Second).String(),
			})
		})

		// Readiness check endpoint - returns 200 only if the application is ready to serve traffic
		// Performs actual checks (database connectivity, etc.)
		se.Router.GET("/api/ready", func(e *core.RequestEvent) error {
			checks := make(map[string]CheckResult)
			allReady := true

			// Check database connectivity
			dbCheck := checkDatabase(e.App)
			checks["database"] = dbCheck
			if dbCheck.Status != "ok" {
				allReady = false
			}

			// Check memory usage (warn if allocated memory exceeds 500MB)
			memCheck := checkMemory()
			checks["memory"] = memCheck
			if memCheck.Status == "error" {
				allReady = false
			}

			status := "ready"
			statusCode := 200
			if !allReady {
				status = "not_ready"
				statusCode = 503
			}

			return e.JSON(statusCode, ReadinessResponse{
				Status: status,
				Checks: checks,
			})
		})

		// Detailed info endpoint for debugging (protected, only in dev mode)
		se.Router.GET("/api/info", func(e *core.RequestEvent) error {
			// Only allow in dev mode
			if !e.App.IsDev() {
				return e.JSON(403, map[string]string{"error": "Not available in production"})
			}

			var memStats runtime.MemStats
			runtime.ReadMemStats(&memStats)

			return e.JSON(200, map[string]any{
				"version":        version,
				"build_time":     buildTime,
				"go_version":     runtime.Version(),
				"os":             runtime.GOOS,
				"arch":           runtime.GOARCH,
				"num_cpu":        runtime.NumCPU(),
				"num_goroutines": runtime.NumGoroutine(),
				"memory": map[string]any{
					"alloc_mb":       memStats.Alloc / 1024 / 1024,
					"total_alloc_mb": memStats.TotalAlloc / 1024 / 1024,
					"sys_mb":         memStats.Sys / 1024 / 1024,
					"num_gc":         memStats.NumGC,
				},
				"uptime": time.Since(startTime).Round(time.Second).String(),
			})
		})

		return se.Next()
	})
}

// checkDatabase verifies database connectivity by running a simple query
func checkDatabase(app core.App) CheckResult {
	// Try to execute a simple query to verify DB is accessible
	_, err := app.DB().NewQuery("SELECT 1").Execute()
	if err != nil {
		return CheckResult{
			Status:  "error",
			Message: "Database connection failed",
		}
	}
	return CheckResult{
		Status: "ok",
	}
}

// checkMemory verifies memory usage is within acceptable limits
func checkMemory() CheckResult {
	var memStats runtime.MemStats
	runtime.ReadMemStats(&memStats)

	// Warn if allocated memory exceeds 500MB
	allocMB := memStats.Alloc / 1024 / 1024
	if allocMB > memoryWarnThresholdMB {
		return CheckResult{
			Status:  "error",
			Message: "High memory usage",
		}
	}

	return CheckResult{
		Status: "ok",
	}
}
