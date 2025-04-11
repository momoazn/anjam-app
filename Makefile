build-all: build-frontend build-backend

run-all: run-frontend run-backend

build-backend:
	cd backend && go build -o task-manager.out main.go

run-backend:
	cd backend && go run main.go

install-backend:
	cd backend && go mod tidy

build-frontend:
	pnpm run build

run-frontend:
	pnpm run dev

install-frontend:
	pnpm install

clean:
	rm -rf node_modules backend/dist backend/task-manager.out