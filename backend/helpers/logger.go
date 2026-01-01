package helpers

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"runtime"
	"strings"
	"time"
)

// LogLevel represents the severity of a log message
type LogLevel int

const (
	DEBUG LogLevel = iota
	INFO
	WARN
	ERROR
)

func (l LogLevel) String() string {
	switch l {
	case DEBUG:
		return "DEBUG"
	case INFO:
		return "INFO"
	case WARN:
		return "WARN"
	case ERROR:
		return "ERROR"
	default:
		return "UNKNOWN"
	}
}

// Logger provides structured logging with log levels
type Logger struct {
	minLevel LogLevel
	useJSON  bool
}

// LogEntry represents a structured log entry
type LogEntry struct {
	Timestamp string                 `json:"timestamp"`
	Level     string                 `json:"level"`
	Message   string                 `json:"message"`
	Source    string                 `json:"source,omitempty"`
	Fields    map[string]interface{} `json:"fields,omitempty"`
}

var defaultLogger *Logger

func init() {
	defaultLogger = NewLogger()
}

// NewLogger creates a new logger instance
// Log level can be set via LOG_LEVEL env var (DEBUG, INFO, WARN, ERROR)
// JSON format can be enabled via LOG_FORMAT=json
func NewLogger() *Logger {
	level := INFO
	levelStr := strings.ToUpper(os.Getenv("LOG_LEVEL"))
	switch levelStr {
	case "DEBUG":
		level = DEBUG
	case "INFO":
		level = INFO
	case "WARN":
		level = WARN
	case "ERROR":
		level = ERROR
	}

	useJSON := strings.ToLower(os.Getenv("LOG_FORMAT")) == "json"

	return &Logger{
		minLevel: level,
		useJSON:  useJSON,
	}
}

// getCallerInfo returns the file and line number of the caller
func getCallerInfo(skip int) string {
	_, file, line, ok := runtime.Caller(skip)
	if !ok {
		return ""
	}
	// Extract just the filename from the full path
	parts := strings.Split(file, "/")
	if len(parts) > 0 {
		file = parts[len(parts)-1]
	}
	return fmt.Sprintf("%s:%d", file, line)
}

// log writes a log entry at the specified level
func (l *Logger) log(level LogLevel, msg string, fields map[string]interface{}) {
	if level < l.minLevel {
		return
	}

	entry := LogEntry{
		Timestamp: time.Now().Format(time.RFC3339),
		Level:     level.String(),
		Message:   msg,
		Source:    getCallerInfo(3),
		Fields:    fields,
	}

	if l.useJSON {
		jsonBytes, err := json.Marshal(entry)
		if err != nil {
			log.Printf("[%s] %s (json marshal error: %v)", level, msg, err)
			return
		}
		log.Println(string(jsonBytes))
	} else {
		if len(fields) > 0 {
			fieldStr := formatFields(fields)
			log.Printf("[%s] %s %s", level, msg, fieldStr)
		} else {
			log.Printf("[%s] %s", level, msg)
		}
	}
}

func formatFields(fields map[string]interface{}) string {
	parts := make([]string, 0, len(fields))
	for k, v := range fields {
		parts = append(parts, fmt.Sprintf("%s=%v", k, v))
	}
	return strings.Join(parts, " ")
}

// Debug logs a debug message
func (l *Logger) Debug(msg string, fields ...map[string]interface{}) {
	var f map[string]interface{}
	if len(fields) > 0 {
		f = fields[0]
	}
	l.log(DEBUG, msg, f)
}

// Info logs an info message
func (l *Logger) Info(msg string, fields ...map[string]interface{}) {
	var f map[string]interface{}
	if len(fields) > 0 {
		f = fields[0]
	}
	l.log(INFO, msg, f)
}

// Warn logs a warning message
func (l *Logger) Warn(msg string, fields ...map[string]interface{}) {
	var f map[string]interface{}
	if len(fields) > 0 {
		f = fields[0]
	}
	l.log(WARN, msg, f)
}

// Error logs an error message
func (l *Logger) Error(msg string, fields ...map[string]interface{}) {
	var f map[string]interface{}
	if len(fields) > 0 {
		f = fields[0]
	}
	l.log(ERROR, msg, f)
}

// WithError adds an error to the fields
func WithError(err error) map[string]interface{} {
	if err == nil {
		return nil
	}
	return map[string]interface{}{"error": err.Error()}
}

// Fields creates a map for structured fields
func Fields(keysAndValues ...interface{}) map[string]interface{} {
	fields := make(map[string]interface{})
	for i := 0; i < len(keysAndValues)-1; i += 2 {
		key, ok := keysAndValues[i].(string)
		if !ok {
			continue
		}
		fields[key] = keysAndValues[i+1]
	}
	return fields
}

// Package-level convenience functions using the default logger

// LogDebug logs a debug message
func LogDebug(msg string, fields ...map[string]interface{}) {
	defaultLogger.Debug(msg, fields...)
}

// LogInfo logs an info message
func LogInfo(msg string, fields ...map[string]interface{}) {
	defaultLogger.Info(msg, fields...)
}

// LogWarn logs a warning message
func LogWarn(msg string, fields ...map[string]interface{}) {
	defaultLogger.Warn(msg, fields...)
}

// LogError logs an error message
func LogError(msg string, fields ...map[string]interface{}) {
	defaultLogger.Error(msg, fields...)
}

// GetLogger returns the default logger instance
func GetLogger() *Logger {
	return defaultLogger
}
