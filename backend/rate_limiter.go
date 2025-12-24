package main

import (
	"net"
	"net/http"
	"sync"
	"time"
)

type rateLimiter struct {
	mu     sync.Mutex
	window time.Duration
	limit  int
	visits map[string][]time.Time
}

func newRateLimiter(limit int, window time.Duration) *rateLimiter {
	return &rateLimiter{
		window: window,
		limit:  limit,
		visits: make(map[string][]time.Time),
	}
}

func (rl *rateLimiter) allow(ip string) bool {
	now := time.Now()
	cutoff := now.Add(-rl.window)

	rl.mu.Lock()
	defer rl.mu.Unlock()

	entries := rl.visits[ip]
	filtered := entries[:0]
	for _, t := range entries {
		if t.After(cutoff) {
			filtered = append(filtered, t)
		}
	}
	if len(filtered) >= rl.limit {
		rl.visits[ip] = filtered
		return false
	}
	filtered = append(filtered, now)
	if len(filtered) == 0 {
		delete(rl.visits, ip)
		return true
	}
	// copy to avoid holding references to old slices
	rl.visits[ip] = append([]time.Time(nil), filtered...)
	return true
}

func rateLimitMiddleware(limiter *rateLimiter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip, _, err := net.SplitHostPort(r.RemoteAddr)
			if err != nil {
				ip = r.RemoteAddr
			}

			if !limiter.allow(ip) {
				w.WriteHeader(http.StatusTooManyRequests)
				_, _ = w.Write([]byte("Too many requests"))
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
