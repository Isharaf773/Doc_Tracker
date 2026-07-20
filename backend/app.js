import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import qrcode from "qrcode";
import { query } from "./db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",

  "https://doc-tracker-iota.vercel.app",   
  "file://",
  "vscode-webview://",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header, including Electron/native clients.
      if (!origin || origin === "null" || origin === "file://") {
        return callback(null, true);
      }

      // Allow explicitly trusted local and production origins.
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow this project's Vercel preview deployments.
      const isDocTrackerVercelPreview =
        /^https:\/\/doc-tracker-[a-z0-9-]+-isharaf773\.vercel\.app$/i.test(origin);

      if (isDocTrackerVercelPreview) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS policy does not allow access from origin ${origin}`)
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-admin-email",
      "x-admin-token"
    ]
  })
);

app.options("*", cors());
app.use(express.json({ limit: "6mb" }));

const emailUser = process.env.GMAIL_USER || process.env.EMAIL_USER;
const emailPass = process.env.GMAIL_PASS || process.env.EMAIL_PASS;
const fromAddress = process.env.EMAIL_FROM || process.env.GMAIL_USER || process.env.EMAIL_USER || "doctrack@localhost";

const transporter = emailUser && emailPass
  ? nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    })
  : null;

function sendError(res, message, status = 500) {
  return res.status(status).json({ error: message });
}


let softCopySchemaPromise;

async function columnExists(tableName, columnName) {
  const rows = await query(
    `
      SELECT COUNT(*) AS count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
    `,
    [tableName, columnName]
  );

  return Number(rows?.[0]?.count || 0) > 0;
}

async function addColumnIfMissing(tableName, columnName, columnDefinition) {
  const exists = await columnExists(tableName, columnName);

  if (!exists) {
    await query(
      `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${columnDefinition}`
    );
  }
}

async function ensureSoftCopySchema() {
  if (!softCopySchemaPromise) {
    softCopySchemaPromise = (async () => {
      await addColumnIfMissing(
        "records",
        "soft_copy",
        "LONGBLOB NULL"
      );

      await addColumnIfMissing(
        "records",
        "soft_copy_name",
        "VARCHAR(255) NULL"
      );

      await addColumnIfMissing(
        "records",
        "soft_copy_type",
        "VARCHAR(120) NULL"
      );

      await addColumnIfMissing(
        "records",
        "soft_copy_size",
        "INT NULL"
      );

      await addColumnIfMissing(
        "records",
        "sender_name",
        "VARCHAR(255) NULL"
      );

      await addColumnIfMissing(
        "records",
        "sender_email",
        "VARCHAR(255) NULL"
      );

      await addColumnIfMissing(
        "records",
        "sender_department",
        "VARCHAR(120) NULL DEFAULT 'Non Department'"
      );

      await addColumnIfMissing(
        "records",
        "handler_department",
        "VARCHAR(120) NULL"
      );
    })().catch((error) => {
      softCopySchemaPromise = null;
      throw error;
    });
  }

  return softCopySchemaPromise;
}
async function addNotification(type, message) {
  const time = "Just now";
  try {
    await query("INSERT INTO notifications (type, message, unread, time) VALUES (?, ?, true, ?)", [type, message, time]);
  } catch (error) {
    console.error("Failed to insert notification:", error);
  }
}

// Middleware to check admin authorization (headers or query params)
function requireAdminFlexible(req, res, next) {
  // Check headers first
  let adminEmail = req.headers["x-admin-email"];
  let adminToken = req.headers["x-admin-token"];

  // Fallback to query parameters (for cases like window.open where headers can't be set)
  if (!adminEmail) {
    adminEmail = req.query.email;
    adminToken = req.query.token;
  }

  if (!adminEmail || !adminToken) {
    console.log("🔒 Auth failed: Missing email or token");
    console.log("  Headers email:", !!req.headers["x-admin-email"], "token:", !!req.headers["x-admin-token"]);
    console.log("  Query email:", !!req.query.email, "token:", !!req.query.token);
    return sendError(res, "Admin authorization required. Please login first.", 403);
  }

  // Store in request for use in route handlers
  req.admin = { email: adminEmail, token: adminToken };
  console.log("🔒 Auth passed for:", adminEmail);
  next();
}

// Middleware to check admin authorization
function requireAdmin(req, res, next) {
  const adminEmail = req.headers["x-admin-email"];
  const adminToken = req.headers["x-admin-token"];

  if (!adminEmail || !adminToken) {
    return sendError(res, "Admin authorization required. Only administrators may perform this action.", 403);
  }

  // Store in request for use in route handlers
  req.admin = { email: adminEmail, token: adminToken };
  next();
}

app.get("/", (req, res) => {
  res.json({ message: "DocTrack backend is running. Use /api/* endpoints for the API." });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get('/track', (req, res) => {
  const recordCode = String(req.query.recordCode || req.query.code || '').trim();
  if (!recordCode) {
    return res.status(400).send('Record code required. Use /track/:recordCode or /track?recordCode=REC-2026-1234');
  }
  return res.redirect(302, `/track/${encodeURIComponent(recordCode)}`);
});

// Public tracking page for scanned QR codes
app.get('/track/:recordCode', async (req, res) => {
  const recordCode = String(req.params.recordCode || '').trim();
  if (!recordCode) return res.status(400).send('Record code required');

  const html = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>DocTrack - ${recordCode}</title>
    <style>
      body{font-family:Arial,Helvetica,sans-serif;background:#f3f4f6;color:#111;margin:0;padding:24px}
      .card{max-width:760px;margin:28px auto;background:white;padding:24px;border-radius:16px;box-shadow:0 18px 48px rgba(15,23,42,0.08)}
      h1{font-size:24px;margin:0 0 8px}
      .meta{color:#64748b;font-size:13px;margin-bottom:20px}
      .summary{color:#0f172a;font-size:14px;margin-bottom:18px}
      .details-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:22px}
      .detail-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:16px;color:#0f172a}
      .detail-label{font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.03em;margin-bottom:6px}
      .detail-value{font-size:15px;font-weight:600}
      .step{display:flex;gap:14px;padding:18px;border-radius:14px;border:1px solid #e2e8f0;background:#f8fafc;margin-bottom:14px}
      .step.done{background:#ecfdf5;border-color:#d1fae5}
      .step-index{width:34px;height:34px;border-radius:999px;background:#e0e7ff;color:#3730a3;display:flex;align-items:center;justify-content:center;font-weight:700}
      .step-body{flex:1}
      .step-action{font-weight:700;color:#0f172a;margin-bottom:6px}
      .step-meta{color:#475569;font-size:13px;line-height:1.6;white-space:pre-wrap}
      .step-time{margin-top:10px;color:#475569;font-size:12px}
      .empty-card{padding:18px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0;color:#475569;text-align:center}
    </style>
  </head>
  <body>
    <div class="card">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:12px">
        <div>
          <h1>DocTrack record ${recordCode}</h1>
          <div class="meta">Scan this QR code to see full document details and journey history.</div>
        </div>
        <div style="font-size:12px;color:#475569;align-self:center">Record code: <strong>${recordCode}</strong></div>
      </div>
      <div id="record-summary" class="summary">Loading record summary…</div>
      <div id="record-details" class="details-grid">Loading record details…</div>
      <h2 style="font-size:18px;margin:22px 0 12px">Journey history</h2>
      <div id="journey-summary" class="summary">Loading journey details…</div>
      <div id="content">Loading transaction steps…</div>
    </div>

    <script>
      async function load(){
        const details = document.getElementById('record-details');
        const content = document.getElementById('content');
        const recordSummary = document.getElementById('record-summary');
        const journeySummary = document.getElementById('journey-summary');
        function formatLabel(label){ return '<div class="detail-label">' + escapeHtml(label) + '</div>'; }
        function formatValue(value){ return '<div class="detail-value">' + escapeHtml(value || '-') + '</div>'; }
        function renderField(label, value){ return '<div class="detail-card">' + formatLabel(label) + formatValue(value) + '</div>'; }

        try{
          const [recordResp, journeyResp] = await Promise.all([
            fetch('/api/records/' + encodeURIComponent('${recordCode}')),
            fetch('/api/journey?recordId=' + encodeURIComponent('${recordCode}'))
          ]);

          let record;
          if(recordResp.ok){
            const recData = await recordResp.json();
            record = recData.record;
          }

          if(record){
            recordSummary.innerText = 'Current status: ' + (record.status || 'Unknown') + ' · ' + (record.location || 'Unknown location') + ' · Handler: ' + (record.handler || 'Unknown');
            details.innerHTML =
              renderField('Record code', record.id) +
              renderField('Document name', record.name) +
              renderField('Department', record.dept) +
              renderField('Status', record.status) +
              renderField('Handler', record.handler) +
              renderField('Location', record.location) +
              renderField('Priority', record.priority) +
              renderField('Sender', record.sender_email) +
              renderField('Created', record.created_at || '-') +
              renderField('Due date', record.due_date || '-') +
              renderField('Last updated', record.updated_at || '-');
          } else {
            recordSummary.innerText = 'No record details available.';
            details.innerHTML = '<div class="empty-card">Unable to load record details. Please confirm the record code.</div>';
          }

          if(!journeyResp.ok){
            const err = await journeyResp.json().catch(()=>({}));
            journeySummary.innerText = 'Unable to load transaction details.';
            content.innerText = err.error || 'Unable to load history';
            return;
          }

          const journeyData = await journeyResp.json();
          const items = journeyData.journey || [];
          if(items.length === 0){
            journeySummary.innerText = 'No transaction history available yet.';
            content.innerHTML = '<div class="empty-card">No transaction history found for this record.</div>';
            return;
          }

          journeySummary.innerText = items.length + ' transaction step' + (items.length === 1 ? '' : 's') + ' found.';
          content.innerHTML = items.map((item, index) =>
            '<div class="step' + (item.done ? ' done' : '') + '">' +
            '<div class="step-index">' + (index + 1) + '</div>' +
            '<div class="step-body">' +
            '<div class="step-action">' + escapeHtml(item.action || 'No action provided') + '</div>' +
            '<div class="step-meta">' + escapeHtml(item.meta || '') + '</div>' +
            (item.timestamp ? '<div class="step-time">' + escapeHtml(item.timestamp) + '</div>' : '') +
            '</div>' +
            '</div>'
          ).join('');
        }catch(e){
          recordSummary.innerText = 'Failed to load record details.';
          journeySummary.innerText = 'Failed to load transaction details.';
          content.innerText = 'Failed to load history: ' + (e.message || e);
          details.innerHTML = '<div class="empty-card">Unable to load record details.</div>';
        }
      }
      function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) }
      load();
    </script>
  </body>
  </html>`;

  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.send(html);
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, "Email and password are required.", 400);
  }

  try {
    const rows = await query("SELECT id, name, email, role, department FROM admins WHERE email = ? AND password = ? LIMIT 1", [email, password]);
    if (!rows || rows.length === 0) {
      return sendError(res, "Invalid email or password.", 401);
    }
    return res.json({ user: rows[0] });
  } catch (error) {
    console.error(error);
    return sendError(res, "Database error.");
  }
});

app.post("/api/test-mail", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return sendError(res, "Email is required.", 400);
  }

  if (!transporter) {
    return sendError(res, "Email transport is not configured. Set Gmail credentials in the backend environment.", 400);
  }

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: "DocTrack Gmail test",
      html: "<p>This is a test email from DocTrack.</p>",
    });

    return res.json({ message: "Test email sent successfully." });
  } catch (error) {
    console.error(error);
    return sendError(res, error.message || "Unable to send test email.", 500);
  }
});

app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return sendError(res, "Email is required.", 400);
  }

  try {
    const rows = await query("SELECT id, name, email FROM admins WHERE email = ? LIMIT 1", [email]);
    if (!rows || rows.length === 0) {
      return res.status(200).json({ success: false, message: "Email address not registered or invalid." });
    }

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?email=${encodeURIComponent(email)}`;
    const mailOptions = {
      from: fromAddress,
      to: email,
      subject: "GeoMine DocTrack password reset",
      html: `
        <p>Hello ${rows[0].name || "Admin"},</p>
        <p>You requested a password reset for your GeoMine DocTrack account.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>If the button does not work, copy and open this link:</p>
        <p>${resetUrl}</p>
      `,
    };

    if (transporter) {
      try {
        await transporter.sendMail(mailOptions);
      } catch (mailError) {
        console.error("Password reset email failed:", mailError);
        return res.status(200).json({
          message: "Password reset link is ready, but email delivery failed. Use the link below.",
          resetUrl,
          email,
          emailError: mailError.message,
        });
      }
    } else {
      console.log("Password reset email would be sent to:", email);
      console.log("Reset URL:", resetUrl);
    }

    return res.json({
      success: true,
      message: "Password reset link has been sent to your registered email address.",
      resetUrl,
      email,
    });
  } catch (error) {
    console.error(error);
    return sendError(res, "Unable to process password reset request.");
  }
});

app.post("/api/reset-password", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, "Email and password are required.", 400);
  }

  try {
    const rows = await query("SELECT id FROM admins WHERE email = ? LIMIT 1", [email]);
    if (!rows || rows.length === 0) {
      return sendError(res, "No matching admin account found.", 404);
    }

    await query("UPDATE admins SET password = ? WHERE email = ?", [password, email]);
    return res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    return sendError(res, "Unable to reset password.");
  }
});

app.get("/api/dashboard", async (req, res) => {
  try {
    const totalRows = await query("SELECT COUNT(*) AS count FROM records");
    const transitRows = await query("SELECT COUNT(*) AS count FROM records WHERE status IN ('transit', 'pending', 'active')");
    const delayedRows = await query("SELECT COUNT(*) AS count FROM records WHERE status IN ('pending', 'transit', 'active') AND (updated_at IS NULL OR updated_at <= DATE_SUB(NOW(), INTERVAL 7 DAY))");
    const newTodayRows = await query("SELECT COUNT(*) AS count FROM records WHERE DATE(created_at) = CURDATE()");
    const weekRows = await query("SELECT COUNT(*) AS count FROM records WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)");
    const weekApprovedRows = await query(
      "SELECT COUNT(DISTINCT record_code) AS count FROM journey_logs WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND (action LIKE '%approved%' OR meta LIKE '%approved%')"
    );
    const weekRejectedRows = await query(
      "SELECT COUNT(DISTINCT record_code) AS count FROM journey_logs WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND (action LIKE '%reject%' OR meta LIKE '%reject%')"
    );
    const approvedTodayRows = await query(
      "SELECT COUNT(DISTINCT record_code) AS count FROM journey_logs WHERE DATE(created_at) = CURDATE() AND (action LIKE '%approved%' OR meta LIKE '%approved%')"
    );
    const rejectedTodayRows = await query(
      "SELECT COUNT(DISTINCT record_code) AS count FROM journey_logs WHERE DATE(created_at) = CURDATE() AND (action LIKE '%reject%' OR meta LIKE '%reject%')"
    );
    const todayAddedRows = newTodayRows[0]?.count || 0;
    const todayApprovedRows = approvedTodayRows[0]?.count || 0;
    const todayRejectedRows = rejectedTodayRows[0]?.count || 0;

    const recentRecords = await query(
      "SELECT record_code AS id, name, dept, status, handler, DATE_FORMAT(updated_at, '%l:%i %p') AS updated FROM records ORDER BY updated_at DESC LIMIT 4"
    );

    const inTransitRecords = await query(
      "SELECT record_code AS id, name, dept, status, handler, DATE_FORMAT(updated_at, '%l:%i %p') AS updated FROM records WHERE status IN ('transit', 'pending', 'active') ORDER BY updated_at DESC LIMIT 4"
    );

    const delayedRecords = await query(
      "SELECT record_code AS id, name, dept, status, handler, DATE_FORMAT(updated_at, '%l:%i %p') AS updated FROM records WHERE status IN ('pending','transit','active') AND updated_at <= DATE_SUB(NOW(), INTERVAL 7 DAY) ORDER BY updated_at ASC LIMIT 4"
    );

    const departmentVolumesRows = await query("SELECT dept, COUNT(*) AS count FROM records GROUP BY dept ORDER BY count DESC");

    const activity = await query(
      "SELECT action, meta FROM journey_logs ORDER BY step_order DESC LIMIT 4"
    );

    res.json({
      week: {
        added: weekRows[0]?.count || 0,
        approved: weekApprovedRows[0]?.count || 0,
        rejected: weekRejectedRows[0]?.count || 0,
      },
      today: {
        added: todayAddedRows,
        approved: todayApprovedRows,
        rejected: todayRejectedRows,
      },
      counts: {
        totalRecords: totalRows[0]?.count || 0,
        inTransit: transitRows[0]?.count || 0,
        delayed: delayedRows[0]?.count || 0,
        pendingScan: delayedRows[0]?.count || 0,
      },
      recentRecords,
      departmentVolumes: departmentVolumesRows.map(row => ({ label: row.dept, pct: Math.min(100, Math.max(5, Math.round((row.count / (departmentVolumesRows[0]?.count || 1)) * 100))), val: `${row.count}` })),
      activity,
      inTransitRecords,
      delayedRecords,
      stats: [
        { label: "New today", value: `${newTodayRows[0]?.count || 0}`, color: "#22C55E" },
        { label: "Approved", value: `${approvedTodayRows[0]?.count || 0}`, color: "#2563EB" },
        { label: "Rejected", value: `${rejectedTodayRows[0]?.count || 0}`, color: "#DC2626" },
      ],
    });
  } catch (error) {
    console.error(error);
    return sendError(res, "Unable to load dashboard data.");
  }
});

app.get("/api/records", async (req, res) => {
  let { status, statusGroup, dept, startDate, endDate, overdue, delayed, search } = req.query;
  const conditions = [];
  const params = [];

  if (statusGroup) {
    statusGroup = String(statusGroup).trim().toLowerCase();
    if (statusGroup === "transit") {
      conditions.push("status IN ('transit', 'pending', 'active')");
    }
  } else if (status) {
    status = String(status).trim().toLowerCase();
    if (status === "in transit") status = "transit";
    if (status.includes(",")) {
      const statuses = status.split(",").map(s => s.trim()).filter(Boolean);
      if (statuses.length) {
        conditions.push(`status IN (${statuses.map(() => "?").join(",")})`);
        params.push(...statuses);
      }
    } else if (status !== "all") {
      conditions.push("status = ?");
      params.push(status);
    }
  }
  if (overdue === "true") {
    conditions.push("status = 'pending'");
    conditions.push("due_date < CURDATE()");
  }
  if (delayed === "true") {
    conditions.push("status IN ('pending', 'transit', 'active')");
    conditions.push("(updated_at IS NULL OR updated_at <= DATE_SUB(NOW(), INTERVAL 7 DAY))");
  }
  if (dept) {
    conditions.push("dept = ?");
    params.push(dept);
  }
  if (startDate) {
    conditions.push("DATE(updated_at) >= ?");
    params.push(startDate);
  }
  if (endDate) {
    conditions.push("DATE(updated_at) <= ?");
    params.push(endDate);
  }
  if (search && String(search).trim()) {
    const term = `%${String(search).trim()}%`;
    conditions.push("(record_code LIKE ? OR name LIKE ? OR dept LIKE ? OR handler LIKE ? OR sender_name LIKE ? OR sender_email LIKE ? OR sender_department LIKE ? OR handler_department LIKE ?)");
    params.push(term, term, term, term, term, term, term, term);
  }

  let sql = "SELECT record_code AS id, name, dept, status, handler, sender_name AS senderName, sender_email AS senderEmail, COALESCE(sender_department, 'Non Department') AS senderDepartment, COALESCE(handler_department, dept) AS handlerDepartment, (soft_copy IS NOT NULL) AS hasSoftCopy, soft_copy_name AS softCopyName, DATE_FORMAT(updated_at, '%l:%i %p') AS updated FROM records";
  if (conditions.length) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }
  sql += " ORDER BY updated_at DESC LIMIT 100";

  try {
    await ensureSoftCopySchema();
    const records = await query(sql, params);
    return res.json({ records });
  } catch (error) {
    console.error(error);
    return sendError(res, "Unable to load records.");
  }
});

app.get("/api/records/:recordCode/soft-copy", requireAdminFlexible, async (req, res) => {
  const recordCode = String(req.params.recordCode || "").trim();
  if (!recordCode) return sendError(res, "Record code is required.", 400);

  try {
    console.log("📄 Soft-copy request for record:", recordCode);
    console.log("   Full URL:", req.originalUrl);
    console.log("   Query params:", JSON.stringify(req.query));
    await ensureSoftCopySchema();
    const [file] = await query(
      "SELECT soft_copy, soft_copy_name, soft_copy_type, soft_copy_size FROM records WHERE record_code = ? LIMIT 1",
      [recordCode]
    );
    
    if (!file) {
      console.log("❌ Record not found:", recordCode);
      return sendError(res, "Record not found.", 404);
    }
    
    if (!file.soft_copy) {
      console.log("❌ No soft copy for record:", recordCode);
      return sendError(res, "No soft copy is attached to this document.", 404);
    }

    const safeName = String(file.soft_copy_name || `${recordCode}.pdf`).replace(/[\r\n"]/g, "_");
    const mimeType = file.soft_copy_type || "application/pdf";
    const fileSize = file.soft_copy_size || file.soft_copy.length;
    
    console.log("✅ Sending soft-copy:", {
      name: safeName,
      size: fileSize,
      type: mimeType
    });
    
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Length", String(fileSize));
    res.setHeader("Content-Disposition", `inline; filename="${safeName}"`);
    res.setHeader("Cache-Control", "private, max-age=300");
    return res.send(file.soft_copy);
  } catch (error) {
    console.error("❌ Soft-copy error:", error.message);
    return sendError(res, "Unable to load the soft copy.");
  }
});

app.get("/api/records/:recordCode", async (req, res) => {
  const recordCodeParam = String(req.params.recordCode || "").trim();
  if (!recordCodeParam) {
    return sendError(res, "Record code is required.", 400);
  }
  console.log('[records.lookup] incoming recordCode param:', JSON.stringify(recordCodeParam));

  try {
    const [record] = await query(
      "SELECT record_code AS id, name, dept, status, handler, location, priority, sender_name, sender_email, COALESCE(sender_department, 'Non Department') AS sender_department, COALESCE(handler_department, dept) AS handler_department, DATE_FORMAT(created_at, '%Y-%m-%d %T') AS created_at, DATE_FORMAT(updated_at, '%Y-%m-%d %T') AS updated_at, DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date FROM records WHERE record_code = ? LIMIT 1",
      [recordCodeParam]
    );

    if (record) {
      console.log('[records.lookup] exact match found:', record.id);
      return res.json({ record });
    }
    // Attempt improved suffix-based resolution: prefer exact-right-side match
    const suffixMatch = recordCodeParam.match(/(\d+)$/);
    if (suffixMatch) {
      try {
        const digits = suffixMatch[1];
        console.log('[records.lookup] attempting suffix match for digits:', digits);
        const suffixRecords = await query(
          "SELECT record_code AS id, name, dept, status, handler, location, priority, sender_name, sender_email, COALESCE(sender_department, 'Non Department') AS sender_department, COALESCE(handler_department, dept) AS handler_department, DATE_FORMAT(updated_at, '%Y-%m-%d %T') AS updated_at, DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date FROM records WHERE RIGHT(record_code, ?) = ? ORDER BY updated_at DESC LIMIT 2",
          [digits.length, digits]
        );
        console.log('[records.lookup] suffixRecords.count =', suffixRecords.length, 'results:', suffixRecords.map(r=>r.id));
        if (suffixRecords.length === 1) {
          console.log('[records.lookup] suffix match resolved to:', suffixRecords[0].id);
          return res.json({ record: suffixRecords[0] });
        }
        if (suffixRecords.length > 1) {
          return sendError(res, "Multiple records found for this search. Please enter a more specific code.", 409);
        }
        // fallback to LIKE if RIGHT() finds nothing
        console.log('[records.lookup] RIGHT() found no unique match, trying LIKE fallback');
        const likeRecords = await query(
          "SELECT record_code AS id, name, dept, status, handler, location, priority, sender_name, sender_email, COALESCE(sender_department, 'Non Department') AS sender_department, COALESCE(handler_department, dept) AS handler_department, DATE_FORMAT(updated_at, '%Y-%m-%d %T') AS updated_at, DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date FROM records WHERE record_code LIKE ? ORDER BY updated_at DESC LIMIT 2",
          [`%${digits}`]
        );
        console.log('[records.lookup] likeRecords.count =', likeRecords.length, 'results:', likeRecords.map(r=>r.id));
        if (likeRecords.length === 1) return res.json({ record: likeRecords[0] });
        if (likeRecords.length > 1) return sendError(res, "Multiple records found for this search. Please enter a more specific code.", 409);
      } catch (err) {
        console.error('Suffix lookup failed:', err);
      }
    }

    // If input contains non-alphanumeric characters, try a cleaned substring search
    const patterns = [];
    if (recordCodeParam.length >= 3 && !/^[A-Za-z0-9-]+$/.test(recordCodeParam)) {
      const cleaned = recordCodeParam.replace(/[^A-Za-z0-9-]/g, "").trim();
      if (cleaned.length >= 3) patterns.push(`%${cleaned}%`);
    }
    // As a last resort, if the input itself is at least 3 chars, try a contains search
    if (patterns.length === 0 && recordCodeParam.length >= 3) {
      patterns.push(`%${recordCodeParam}%`);
    }

    for (const pattern of patterns) {
      const rows = await query(
        "SELECT record_code AS id, name, dept, status, handler, location, priority, sender_name, sender_email, COALESCE(sender_department, 'Non Department') AS sender_department, COALESCE(handler_department, dept) AS handler_department, DATE_FORMAT(updated_at, '%Y-%m-%d %T') AS updated_at, DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date FROM records WHERE record_code LIKE ? ORDER BY updated_at DESC LIMIT 2",
        [pattern]
      );
      if (rows.length === 1) return res.json({ record: rows[0] });
      if (rows.length > 1) return sendError(res, "Multiple records found for this search. Please enter a more specific code.", 409);
    }

    // Try document name lookup when the exact code/number lookup did not find a unique record
    if (recordCodeParam.length >= 3) {
      const nameRows = await query(
        "SELECT record_code AS id, name, dept, status, handler, location, priority, sender_name, sender_email, COALESCE(sender_department, 'Non Department') AS sender_department, COALESCE(handler_department, dept) AS handler_department, DATE_FORMAT(updated_at, '%Y-%m-%d %T') AS updated_at, DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date FROM records WHERE name LIKE ? ORDER BY updated_at DESC LIMIT 2",
        [`%${recordCodeParam}%`]
      );
      if (nameRows.length === 1) {
        return res.json({ record: nameRows[0] });
      }
      if (nameRows.length > 1) {
        return sendError(res, "Multiple records found for this search. Please enter a more specific document name.", 409);
      }
    }

    // Final aggressive fallback: try hyphen-stripped exact match and a broader LIKE
    try {
      const noHyphen = recordCodeParam.replace(/-/g, "");
      console.log('[records.lookup] final fallback: trying hyphen-stripped and broader LIKE', { noHyphen });
      const finalRows = await query(
        "SELECT record_code AS id, name, dept, status, handler, location, priority, sender_name, sender_email, COALESCE(sender_department, 'Non Department') AS sender_department, COALESCE(handler_department, dept) AS handler_department, DATE_FORMAT(updated_at, '%Y-%m-%d %T') AS updated_at, DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date FROM records WHERE record_code LIKE ? OR REPLACE(record_code, '-', '') = ? ORDER BY updated_at DESC LIMIT 2",
        [`%${recordCodeParam}%`, noHyphen]
      );
      console.log('[records.lookup] finalRows.count =', finalRows.length, 'results:', finalRows.map(r => r.id));
      if (finalRows.length === 1) return res.json({ record: finalRows[0] });
      if (finalRows.length > 1) return sendError(res, "Multiple records found for this search. Please enter a more specific code.", 409);
    } catch (err) {
      console.error('Final fallback lookup failed:', err);
    }

    return sendError(res, "Record not found.", 404);
  } catch (error) {
    console.error(error);
    return sendError(res, "Unable to load record.");
  }
});

app.post("/api/records", async (req, res) => {
  const { name, dept, senderName, senderDepartment, handlerDepartment, senderEmail, dueDate, priority, location, status, handler, message, attachmentName, attachmentType, attachmentSize, attachmentData } = req.body;
  if (!name || !dept || !senderName || !senderEmail || !handler) {
    return sendError(res, "Document name, sender name, sender email and handler are required.", 400);
  }

  const recordCode = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  let emailSent = false;
  let emailError;

  try {
    const initialStatus = status || "active";
    const initialHandler = handler || "Admin";
    const initialLocation = location || dept;

    await ensureSoftCopySchema();

    let softCopyBuffer = null;
    if (attachmentData) {
      const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
      if (!allowedTypes.has(attachmentType)) {
        return sendError(res, "Soft copy must be a PDF, JPG or PNG file.", 400);
      }
      softCopyBuffer = Buffer.from(String(attachmentData), "base64");
      if (softCopyBuffer.length > 3 * 1024 * 1024) {
        return sendError(res, "Soft copy must be 3 MB or smaller.", 400);
      }
    }

    await query(
      `INSERT INTO records (record_code, name, dept, status, handler, location, priority, sender_name, sender_email, sender_department, handler_department, due_date, soft_copy, soft_copy_name, soft_copy_type, soft_copy_size, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [recordCode, name, dept, initialStatus, initialHandler, initialLocation, priority || "Routine", senderName, senderEmail, senderDepartment || "Non Department", handlerDepartment || dept, dueDate || null, softCopyBuffer, attachmentName || null, attachmentType || null, softCopyBuffer ? softCopyBuffer.length : (attachmentSize || null)]
    );

    const nextStep = await query(
      "SELECT COALESCE(MAX(step_order), 0) + 1 AS nextOrder FROM journey_logs WHERE record_code = ?",
      [recordCode]
    );
    const stepOrder = nextStep[0]?.nextOrder || 1;
    const initialTimestamp = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
    const initialMeta = `${initialHandler} · Registered · ${initialTimestamp}`;

    await query(
      "INSERT INTO journey_logs (record_code, step_order, action, meta, done) VALUES (?, ?, ?, ?, ?)",
      [recordCode, stepOrder, `Registered — ${dept}`, initialMeta, true]
    );

    const [record] = await query("SELECT record_code AS id, name, dept, status, handler, location, priority, sender_name, sender_email, COALESCE(sender_department, 'Non Department') AS sender_department, COALESCE(handler_department, dept) AS handler_department, DATE_FORMAT(updated_at, '%Y-%m-%d %T') AS updated_at, DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date FROM records WHERE record_code = ? LIMIT 1", [recordCode]);

    await addNotification('record', `New document registered: ${recordCode} — ${record.name}`);

    const formattedMessage = message ? message.replace(/\n/g, "<br />") : "";
    const defaultBackend = `${req.protocol}://${req.get("host")}`;
    const trackBase = process.env.BACKEND_URL || defaultBackend;
    const trackUrlPath = `${trackBase.replace(/\/$/, '')}/track/${encodeURIComponent(recordCode)}`;
    const trackUrlQuery = `${trackBase.replace(/\/$/, '')}/track?recordCode=${encodeURIComponent(recordCode)}`;
    // Use the query-form URL for the QR image (many scanners handle query URLs more reliably)
    const qrBuffer = await qrcode.toBuffer(trackUrlQuery, { type: "png", width: 280, errorCorrectionLevel: "H", margin: 1 });

    if (transporter) {
      const mailOptions = {
        from: fromAddress,
        to: senderEmail,
        subject: `DocTrack: Document ${recordCode} registered`,
        html: `
          <p>Dear ${record.sender_email || senderEmail},</p>
          <p>Your document has been registered successfully in DocTrack.</p>
          <p><strong>Record code:</strong> ${recordCode}</p>
          <p><strong>Document name:</strong> ${record.name}</p>
          <p><strong>Assigned to:</strong> ${record.handler}</p>
          <p><strong>Status:</strong> ${record.status}</p>
          ${formattedMessage ? `<p><strong>Message:</strong><br />${formattedMessage}</p>` : ""}
          <p><strong>Your QR code (scannable):</strong></p>
          <p><img src="cid:doctrack-qr" alt="DocTrack QR code" style="width:240px;height:240px;" /></p>
          <p><strong>Direct links:</strong></p>
          <p><a href="${trackUrlPath}">Open detail (path form)</a></p>
          <p><a href="${trackUrlQuery}">Open detail (query form)</a> — this is the link embedded in the QR code</p>
          <p>If the image does not load, use the record code: <strong>${recordCode}</strong></p>
          <br />
          <p>Best regards,<br />DocTrack Team</p>
        `,
        attachments: [
          {
            filename: "doctrack-qr.png",
            content: qrBuffer,
            cid: "doctrack-qr",
          },
        ],
      };

      try {
        await transporter.sendMail(mailOptions);
        emailSent = true;
      } catch (mailError) {
        console.error("Record creation email failed:", mailError);
        emailError = mailError.message;
      }
    } else {
      console.log("Email transport is not configured. Record email would be sent to:", senderEmail);
    }

    return res.status(201).json({ record, emailSent, emailError, trackUrlPath, trackUrlQuery });
  } catch (error) {
    console.error(error);
    return sendError(res, "Unable to create record.");
  }
});

app.post("/api/records/:recordCode/location", async (req, res) => {
  const { location, status, handler, comment } = req.body;
  if (!location) {
    return sendError(res, "Location is required.", 400);
  }

  try {
    const [record] = await query("SELECT id, status, handler, location FROM records WHERE record_code = ? LIMIT 1", [req.params.recordCode]);
    if (!record) {
      return sendError(res, "Record not found.", 404);
    }

    const nextStep = await query(
      "SELECT COALESCE(MAX(step_order), 0) + 1 AS nextOrder FROM journey_logs WHERE record_code = ?",
      [req.params.recordCode]
    );
    const stepOrder = nextStep[0]?.nextOrder || 1;
    const newStatus = status || record.status || "transit";
    const newHandler = handler || record.handler || "Admin";
    const nowLabel = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
    const metaParts = [`${newHandler}`, nowLabel];
    if (comment) metaParts.push(`"${comment}"`);
    metaParts.push(`${newStatus}`);
    const meta = metaParts.join(" · ");

    let action = `Moved to ${location}`;
    let done = false;
    if (newStatus === "approved") {
      action = `Approved — ${location}`;
      done = true;
    } else if (newStatus === "rejected") {
      action = `Rejected — ${location}`;
      done = true;
    } else if (newStatus === "pending") {
      action = `Pending approval — ${location}`;
    } else if (newStatus === "transit") {
      action = `Dispatched — ${location}`;
    } else if (newStatus === "active") {
      action = `Received — ${location}`;
    } else if (newStatus === "archived") {
      action = `Archived — ${location}`;
      done = true;
    }

    await query(
      "UPDATE records SET location = ?, status = ?, handler = ?, updated_at = NOW() WHERE record_code = ?",
      [location, newStatus, newHandler, req.params.recordCode]
    );

    await query(
      "INSERT INTO journey_logs (record_code, step_order, action, meta, done) VALUES (?, ?, ?, ?, ?)",
      [req.params.recordCode, stepOrder, action, meta, done]
    );

    let notificationType = 'transfer';
    let notificationMessage = `${req.params.recordCode} moved to ${location}`;
    if (newStatus === 'approved') {
      notificationType = 'alert';
      notificationMessage = `${req.params.recordCode} approved at ${location}`;
    } else if (newStatus === 'rejected') {
      notificationType = 'alert';
      notificationMessage = `${req.params.recordCode} rejected at ${location}`;
    } else if (newStatus === 'pending') {
      notificationType = 'transfer';
      notificationMessage = `${req.params.recordCode} is pending at ${location}`;
    } else if (newStatus === 'transit') {
      notificationType = 'transfer';
      notificationMessage = `${req.params.recordCode} dispatched to ${location}`;
    } else if (newStatus === 'active') {
      notificationType = 'scan';
      notificationMessage = `${req.params.recordCode} received at ${location}`;
    } else if (newStatus === 'archived') {
      notificationType = 'alert';
      notificationMessage = `${req.params.recordCode} archived at ${location}`;
    }

    await addNotification(notificationType, notificationMessage);

    const [updated] = await query("SELECT record_code AS id, name, dept, status, handler, location, priority, sender_name, sender_email, COALESCE(sender_department, 'Non Department') AS sender_department, COALESCE(handler_department, dept) AS handler_department, DATE_FORMAT(updated_at, '%Y-%m-%d %T') AS updated_at, DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date FROM records WHERE record_code = ? LIMIT 1", [req.params.recordCode]);
    return res.json({ record: updated });
  } catch (error) {
    console.error(error);
    return sendError(res, "Unable to update location.");
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await query(
      "SELECT name, email, role, department, category, docs AS docsCount, scans AS scansCount, online FROM users ORDER BY role DESC, name"
    );
    return res.json({ users });
  } catch (error) {
    console.error(error);
    return sendError(res, "Unable to load users.");
  }
});

app.put("/api/users/:email", requireAdmin, async (req, res) => {
  const { name, role, department, category, password } = req.body;
  const email = req.params.email;

  if (!name || !email || !department) {
    return sendError(res, "Name, email, and department are required.", 400);
  }

  try {
    const [existingUser] = await query("SELECT role FROM users WHERE email = ? LIMIT 1", [email]);
    if (!existingUser) {
      return sendError(res, "User not found.", 404);
    }

    await query(
      "UPDATE users SET name = ?, role = ?, department = ?, category = ? WHERE email = ?",
      [name, role || "staff", department, category || "", email]
    );

    if (role === "admin") {
      const [existingAdmin] = await query("SELECT id FROM admins WHERE email = ? LIMIT 1", [email]);
      if (existingAdmin) {
        const adminUpdateFields = [name, role || "admin", department, email];
        let adminSql = "UPDATE admins SET name = ?, role = ?, department = ?";

        if (password) {
          adminSql += ", password = ?";
          adminUpdateFields.splice(3, 0, password);
        }

        adminSql += " WHERE email = ?";
        await query(adminSql, adminUpdateFields);
      } else {
        if (!password) {
          return sendError(res, "Password is required when promoting a user to admin.", 400);
        }
        await query(
          "INSERT INTO admins (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)",
          [name, email, password, role || "admin", department]
        );
      }
    }

    const [user] = await query(
      "SELECT name, email, role, department, category, docs AS docsCount, scans AS scansCount, online FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    return res.json({ user, message: "User updated successfully." });
  } catch (error) {
    console.error(error);
    return sendError(res, "Unable to update user.");
  }
});

app.delete("/api/users/:email", requireAdmin, async (req, res) => {
  const email = req.params.email;

  if (!email) {
    return sendError(res, "Email is required.", 400);
  }

  try {
    await query("DELETE FROM users WHERE email = ?", [email]);
    return res.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error(error);
    return sendError(res, "Unable to delete user.");
  }
});

app.get("/api/notifications", async (req, res) => {
  try {
    const notifications = await query(
      "SELECT id, type, message, unread, time FROM notifications ORDER BY id DESC"
    );
    return res.json({ notifications });
  } catch (error) {
    console.error(error);
    return sendError(res, "Unable to load notifications.");
  }
});

app.put("/api/notifications/read-all", async (req, res) => {
  try {
    await query("UPDATE notifications SET unread = false WHERE unread = true");
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return sendError(res, "Unable to mark notifications read.");
  }
});

app.put("/api/notifications/:id/read", async (req, res) => {
  try {
    await query("UPDATE notifications SET unread = false WHERE id = ?", [req.params.id]);
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return sendError(res, "Unable to mark notification read.");
  }
});

app.get("/api/journey", async (req, res) => {
  const recordCode = String(req.query.recordId || "").trim();
  if (!recordCode) {
    return sendError(res, "recordId query parameter is required.", 400);
  }
  // Resolve the record_code to a full code when a partial/suffix is provided.
  let recordCodeParam = recordCode;
  try {
    // Prefer exact match first
    const [exact] = await query(
      "SELECT record_code FROM records WHERE record_code = ? LIMIT 1",
      [recordCodeParam]
    );
    if (exact && exact.record_code) {
      recordCodeParam = exact.record_code;
    } else {
      // Fallback: if trailing digits provided, try suffix match
      const suffixMatch = recordCodeParam.match(/(\d+)$/);
      if (suffixMatch) {
        const [record] = await query(
          "SELECT record_code FROM records WHERE record_code LIKE ? ORDER BY updated_at DESC LIMIT 1",
          [`%${suffixMatch[1]}`]
        );
        if (record && record.record_code) {
          recordCodeParam = record.record_code;
        }
      }
    }

    const journey = await query(
      "SELECT step_order, action, meta, done, DATE_FORMAT(created_at, '%Y-%m-%d %T') AS timestamp FROM journey_logs WHERE record_code = ? ORDER BY step_order ASC",
      [recordCodeParam]
    );
    return res.json({ journey });
  } catch (error) {
    console.error(error);
    return sendError(res, "Unable to load journey.");
  }
});

// Temporary debug endpoint to inspect how a term matches records (exact, suffix, LIKE, stripped)
app.get('/api/debug-records', async (req, res) => {
  const term = String(req.query.term || '').trim();
  if (!term) return res.status(400).json({ error: 'term query parameter is required' });

  try {
    const result = { term };

    // exact
    const exactRows = await query("SELECT record_code AS id FROM records WHERE record_code = ? LIMIT 5", [term]);
    result.exact = exactRows.map(r => r.id);

    // suffix digits
    const suffixMatch = term.match(/(\d+)$/);
    if (suffixMatch) {
      const digits = suffixMatch[1];
      const suffix = await query("SELECT record_code AS id FROM records WHERE RIGHT(record_code, ?) = ? ORDER BY updated_at DESC LIMIT 10", [digits.length, digits]);
      result.suffix = suffix.map(r => r.id);
      const like = await query("SELECT record_code AS id FROM records WHERE record_code LIKE ? ORDER BY updated_at DESC LIMIT 10", [`%${digits}`]);
      result.likeDigits = like.map(r => r.id);
    }

    // broader like
    const likeTerm = await query("SELECT record_code AS id FROM records WHERE record_code LIKE ? ORDER BY updated_at DESC LIMIT 20", [`%${term}%`]);
    result.like = likeTerm.map(r => r.id);

    // hyphen stripped
    const noHyphen = term.replace(/-/g, '');
    const stripped = await query("SELECT record_code AS id FROM records WHERE REPLACE(record_code, '-', '') = ? LIMIT 10", [noHyphen]);
    result.stripped = stripped.map(r => r.id);

    return res.json(result);
  } catch (err) {
    console.error('debug-records failed:', err);
    return res.status(500).json({ error: 'debug query failed' });
  }
});

app.get("/api/reports", async (req, res) => {
  const { dept, startDate, endDate } = req.query;
  const recordConditions = [];
  const recordParams = [];

  if (startDate) {
    recordConditions.push("DATE(r.created_at) >= ?");
    recordParams.push(startDate);
  }
  if (endDate) {
    recordConditions.push("DATE(r.created_at) <= ?");
    recordParams.push(endDate);
  }
  if (!startDate && !endDate) {
    recordConditions.push("DATE(r.created_at) >= DATE_FORMAT(CURDATE(), '%Y-%m-01')");
  }
  if (dept) {
    recordConditions.push("r.dept = ?");
    recordParams.push(dept);
  }

  const recordWhere = recordConditions.length ? `WHERE ${recordConditions.join(" AND ")}` : "";

  const activityConditions = [];
  const activityParams = [];
  if (startDate) {
    activityConditions.push("DATE(jl.created_at) >= ?");
    activityParams.push(startDate);
  }
  if (endDate) {
    activityConditions.push("DATE(jl.created_at) <= ?");
    activityParams.push(endDate);
  }
  if (!startDate && !endDate) {
    activityConditions.push("DATE(jl.created_at) >= DATE_FORMAT(CURDATE(), '%Y-%m-01')");
  }
  if (dept) {
    activityConditions.push("r.dept = ?");
    activityParams.push(dept);
  }
  const activityWhere = activityConditions.length ? `WHERE ${activityConditions.join(" AND ")}` : "";

  try {
    const deptRows = await query(
      `SELECT r.dept, COUNT(*) AS count FROM records r ${recordWhere} GROUP BY r.dept ORDER BY count DESC`,
      recordParams
    );

    const statusRows = await query(
      `SELECT r.status, COUNT(*) AS count FROM records r ${recordWhere} GROUP BY r.status`,
      recordParams
    );

    const documentRows = await query(
      `SELECT r.record_code AS id, r.name, r.dept, r.status, r.handler, r.location, r.priority, r.sender_email,
        DATE_FORMAT(r.created_at, '%Y-%m-%d') AS created_at,
        DATE_FORMAT(r.updated_at, '%Y-%m-%d %T') AS updated_at,
        DATE_FORMAT(r.due_date, '%Y-%m-%d') AS due_date,
        (SELECT COUNT(*) FROM journey_logs jl WHERE jl.record_code = r.record_code AND jl.action LIKE '%approved%') AS approvedCount,
        (SELECT COUNT(*) FROM journey_logs jl WHERE jl.record_code = r.record_code AND jl.action LIKE '%rejected%') AS rejectedCount,
        (SELECT COUNT(*) FROM journey_logs jl WHERE jl.record_code = r.record_code AND jl.action LIKE '%pending%') AS pendingCount
      FROM records r
      ${recordWhere}
      ORDER BY r.updated_at DESC
      LIMIT 200`,
      recordParams
    );

    const userActivityRows = await query(
      `SELECT TRIM(SUBSTRING_INDEX(jl.meta, '·', 1)) AS user,
        COUNT(*) AS actions,
        SUM(CASE WHEN jl.action LIKE '%Approved%' OR jl.action LIKE '%approved%' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN jl.action LIKE '%Rejected%' OR jl.action LIKE '%reject%' THEN 1 ELSE 0 END) AS rejected,
        SUM(CASE WHEN jl.action LIKE '%Pending%' OR jl.action LIKE '%pending%' THEN 1 ELSE 0 END) AS pending
      FROM journey_logs jl
      LEFT JOIN records r ON jl.record_code = r.record_code
      ${activityWhere}
      GROUP BY TRIM(SUBSTRING_INDEX(jl.meta, '·', 1))
      ORDER BY actions DESC
      LIMIT 50`,
      activityParams
    );

    const delayedWhere = recordWhere ? `${recordWhere} AND r.status IN ('pending', 'transit', 'active') AND (r.updated_at IS NULL OR r.updated_at <= DATE_SUB(NOW(), INTERVAL 7 DAY))` : "WHERE r.status IN ('pending', 'transit', 'active') AND (r.updated_at IS NULL OR r.updated_at <= DATE_SUB(NOW(), INTERVAL 7 DAY))";
    const delayedRows = await query(
      `SELECT r.record_code AS id, r.name, r.dept, r.status, r.handler, r.location,
        DATE_FORMAT(r.updated_at, '%Y-%m-%d %T') AS updated_at
      FROM records r
      ${delayedWhere}
      ORDER BY r.updated_at DESC
      LIMIT 200`,
      recordParams
    );

    const cards = [
      { title: "Monthly overview", desc: "Records registered, transitioned & resolved per month" },
      { title: "User activity", desc: "Actions and approvals by handler for the selected period" },
      { title: "Status summary", desc: "Approved, rejected, pending and transit record counts" },
      { title: "Department load", desc: "Document volume per department for the selected period" },
      { title: "Delay documents", desc: "Documents currently pending or in transit not yet approved/rejected" },
      { title: "Document detail", desc: "Record-level details with status counts and timestamps" },
      { title: "Audit view", desc: "Journey activity filtered by department and time window" },
    ];

    return res.json({
      cards,
      departmentVolumes: deptRows.map(row => ({ label: row.dept, pct: Math.min(100, Math.max(5, Math.round((row.count / (deptRows[0]?.count || 1)) * 100))), val: `${row.count}` })),
      statusCounts: statusRows,
      delayDocuments: delayedRows,
      documentDetails: documentRows,
      userActivity: userActivityRows,
    });
  } catch (error) {
    console.error(error);
    return sendError(res, "Unable to load report data.");
  }
});

// Add new admin user
app.post("/api/admins", requireAdmin, async (req, res) => {
  const { name, email, password, role, department, category } = req.body;

  if (!name || !email || !password || !department) {
    return sendError(res, "Name, email, password, and department are required.", 400);
  }

  try {
    await query(
      "INSERT INTO admins (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)",
      [name, email, password, role || "admin", department]
    );

    await query(
      `INSERT INTO users (name, email, role, department, category, docs, scans, online)
       VALUES (?, ?, ?, ?, ?, 0, 0, false)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         role = VALUES(role),
         department = VALUES(department),
         category = VALUES(category),
         online = VALUES(online)`,
      [name, email, role || "admin", department, category || ""]
    );

    const [admin] = await query(
      "SELECT id, name, email, role, department FROM admins WHERE email = ? LIMIT 1",
      [email]
    );

    return res.status(201).json({ admin, message: "Admin user created successfully." });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY") {
      return sendError(res, "Email already exists.", 400);
    }

    if (error.code === "ER_BAD_FIELD_ERROR" && error.message?.includes("department")) {
      try {
        await query("ALTER TABLE admins ADD COLUMN department VARCHAR(100) NOT NULL DEFAULT 'Administration'");
        await query(
          "INSERT INTO admins (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)",
          [name, email, password, role || "admin", department]
        );

        await query(
          `INSERT INTO users (name, email, role, department, docs, scans, online)
           VALUES (?, ?, ?, ?, 0, 0, false)
           ON DUPLICATE KEY UPDATE
             name = VALUES(name),
             role = VALUES(role),
             department = VALUES(department),
             online = VALUES(online)`,
          [name, email, role || "admin", department]
        );

        const [admin] = await query(
          "SELECT id, name, email, role, department FROM admins WHERE email = ? LIMIT 1",
          [email]
        );

        return res.status(201).json({ admin, message: "Admin user created successfully." });
      } catch (retryError) {
        console.error("Retry after adding department column failed:", retryError);
        return sendError(res, retryError.message || "Unable to create admin user.");
      }
    }

    return sendError(res, error.message || "Unable to create admin user.");
  }
});

// Add new staff user
app.post("/api/users", requireAdmin, async (req, res) => {
  const { name, email, role, department, category } = req.body;

  if (!name || !email || !department) {
    return sendError(res, "Name, email, and department are required.", 400);
  }

  try {
    await query(
      "INSERT INTO users (name, email, role, department, category, docs, scans, online) VALUES (?, ?, ?, ?, ?, 0, 0, false)",
      [name, email, role || "staff", department, category || ""]
    );

    const [user] = await query(
      "SELECT name, email, role, department, category, docs AS docsCount, scans AS scansCount, online FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    return res.status(201).json({ user, message: "User created successfully." });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY") {
      return sendError(res, "Email already exists.", 400);
    }
    return sendError(res, "Unable to create user.");
  }
});

async function ensureAdminDepartmentColumn() {
  try {
    const columns = await query("SHOW COLUMNS FROM admins LIKE 'department'");
    if (!columns || columns.length === 0) {
      await query("ALTER TABLE admins ADD COLUMN department VARCHAR(100) NOT NULL DEFAULT 'Administration'");
      await query("UPDATE admins SET department = 'Administration' WHERE department IS NULL OR department = ''");
      console.log("DocTrack backend: added missing admins.department column.");
    }
  } catch (error) {
    console.error("DocTrack backend: failed to ensure admins.department column", error);
  }
}

async function ensureUserCategoryColumn() {
  try {
    const columns = await query("SHOW COLUMNS FROM users LIKE 'category'");
    if (!columns || columns.length === 0) {
      await query("ALTER TABLE users ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT ''");
      await query("UPDATE users SET category = '' WHERE category IS NULL");
      console.log("DocTrack backend: added missing users.category column.");
    }
  } catch (error) {
    console.error("DocTrack backend: failed to ensure users.category column", error);
  }
}

let initializationPromise;

export function initializeApp() {
  if (!initializationPromise) {
    initializationPromise = Promise.all([
      ensureAdminDepartmentColumn(),
      ensureUserCategoryColumn(),
    ]);
  }

  return initializationPromise;
}

export default app;
