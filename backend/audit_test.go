package main

import (
	"testing"

	"github.com/pocketbase/pocketbase/core"
)

func TestCalculateChanges_ExcludesSensitiveFields(t *testing.T) {
	collection := core.NewBaseCollection("test")
	collection.Fields.Add(
		&core.TextField{Name: "title"},
		&core.TextField{Name: "password"},
		&core.TextField{Name: "token"},
	)

	oldRec := core.NewRecord(collection)
	oldRec.Set("title", "Old")
	oldRec.Set("password", "oldpw")
	oldRec.Set("token", "oldtoken")

	newRec := core.NewRecord(collection)
	newRec.Set("title", "New")
	newRec.Set("password", "newpw")
	newRec.Set("token", "newtoken")

	changes := calculateChanges(oldRec, newRec, collection)

	if _, ok := changes["title"]; !ok {
		t.Fatalf("expected title change to be present")
	}
	if _, ok := changes["password"]; ok {
		t.Fatalf("expected password change to be excluded")
	}
	if _, ok := changes["token"]; ok {
		t.Fatalf("expected token change to be excluded")
	}
}

func TestTruncateValue_RedactsNestedSensitiveKeys(t *testing.T) {
	in := map[string]interface{}{
		"password": "secret",
		"nested": map[string]interface{}{
			"token": "tok",
		},
	}

	out, ok := truncateValue(in).(map[string]interface{})
	if !ok {
		t.Fatalf("expected map output")
	}

	if out["password"] != "[redacted]" {
		t.Fatalf("expected password to be redacted, got %v", out["password"])
	}

	nested, ok := out["nested"].(map[string]interface{})
	if !ok {
		t.Fatalf("expected nested map output")
	}
	if nested["token"] != "[redacted]" {
		t.Fatalf("expected nested.token to be redacted, got %v", nested["token"])
	}
}

