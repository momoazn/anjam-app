// Package utils provides utility functions for the Anjam application.
package utils

import (
	"github.com/pocketbase/pocketbase/tools/security"
	"anjam/config"
)

// GenerateRandomCode generates a random string of uppercase letters
// with the length specified by config.CodeLength.
func GenerateRandomCode() string {
	return security.RandomStringWithAlphabet(config.CodeLength, "ABCDEFGHIJKLMNOPQRSTUVWXYZ")
}
