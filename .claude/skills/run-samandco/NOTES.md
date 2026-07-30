# Skill Development Notes for NexusCoin (Samandco)

## Discovery Phase

The project is a full-stack investment platform called NexusCoin with:
- Frontend: Next.js 16 (in nexus-invest-frontend/)
- Backend: Laravel 11 API (in nexus-invest-backend/)
- Infrastructure: Docker Compose with MySQL, Redis, Nginx

From the README:
- Frontend accessible at http://localhost:3000
- API accessible at http://localhost:8000/api/v1
- Default admin: admin@nexuscoin.com / password

## Execution Plan

1. Install prerequisites (Docker, docker-compose if not present)
2. Copy environment files
3. Build and start the application via docker-compose
4. Wait for services to be ready
5. Create a way to interact with the application (chromium-cli for frontend, curl for API)
6. Take a screenshot to verify it's working
7. Document the exact commands in the skill

## Progress

### 2026-07-22 23:40: Started skill development
- Created skill directory: .claude/skills/run-samandco/
- Created notes file
- Checked for Docker: not installed
- Package manager available: apt-get

Next: Install Docker and docker-compose