.PHONY: help build up down logs restart clean test lint install

help: ## Afficher l'aide
	@echo "Commandes disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Installer les dépendances
	cd backend && npm install
	cd frontend && npm install

build: ## Build les images Docker
	docker-compose build

up: ## Démarrer les conteneurs
	docker-compose up -d

down: ## Arrêter les conteneurs
	docker-compose down

logs: ## Voir les logs
	docker-compose logs -f

restart: down up ## Redémarrer les conteneurs

clean: ## Nettoyer Docker
	docker-compose down -v
	docker system prune -f

test: ## Lancer les tests
	cd backend && npm test
	cd frontend && npm run test

lint: ## Lancer les linters
	cd backend && npm run lint
	cd frontend && npm run lint

dev: ## Démarrer en mode développement
	docker-compose -f docker-compose.dev.yml up

prod: ## Déployer en production
	./scripts/deploy.sh production

backup: ## Backup MongoDB
	@echo "Création du backup..."
	@docker-compose exec mongodb mongodump --archive > backup_$$(date +%Y%m%d_%H%M%S).archive
	@echo "Backup créé!"

ps: ## Voir le statut des conteneurs
	docker-compose ps

stats: ## Voir les statistiques des conteneurs
	docker stats
