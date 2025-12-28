package main

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"sync"
	"time"

	"github.com/pocketbase/pocketbase/core"
)

// AuditWorker handles asynchronous audit logging with batching and fallback
type AuditWorker struct {
	queue    chan AuditEntry
	done     chan struct{}
	wg       sync.WaitGroup
	app      core.App
	fallback *os.File // Fallback file for when DB writes fail
}

// NewAuditWorker creates a new audit worker with the specified queue size
func NewAuditWorker(app core.App) *AuditWorker {
	w := &AuditWorker{
		queue: make(chan AuditEntry, 1000),
		done:  make(chan struct{}),
		app:   app,
	}

	// Open fallback file for failed writes (compliance requirement)
	f, err := os.OpenFile("audit_fallback.jsonl", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err == nil {
		w.fallback = f
		log.Println("Audit fallback file opened: audit_fallback.jsonl")
	} else {
		log.Printf("Warning: could not open audit fallback file: %v", err)
	}

	return w
}

// Start begins the audit worker goroutine
func (w *AuditWorker) Start(ctx context.Context) {
	w.wg.Add(1)
	go w.run(ctx)
}

// run is the main worker loop
func (w *AuditWorker) run(ctx context.Context) {
	defer w.wg.Done()

	batch := make([]AuditEntry, 0, 10)
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			// Graceful shutdown: flush remaining entries
			if len(batch) > 0 {
				w.flushBatch(batch)
			}
			// Drain remaining queue entries
			for {
				select {
				case entry := <-w.queue:
					batch = append(batch, entry)
					if len(batch) >= 10 {
						w.flushBatch(batch)
						batch = batch[:0]
					}
				default:
					if len(batch) > 0 {
						w.flushBatch(batch)
					}
					return
				}
			}
		case entry := <-w.queue:
			batch = append(batch, entry)
			if len(batch) >= 10 {
				w.flushBatch(batch)
				batch = batch[:0]
			}
		case <-ticker.C:
			if len(batch) > 0 {
				w.flushBatch(batch)
				batch = batch[:0]
			}
		}
	}
}

// flushBatch writes a batch of audit entries to the database
func (w *AuditWorker) flushBatch(batch []AuditEntry) {
	if len(batch) == 0 {
		return
	}

	err := w.writeToDB(batch)
	if err != nil && w.fallback != nil {
		// Fallback to file-based logging for compliance
		for _, entry := range batch {
			data, marshalErr := json.Marshal(entry)
			if marshalErr != nil {
				log.Printf("Error marshaling audit entry: %v", marshalErr)
				continue
			}
			if _, writeErr := w.fallback.Write(append(data, '\n')); writeErr != nil {
				log.Printf("Error writing to audit fallback file: %v", writeErr)
			}
		}
		log.Printf("Audit DB write failed, wrote %d entries to fallback file: %v", len(batch), err)
	}
}

// writeToDB writes a batch of audit entries to the database
func (w *AuditWorker) writeToDB(batch []AuditEntry) error {
	for _, entry := range batch {
		logAudit(w.app, entry)
	}
	return nil
}

// Shutdown gracefully shuts down the audit worker
func (w *AuditWorker) Shutdown() {
	close(w.done)
	w.wg.Wait()

	if w.fallback != nil {
		if err := w.fallback.Close(); err != nil {
			log.Printf("Error closing audit fallback file: %v", err)
		}
	}
}

// Log queues an audit entry for asynchronous processing
func (w *AuditWorker) Log(entry AuditEntry) {
	select {
	case w.queue <- entry:
	default:
		// Queue full: write directly to fallback file (never drop for compliance)
		if w.fallback != nil {
			data, err := json.Marshal(entry)
			if err != nil {
				log.Printf("Error marshaling audit entry: %v", err)
				return
			}
			if _, err := w.fallback.Write(append(data, '\n')); err != nil {
				log.Printf("Error writing to audit fallback file: %v", err)
			} else {
				log.Printf("Audit queue full, wrote to fallback: %v", entry.Action)
			}
		} else {
			log.Printf("Audit queue full and no fallback file available, dropping: %v", entry.Action)
		}
	}
}

// Global audit worker instance
var globalAuditWorker *AuditWorker

// initAuditWorker initializes the global audit worker
func initAuditWorker(app core.App) {
	globalAuditWorker = NewAuditWorker(app)
	ctx := context.Background()
	globalAuditWorker.Start(ctx)
	log.Println("Async audit worker started")
}

// shutdownAuditWorker gracefully shuts down the global audit worker
func shutdownAuditWorker() {
	if globalAuditWorker != nil {
		globalAuditWorker.Shutdown()
		log.Println("Async audit worker shut down")
	}
}

// logAuditAsync queues an audit log entry for asynchronous processing.
// This is the new async version that replaces the synchronous logAudit.
func logAuditAsync(app core.App, entry AuditEntry) {
	if globalAuditWorker != nil {
		globalAuditWorker.Log(entry)
	} else {
		// Fallback to synchronous logging if worker not initialized
		logAudit(app, entry)
	}
}
