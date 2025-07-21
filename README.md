# Group Chat Application Monorepo

This Nx monorepo is for a real-time group chat application, featuring an Angular frontend and a NestJS backend.

---

## 🚦 Project Progress Tracker

| Phase / Feature                | Status     | Notes                                  |
|-------------------------------|------------|----------------------------------------|
| **Monorepo Setup**             | ✅ Done     | Nx workspace, Angular, NestJS scaffolded|
| Shared Libraries (types/env)   | ✅ Done     | `shared-types`, `env-config` scaffolded |
| **Authentication**             | ⏳ Pending | Register, login, JWT, guards            |
| **Chat Rooms & Messaging**     | ⏳ Pending | Room/message models, REST endpoints      |
| **WebSocket Integration**      | ⏳ Pending | Real-time messaging, Socket.IO          |
| **User Presence**              | ⏳ Pending | Online users, join/leave events         |
| **Dev Tools & Testing**        | ⏳ Pending | Seed scripts, Postman, tests            |
| **Docker & Deployment**        | ⏳ Pending | Dockerize apps, docker-compose, .env    |
| **CI/CD & Cloud Setup**        | ⏳ Pending | GitHub Actions, Azure, DigitalOcean DNS |

---

## 📁 Project Structure

```
.
├── backend/           # NestJS backend app
│   └── src/
│       └── app/
├── frontend/          # Angular frontend app
│   └── src/
│       └── app/
├── shared-types/      # Shared TypeScript types/interfaces
│   └── src/
├── env-config/        # Shared environment config
│   └── src/
├── README.md
├── DELIVERABLES.md
├── package.json
├── nx.json
└── ... (Nx config and root files)
```

- `frontend/` — Angular 16+ app (scaffolded, no features yet)
- `backend/` — NestJS app (scaffolded, no features yet)
- `shared-types/` — Shared TypeScript types/interfaces (empty)
- `env-config/` — Shared environment config (empty)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Node 20+ recommended for Angular 20+)
- npm

### Install dependencies
```bash
npm install
```

### Run the apps
#### Start the backend (NestJS)
```bash
npx nx serve backend
# By default runs on http://localhost:3000/
```
#### Start the frontend (Angular)
```bash
npx nx serve frontend
# By default runs on http://localhost:4200/
```

---

## 🛠️ Nx Workspace Commands
- Build: `npx nx build <project>`
- Test: `npx nx test <project>`
- Lint: `npx nx lint <project>`

---

## 📌 Next Steps
- Implement authentication (register/login/profile) in backend and frontend
- Add chat room and messaging features
- Integrate WebSocket for real-time messaging
- Add user presence indicators
- Add Docker, CI/CD, and deployment scripts

---

## 🔗 Useful Links
- [Nx Documentation](https://nx.dev)
- [Angular Documentation](https://angular.io/docs)
- [NestJS Documentation](https://docs.nestjs.com/)

---

**Current status: Project is scaffolded. No business logic or features are implemented yet.**
