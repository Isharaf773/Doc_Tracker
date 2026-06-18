Backend (Spring Boot) moved from electron/demo into backend/demo

Run steps (development):

1. Start MySQL and create database `doctrack`:

   ```sql
   CREATE DATABASE doctrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Configure credentials in `backend/demo/src/main/resources/application.properties` (update `spring.datasource.username` and `spring.datasource.password`).

3. From project root run backend (uses included mvnw):

   ```bash
   cd backend/demo
   ./mvnw spring-boot:run   # or on Windows: mvnw.cmd spring-boot:run
   ```

4. Start frontend dev server (from project root):

   ```bash
   npm run dev
   ```

Frontend running at `http://127.0.0.1:5173` will call the backend at `http://127.0.0.1:8080` by default (see `src/config.js`).

Notes:
- CORS is enabled for the frontend origins in `application.properties` during development.
- For production packaging, ensure `backend/` is deployed separately; the Electron build no longer contains the demo app.
