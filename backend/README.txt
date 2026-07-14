Copy these files into the project's backend folder:

1. app.js                 (new)
2. server.js              (replace existing file)
3. db.js                  (replace existing file)
4. package.json           (replace existing file)
5. vercel.json            (replace existing file)
6. api/index.js            (new folder/file)

Then run from the Doc_Tracker project root:

git add backend
git commit -m "Make backend Vercel compatible"
git push

Vercel backend project settings:
- Root Directory: backend
- Environment variables:
  DB_HOST
  DB_PORT
  DB_USER
  DB_PASSWORD
  DB_NAME

Optional:
  FRONTEND_URL
  BACKEND_URL
  EMAIL_USER
  EMAIL_PASS
  EMAIL_FROM

After deployment, test:
https://YOUR-BACKEND-DOMAIN.vercel.app/api/health

Expected:
{"status":"ok"}
