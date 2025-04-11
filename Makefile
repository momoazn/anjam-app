build-all: build-frontend build-backend

run-all: run-frontend run-backend

build-backend:
	go build -o task-manager.out main.go

run-backend:
	go run main.go

build-frontend:
	pnpm run build

run-frontend:
	pnpm run dev
