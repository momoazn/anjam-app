package main

import (
	"regexp"

	"github.com/pocketbase/pocketbase/core"
)

var mentionRegex = regexp.MustCompile(`@([a-zA-Z0-9_.-]+)`)

func handleCommentMentions(e *core.RecordEvent) error {
	content := e.Record.GetString("content")
	if content == "" {
		return e.Next()
	}

	matches := mentionRegex.FindAllStringSubmatch(content, -1)
	if len(matches) == 0 {
		return e.Next()
	}

	mentionCollection, err := e.App.FindCollectionByNameOrId("mentions")
	if err != nil {
		return e.Next()
	}

	taskID := e.Record.GetString("task")
	projectID := ""
	if taskID != "" {
		task, err := e.App.FindRecordById("tasks", taskID)
		if err == nil && task != nil {
			projectID = task.GetString("project")
		}
	}

	seen := map[string]bool{}
	for _, match := range matches {
		if len(match) < 2 {
			continue
		}
		username := match[1]
		if username == "" || seen[username] {
			continue
		}
		seen[username] = true

		user, err := e.App.FindFirstRecordByFilter(
			"users",
			"username = {:username}",
			map[string]any{"username": username},
		)
		if err != nil || user == nil {
			continue
		}

		mention := core.NewRecord(mentionCollection)
		mention.Set("mentioned_user", user.Id)
		mention.Set("comment", e.Record.Id)
		if taskID != "" {
			mention.Set("task", taskID)
		}
		if projectID != "" {
			mention.Set("project", projectID)
		}

		_ = e.App.Save(mention)
	}

	return e.Next()
}
