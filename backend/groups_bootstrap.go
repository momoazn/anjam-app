package main

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

type createGroupWithManagerRequest struct {
	Group struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	} `json:"group"`
	Manager struct {
		Username  string `json:"username"`
		Password  string `json:"password"`
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Email     string `json:"email"`
	} `json:"manager"`
}

func handleCreateGroupWithManager(e *core.RequestEvent) error {
	_, err := requireAdmin(e)
	if err != nil {
		return err
	}

	var req createGroupWithManagerRequest
	if err := json.NewDecoder(e.Request.Body).Decode(&req); err != nil {
		return apis.NewBadRequestError("invalid json body", err)
	}

	req.Group.Name = strings.TrimSpace(req.Group.Name)
	req.Group.Description = strings.TrimSpace(req.Group.Description)
	req.Manager.Username = strings.TrimSpace(strings.ToLower(req.Manager.Username))
	req.Manager.Password = strings.TrimSpace(req.Manager.Password)
	req.Manager.FirstName = strings.TrimSpace(req.Manager.FirstName)
	req.Manager.LastName = strings.TrimSpace(req.Manager.LastName)
	req.Manager.Email = strings.TrimSpace(strings.ToLower(req.Manager.Email))

	if req.Group.Name == "" {
		return apis.NewBadRequestError("group.name is required", nil)
	}
	if req.Manager.Username == "" {
		return apis.NewBadRequestError("manager.username is required", nil)
	}
	if req.Manager.Password == "" {
		return apis.NewBadRequestError("manager.password is required", nil)
	}
	if req.Manager.FirstName == "" || req.Manager.LastName == "" {
		return apis.NewBadRequestError("manager.first_name and manager.last_name are required", nil)
	}

	var createdGroup *core.Record
	var createdManager *core.Record

	if err := e.App.RunInTransaction(func(txApp core.App) error {
		groupsCollection, err := txApp.FindCollectionByNameOrId(CollectionGroups)
		if err != nil {
			return err
		}
		usersCollection, err := txApp.FindCollectionByNameOrId(CollectionUsers)
		if err != nil {
			return err
		}

		group := core.NewRecord(groupsCollection)
		group.Set("name", req.Group.Name)
		group.Set("description", req.Group.Description)
		group.Set("active", true)
		if err := txApp.Save(group); err != nil {
			return err
		}

		manager := core.NewRecord(usersCollection)
		manager.Set("username", req.Manager.Username)
		if req.Manager.Email != "" {
			manager.Set("email", req.Manager.Email)
		}
		manager.Set("password", req.Manager.Password)
		manager.Set("role", RoleManager)
		manager.Set("first_name", req.Manager.FirstName)
		manager.Set("last_name", req.Manager.LastName)
		manager.Set("group", group.Id)
		manager.Set("active", true)

		if err := txApp.Save(manager); err != nil {
			return err
		}

		group.Set("manager", manager.Id)
		if err := txApp.Save(group); err != nil {
			return err
		}

		createdGroup = group
		createdManager = manager
		return nil
	}); err != nil {
		return err
	}

	return e.JSON(http.StatusCreated, map[string]any{
		"data": map[string]any{
			"groupId":   createdGroup.Id,
			"managerId": createdManager.Id,
		},
	})
}
