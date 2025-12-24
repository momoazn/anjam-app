package helpers

import "github.com/pocketbase/pocketbase/core"

func FindRecordByIDOrJSON(
	e *core.RequestEvent,
	collection string,
	id string,
	notFoundMessage string,
) (*core.Record, error) {
	record, err := e.App.FindRecordById(collection, id)
	if err != nil {
		LogRecordError("finding", collection, id, err)
		return nil, e.JSON(404, map[string]string{"error": notFoundMessage})
	}

	return record, nil
}
