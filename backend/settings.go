package main

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/pocketbase/pocketbase/core"
)

// Production settings configuration
// These settings are applied on every server start, overriding any dashboard changes.
// This ensures consistent, version-controlled configuration across deployments.

// applyProductionSettings is the OnServe handler that applies production settings.
func applyProductionSettings(e *core.ServeEvent) error {
	if err := configureProductionSettings(e.App); err != nil {
		log.Printf("Warning: failed to apply production settings: %v", err)
		// Don't fail startup, just log the warning
	}
	return e.Next()
}

// configureProductionSettings applies production-ready settings from environment variables.
// Called during OnServe to ensure settings are applied after bootstrap.
func configureProductionSettings(app core.App) error {
	settings := app.Settings()

	// Configure trusted proxy headers for reverse proxy setups
	configureTrustedProxy(settings)

	// Configure rate limiting
	configureRateLimiting(settings)

	// Configure SMTP if environment variables are set
	configureSMTP(settings)

	// Configure logging
	configureLogging(settings)

	// Configure batch operations
	configureBatch(settings)

	// Save settings
	if err := app.Save(settings); err != nil {
		return err
	}

	log.Println("Production settings applied successfully")
	return nil
}

// configureTrustedProxy sets up trusted proxy headers for accurate client IP detection.
// Required when running behind nginx, Caddy, or other reverse proxies.
func configureTrustedProxy(settings *core.Settings) {
	// Default trusted headers for reverse proxy setups
	headers := getEnvOrDefault("PB_TRUSTED_PROXY_HEADERS", "X-Forwarded-For,X-Real-IP")
	if headers != "" {
		settings.TrustedProxy.Headers = strings.Split(headers, ",")
		for i, h := range settings.TrustedProxy.Headers {
			settings.TrustedProxy.Headers[i] = strings.TrimSpace(h)
		}
	}

	// Use leftmost IP (first in X-Forwarded-For chain) - safer default
	settings.TrustedProxy.UseLeftmostIP = getEnvBool("PB_TRUSTED_PROXY_USE_LEFTMOST", true)

	log.Printf("Trusted proxy headers: %v (leftmost: %v)",
		settings.TrustedProxy.Headers, settings.TrustedProxy.UseLeftmostIP)
}

// configureRateLimiting enables and configures the built-in rate limiter.
// Protects against brute force attacks and API abuse.
func configureRateLimiting(settings *core.Settings) {
	enabled := getEnvBool("PB_RATE_LIMIT_ENABLED", true)
	settings.RateLimits.Enabled = enabled

	if !enabled {
		log.Println("Rate limiting: disabled")
		return
	}

	// Configure default rate limit rules if not already set
	// These are sensible defaults that can be customized via dashboard if needed
	if len(settings.RateLimits.Rules) == 0 {
		settings.RateLimits.Rules = []core.RateLimitRule{
			{
				Label:       "*:auth",
				MaxRequests: 10,
				Duration:    60, // 10 requests per minute for auth endpoints
			},
			{
				Label:       "*:create",
				MaxRequests: 30,
				Duration:    60, // 30 creates per minute
			},
			{
				Label:       "/api/*",
				MaxRequests: 100,
				Duration:    60, // 100 requests per minute for general API
			},
		}
		log.Println("Rate limiting: enabled with default rules")
	} else {
		log.Println("Rate limiting: enabled (using existing rules)")
	}
}

// configureSMTP sets up email sending via SMTP server.
// Required for password resets, MFA codes, and notifications.
func configureSMTP(settings *core.Settings) {
	host := os.Getenv("SMTP_HOST")
	if host == "" {
		log.Println("SMTP: not configured (SMTP_HOST not set)")
		return
	}

	settings.SMTP.Enabled = true
	settings.SMTP.Host = host
	settings.SMTP.Port = getEnvInt("SMTP_PORT", 587)
	settings.SMTP.Username = os.Getenv("SMTP_USERNAME")
	settings.SMTP.Password = os.Getenv("SMTP_PASSWORD")
	settings.SMTP.TLS = getEnvBool("SMTP_TLS", true)
	settings.SMTP.AuthMethod = getEnvOrDefault("SMTP_AUTH_METHOD", "PLAIN")
	settings.SMTP.LocalName = os.Getenv("SMTP_LOCAL_NAME")

	// Configure sender info
	if senderName := os.Getenv("SMTP_SENDER_NAME"); senderName != "" {
		settings.Meta.SenderName = senderName
	}
	if senderAddress := os.Getenv("SMTP_SENDER_ADDRESS"); senderAddress != "" {
		settings.Meta.SenderAddress = senderAddress
	}

	log.Printf("SMTP: configured (%s:%d)", settings.SMTP.Host, settings.SMTP.Port)
}

// configureLogging sets up log retention and levels.
func configureLogging(settings *core.Settings) {
	// Log retention in days (0 = disabled)
	settings.Logs.MaxDays = getEnvInt("PB_LOGS_MAX_DAYS", 30)

	// Minimum log level: -4=DEBUG, 0=INFO, 4=WARN, 8=ERROR
	settings.Logs.MinLevel = getEnvInt("PB_LOGS_MIN_LEVEL", 0)

	// Log client IP addresses (useful for debugging, consider privacy implications)
	settings.Logs.LogIP = getEnvBool("PB_LOGS_LOG_IP", true)

	// Log authenticated user IDs
	settings.Logs.LogAuthId = getEnvBool("PB_LOGS_LOG_AUTH_ID", true)

	log.Printf("Logging: %d days retention, level %d", settings.Logs.MaxDays, settings.Logs.MinLevel)
}

// configureBatch configures batch API operations.
func configureBatch(settings *core.Settings) {
	settings.Batch.Enabled = getEnvBool("PB_BATCH_ENABLED", true)
	settings.Batch.MaxRequests = getEnvInt("PB_BATCH_MAX_REQUESTS", 50)
	settings.Batch.Timeout = int64(getEnvInt("PB_BATCH_TIMEOUT", 30))
	settings.Batch.MaxBodySize = int64(getEnvInt("PB_BATCH_MAX_BODY_SIZE", 5*1024*1024)) // 5MB default
}

// Helper functions for environment variable parsing

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return strings.EqualFold(value, "true") || value == "1"
}

func getEnvInt(key string, defaultValue int) int {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	if i, err := strconv.Atoi(value); err == nil {
		return i
	}
	return defaultValue
}
