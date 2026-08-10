# Reflect Frontend

React frontend for the Reflect self behavioral assessment system.

## Run Locally

Start the Spring Boot backend first:

```bash
cd ../reflect-backend
./mvnw spring-boot:run
```

Then start the frontend:

```bash
cd ../reflect-frontend
npm install
npm run dev
```

On Windows PowerShell, if `npm` is blocked by execution policy, use:

```bash
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

Or double-click:

```text
start-frontend.bat
```

Open:

```text
http://localhost:5173
```

The frontend calls the backend at:

```text
http://localhost:8080/api
```

To override that URL, create a `.env` file:

```text
VITE_API_BASE_URL=http://localhost:8080/api
```

## Pages

- Login and register
- Dashboard with charts
- Profile setup
- Goals and milestones
- Activity logs
- Habits and habit logs
- Weekly self-assessment
- Rule-based insights
