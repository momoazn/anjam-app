build-all: build-frontend build-pocketbase

run-all: run-frontend run-pocketbase

build-pocketbase:
	go build -o task-manager.out main.go

run-pocketbase:
	go run main.go

install-pocketbase:
	go mod tidy

build-frontend:
	pnpm run build

run-frontend:
	pnpm run dev

install-frontend:
	pnpm install

clean:
	rm -rf node_modules dist task-manager.out
