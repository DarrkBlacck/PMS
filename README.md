# PMS Project Development

## Service Management

If the frontend or backend services crash or need to be restarted:

### Using VS Code Tasks
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Tasks: Run Task"
3. Select one of the following:
   - "Restart Frontend" - Restarts the Next.js frontend
   - "Restart Backend" - Restarts the FastAPI backend
   - "View Frontend Logs" - Shows live logs from the frontend
   - "View Backend Logs" - Shows live logs from the backend
   - "View All Logs" - Shows logs from all services

### Using Terminal
Run these commands from any terminal:

- Restart frontend: `/workspace/scripts/restart_frontend.sh`
- Restart backend: `/workspace/scripts/restart_backend.sh`
- View logs: `/workspace/scripts/view_logs.sh [frontend|backend]`

## Manual Service Management

If you need more control, you can use Docker Compose directly:

```bash
# Navigate to the docker-compose file
cd /workspace/.devcontainer

# Restart services
docker compose restart frontend
docker compose restart backend

# View logs
docker compose logs -f frontend
docker compose logs -f backend

# Stop services
docker compose stop frontend
docker compose stop backend

# Start services
docker compose start frontend
docker compose start backend


With these tools in place, you'll have:
1. Automatic restart of crashed services (via the `restart: unless-stopped` policy)
2. Easy manual restart via VS Code tasks or shell scripts
3. Simple access to logs to diagnose issues
4. Clear documentation for your team

This setup gives you both automated recovery and manual control when needed.