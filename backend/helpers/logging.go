package helpers

import "log"

func LogRecordError(action, collection, id string, err error) {
	log.Printf("Error %s %s %q: %v", action, collection, id, err)
}
