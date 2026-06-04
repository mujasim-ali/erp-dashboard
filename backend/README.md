# ERP Backend API

A production-ready Node.js/Express backend for the ERP Dashboard frontend at `erp-dashboard-blue.vercel.app`.

## Stack

- **Runtime**: Node.js 18+
- **Framework**: Express 5
- **Database**: LibSQL (SQLite locally, Turso in production)
- **Auth**: JWT + bcrypt
- **AI**: Anthropic Claude (claude-sonnet-4)
- **Logging**: Morgan + custom activity logger

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and fill in JWT_SECRET and ANTHROPIC_API_KEY

# 3. Start development server
npm run dev

# 4. Server runs on http://localhost:3001
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 3001) |
| `DATABASE_URL` | No | SQLite path or Turso URL (default: `file:./erp.db`) |
| `JWT_SECRET` | **Yes** | Long random secret for JWT signing |
| `JWT_EXPIRES` | No | Token expiry (default: `7d`) |
| `ANTHROPIC_API_KEY` | For AI | Your Anthropic API key |
| `CORS_ORIGIN` | No | Frontend URL for CORS (default: `*`) |

---

## API Reference

### Auth  `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login, returns JWT |
| GET | `/me` | Yes | Get current user |
| PUT | `/me` | Yes | Update profile/password |
| GET | `/users` | Yes | List all users |

**Register/Login body:**
```json
{ "name": "John", "email": "john@example.com", "password": "pass123", "role": "user" }
```

---

### Projects  `/api/projects`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | List user's projects |
| POST | `/` | Yes | Create project |
| GET | `/:projectId` | Yes | Get project + members + boards |
| PUT | `/:projectId` | Yes | Update project |
| DELETE | `/:projectId` | Yes | Delete project |
| POST | `/:projectId/members` | Yes | Add member |
| DELETE | `/:projectId/members/:userId` | Yes | Remove member |

---

### Boards  `/api/projects/:projectId/boards`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | List boards in project |
| POST | `/` | Yes | Create board |
| GET | `/:boardId` | Yes | Get board + all tasks |
| PUT | `/:boardId` | Yes | Rename board |
| DELETE | `/:boardId` | Yes | Delete board (must be empty) |

---

### Tasks  `/api/projects/:projectId/tasks` or `/api/tasks`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/my` | Yes | Get tasks assigned to me |
| GET | `/dashboard/stats` | Yes | Dashboard statistics |
| GET | `/` | Yes | List tasks in project (filterable) |
| POST | `/board/:boardId` | Yes | Create task in board |
| GET | `/:taskId` | Yes | Get task + activity history |
| PUT | `/:taskId` | Yes | Update task |
| PATCH | `/:taskId/status` | Yes | Update status only |
| DELETE | `/:taskId` | Yes | Delete task |

**Task query filters:** `?status=todo&priority=high&assigned_to=userId&search=keyword`

**Task statuses:** `todo`, `in_progress`, `review`, `done`  
**Task priorities:** `low`, `medium`, `high`, `critical`

---

### Activity Log  `/api/activity`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/global` | Admin | All activity across system |
| GET | `/:projectId` | Yes | Activity for a project |

Query params: `?limit=50&offset=0&entity_type=task&action=TASK_CREATED`

---

### AI Features  `/api/ai`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/projects/:projectId/chat` | Yes | Chat with project AI assistant |
| GET | `/projects/:projectId/chat/history` | Yes | Get chat history |
| DELETE | `/projects/:projectId/chat/history` | Yes | Clear chat history |
| GET | `/projects/:projectId/suggest-tasks` | Yes | AI task suggestions |
| GET | `/projects/:projectId/summary` | Yes | Generate project status report |
| GET | `/projects/:projectId/workload` | Yes | Team workload analysis |
| POST | `/generate-task-description` | Yes | Generate task description from title |

**Chat body:** `{ "message": "What tasks are overdue?" }`  
**Task description body:** `{ "title": "Set up CI/CD pipeline", "context": "optional project context" }`

---

## Database Schema

```
users          → user_id, name, email, password, role
projects       → project_id, project_name, description, created_by
boards         → board_id, board_name, project_id, updated_by
tasks          → task_id, title, description, board_id, project_id, assigned_to, status, priority, due_date, created_by
activity_log   → log_id, user_id, entity_id, entity_type, action, details, project_id
project_members→ project_id, user_id, role
ai_chat_history→ id, user_id, project_id, role, content
```

---

## Deploying to Railway / Render

1. Push this folder to a GitHub repo
2. Create a new project on [Railway](https://railway.app) or [Render](https://render.com)
3. Set environment variables in the dashboard
4. For production database, use [Turso](https://turso.tech) (free tier available):
   ```
   DATABASE_URL=libsql://your-db.turso.io
   TURSO_AUTH_TOKEN=your-token
   ```
5. Set `CORS_ORIGIN=https://erp-dashboard-blue.vercel.app`

---

## Connecting to the Frontend

In the frontend (erp-dashboard-blue.vercel.app), set the API base URL to:
```
https://your-backend.railway.app/api
```

All endpoints require the `Authorization: Bearer <token>` header after login.
