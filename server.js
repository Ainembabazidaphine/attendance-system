import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";

let pool;

// Lazy-initialize MySQL connection
async function getDb() {
  if (!pool) {
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'edutrack_pro',
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0,
        connectTimeout: 2000 // Short timeout to avoid hanging cloud preview
      });
      // Test connection
      await pool.query('SELECT 1');
      console.log("✅ MySQL Connected (WAMP/Local)");
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
        console.info("ℹ️ Local MySQL (WAMP/XAMPP) not reachable. This is standard behavior for the Cloud Preview.");
        console.info("ℹ️ Using Firebase & Mock Data as the primary database for this session.");
      } else {
        console.warn("⚠️ MySQL Connection issue:", error.message);
      }
      pool = null; 
      return null;
    }
  }
  return pool;
}

// Helper to wrap DB queries with error handling or fallback
const memoryDb = {
  users: [
    { uid: 'sim_admin_0', name: 'Mugisha Atwine', email: '001@nextgen.ac.com', password: 'Admin826', role: 'admin', status: 'active', createdAt: new Date().toISOString() },
    { uid: 'sim_it', name: 'Okello Solomon', email: '999@nextgen.ac.com', password: 'Supp9123', role: 'it_admin', status: 'active', createdAt: new Date().toISOString() },
    { uid: 'sim_t1', name: 'Namubiru Sarah', email: '2001@nextgen.ac.com', password: 'Teac9456', role: 'teacher', status: 'active', classId: 'S4', createdAt: new Date().toISOString() },
  ],
  attendance: [],
  reports: []
};

async function queryDb(sql, params) {
  const db = await getDb();
  if (db) {
    return db.query(sql, params);
  }

  // FALLBACK: Simple In-Memory Query Simulator for Cloud Preview
  const upperSql = sql.toUpperCase();
  console.info("⚡ Using MemoryDb Fallback for:", sql.split(' ')?.[0]);

  if (upperSql.includes("SELECT * FROM USERS")) {
    let results = [...memoryDb.users];
    if (params.length > 0) {
      if (upperSql.includes("WHERE EMAIL = ? AND PASSWORD = ?")) {
        results = results.filter(u => u.email === params[0] && u.password === params[1]);
      } else if (upperSql.includes("ROLE = ?") && upperSql.includes("CLASSID = ?")) {
        results = results.filter(u => u.role === params[0] && u.classId === params[1]);
      }
    }
    return [results];
  }

  if (upperSql.includes("INSERT INTO USERS")) {
    const [uid, name, email, password, role, classId, status] = params;
    const existingIdx = memoryDb.users.findIndex(u => u.uid === uid);
    if (existingIdx > -1) {
      memoryDb.users[existingIdx] = { ...memoryDb.users[existingIdx], name, role, classId, status };
    } else {
      memoryDb.users.push({ uid, name, email, password, role, classId, status, createdAt: new Date().toISOString() });
    }
    return [{ affectedRows: 1 }];
  }

  if (upperSql.includes("UPDATE USERS SET")) {
    const [name, role, classId, status, uid] = params;
    const user = memoryDb.users.find(u => u.uid === uid);
    if (user) {
      if (name) user.name = name;
      if (role) user.role = role;
      if (classId) user.classId = classId;
      if (status) user.status = status;
    }
    return [{ affectedRows: user ? 1 : 0 }];
  }

  if (upperSql.includes("DELETE FROM USERS")) {
    memoryDb.users = memoryDb.users.filter(u => u.uid !== params[0]);
    return [{ affectedRows: 1 }];
  }

  if (upperSql.includes("SELECT * FROM ATTENDANCE")) {
    let results = [...memoryDb.attendance];
    if (params.length > 0) {
      results = results.filter(a => a.userId === params[0] || a.classId === params[0]);
    }
    return [results.sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at))];
  }

  if (upperSql.includes("INSERT INTO ATTENDANCE")) {
    memoryDb.attendance.push({
      id: Math.random().toString(36).substr(2, 9),
      userId: params[0],
      userName: params[1],
      status: params[2],
      attendance_date: params[3],
      subject: params[4],
      classId: params[5],
      entry_type: params[6],
      recorded_at: new Date().toISOString()
    });
    return [{ affectedRows: 1 }];
  }

  if (upperSql.includes("SELECT * FROM REPORTS")) {
    return [[...memoryDb.reports].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))];
  }

  if (upperSql.includes("INSERT INTO REPORTS")) {
    memoryDb.reports.push({
      id: Math.random().toString(36).substr(2, 9),
      authorId: params[0],
      authorName: params[1],
      title: params[2],
      content: params[3],
      fileName: params[4],
      report_type: params[5],
      status: 'pending',
      timestamp: new Date().toISOString()
    });
    return [{ affectedRows: 1 }];
  }

  if (upperSql.includes("UPDATE REPORTS SET STATUS")) {
    const report = memoryDb.reports.find(r => r.id == params[1]);
    if (report) report.status = params[0];
    return [{ affectedRows: report ? 1 : 0 }];
  }

  throw new Error("Local MySQL not reachable and MemoryDb query not simulated");
}

const __filename = fileURLToPath(import.meta.url);
path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // --- MySQL API ROUTES ---

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const [rows] = await queryDb("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);
      if (rows.length > 0) {
        res.json({ success: true, user: rows[0] });
      } else {
        res.status(401).json({ error: "Invalid institutional credentials" });
      }
    } catch (error) {
      console.error("Login Error:", error.message);
      res.status(500).json({ error: "Authentication system offline" });
    }
  });

  // 1. Personnel Management
  app.get("/api/users", async (req, res) => {
    const { role, classId } = req.query;
    try {
      let sql = "SELECT * FROM users";
      const params = [];
      const filters = [];

      if (role) {
        filters.push("role = ?");
        params.push(role);
      }
      if (classId) {
        filters.push("classId = ?");
        params.push(classId);
      }

      if (filters.length > 0) {
        sql += " WHERE " + filters.join(" AND ");
      }

      sql += " ORDER BY createdAt DESC";
      const [rows] = await queryDb(sql, params);
      res.json(rows);
    } catch (error) {
      console.warn("MySQL Fetch issue:", error.message);
      res.status(503).json({ error: "Personnel database currently offline (Local PC/WAMP)" });
    }
  });

  app.post("/api/users", async (req, res) => {
    const { uid, name, email, password, role, classId, status } = req.body;
    try {
      await queryDb(
        "INSERT INTO users (uid, name, email, password, role, classId, status) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?, role=?, classId=?, status=?",
        [uid, name, email, password, role, classId, status || 'active', name, role, classId, status || 'active']
      );
      res.json({ success: true, message: "User synchronized with MySQL" });
    } catch (error) {
      console.error("MySQL Insert Error:", error.message);
      res.status(503).json({ error: "Local database sync unavailable" });
    }
  });

  app.put("/api/users/:uid", async (req, res) => {
    const { name, role, classId, status } = req.body;
    try {
      await queryDb(
        "UPDATE users SET name = COALESCE(?, name), role = COALESCE(?, role), classId = COALESCE(?, classId), status = COALESCE(?, status) WHERE uid = ?",
        [name, role, classId, status, req.params.uid]
      );
      res.json({ success: true });
    } catch (error) {
      console.error("User update error:", error.message);
      res.status(503).json({ error: "Update failed" });
    }
  });

  app.delete("/api/users/:uid", async (req, res) => {
    try {
      await queryDb("DELETE FROM users WHERE uid = ?", [req.params.uid]);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete error:", error.message);
      res.status(503).json({ error: "Local database sync unavailable" });
    }
  });

  // 2. Attendance Tracking
  app.get("/api/attendance", async (req, res) => {
    const { userId, classId } = req.query;
    try {
      let sql = "SELECT * FROM attendance";
      const params = [];
      
      if (userId) {
        sql += " WHERE userId = ?";
        params.push(userId);
      } else if (classId) {
        sql += " WHERE classId = ?";
        params.push(classId);
      }
      
      sql += " ORDER BY recorded_at DESC LIMIT 100";
      const [rows] = await queryDb(sql, params);
      res.json(rows);
    } catch (error) {
      console.warn("Attendance Fetch Error:", error.message);
      res.status(503).json({ error: "Local attendance logs offline" });
    }
  });

  app.post("/api/attendance", async (req, res) => {
    const { userId, userName, status, subject, classId, entry_type } = req.body;
    try {
      const today = new Date().toISOString().split('T')[0];
      await queryDb(
        "INSERT INTO attendance (userId, userName, status, attendance_date, subject, classId, entry_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [userId, userName, status, today, subject, classId, entry_type]
      );
      res.json({ success: true });
    } catch (error) {
      console.error("MySQL Attendance Error:", error.message);
      res.status(503).json({ error: "Local attendance recording unavailable" });
    }
  });

  // 3. Faculty Reports
  app.get("/api/reports", async (req, res) => {
    try {
      const [rows] = await queryDb("SELECT * FROM reports ORDER BY timestamp DESC");
      res.json(rows);
    } catch (error) {
      console.error("Reports Fetch Error:", error.message);
      res.status(503).json({ error: "Local reports archive offline" });
    }
  });

  app.post("/api/reports", async (req, res) => {
    const { authorId, authorName, title, content, fileName, report_type } = req.body;
    try {
      await queryDb(
        "INSERT INTO reports (authorId, authorName, title, content, fileName, report_type) VALUES (?, ?, ?, ?, ?, ?)",
        [authorId, authorName, title, content, fileName, report_type]
      );
      res.json({ success: true });
    } catch (error) {
      console.error("Report Post Error:", error.message);
      res.status(503).json({ error: "Local report submission unavailable" });
    }
  });

  app.patch("/api/reports/:id/status", async (req, res) => {
    const { status } = req.body;
    try {
      await queryDb("UPDATE reports SET status = ? WHERE id = ?", [status, req.params.id]);
      res.json({ success: true });
    } catch (error) {
      console.error("Status update error:", error.message);
      res.status(503).json({ error: "Update failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
