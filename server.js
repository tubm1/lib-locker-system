const express = require("express");
const db = require("./database");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-this",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 30 * 60 * 1000
    }
}));
app.use(express.static("public"));

app.post("/api/login", function (req, res) {
    const { username, password } = req.body;

    if (
        typeof username !== "string" ||
        typeof password !== "string" ||
        !username.trim() ||
        !password
    ) {
        return res.status(400).json({
            message: "Vui lòng nhập username và password."
        });
    }

    const user = db.prepare(`
        SELECT id, username, password_hash, role
        FROM users
        WHERE username = ?
    `).get(username.trim());

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({
            message: "Tên đăng nhập hoặc mật khẩu không đúng."
        });
    }

    req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role
    };

    return res.json({
        message: "Đăng nhập thành công.",
        user: {
            id: user.id,
            username: user.username,
            role: user.role
        }
    });
});

app.get("/api/me", function (req, res) {
    if (!req.session.user) {
        return res.status(401).json({
            message: "Bạn chưa đăng nhập."
        });
    }

    res.json({
        user: req.session.user
    });
});

app.get("/api/lockers", function (req, res) {
    const lockers = db.prepare(`
        SELECT
            lockers.id,
            lockers.status,
            users.username AS owner
        FROM lockers
        LEFT JOIN users ON lockers.owner_id = users.id
        ORDER BY lockers.id
    `).all();

    res.json(lockers);
});

app.post("/api/lockers/:id/claim", function (req, res) {
    const user = req.session.user;

    if (!user) {
        return res.status(401).json({
            message: "Bạn cần đăng nhập trước."
        });
    }

    if (user.role !== "student") {
        return res.status(403).json({
            message: "Chỉ sinh viên mới được nhận tủ."
        });
    }

    const lockerId = Number(req.params.id);

    if (!Number.isInteger(lockerId) || lockerId < 1 || lockerId > 24) {
        return res.status(400).json({
            message: "Mã tủ không hợp lệ."
        });
    }

    const claimLocker = db.transaction(() => {
        const locker = db.prepare(`
            SELECT id, status, owner_id
            FROM lockers
            WHERE id = ?
        `).get(lockerId);

        if (!locker) {
            return { error: "Không tìm thấy tủ.", status: 404 };
        }

        if (locker.status !== "FREE" || locker.owner_id !== null) {
            return {
                error: "Tủ này không còn trống.",
                status: 409
            };
        }

        const existingLocker = db.prepare(`
            SELECT id
            FROM lockers
            WHERE owner_id = ?
        `).get(user.id);

        if (existingLocker) {
            return {
                error: "Bạn đã sở hữu một tủ khác.",
                status: 409
            };
        }

        db.prepare(`
            UPDATE lockers
            SET status = 'OCCUPIED', owner_id = ?
            WHERE id = ? AND status = 'FREE' AND owner_id IS NULL
        `).run(user.id, lockerId);

        return { success: true };
    });

    try {
        const result = claimLocker();

        if (result.error) {
            return res.status(result.status).json({
                message: result.error
            });
        }

        return res.json({
            message: "Nhận tủ thành công.",
            lockerId: lockerId
        });
    } catch (error) {
        console.error("Claim locker failed:", error);
        return res.status(500).json({
            message: "Có lỗi khi nhận tủ."
        });
    }
});

app.get("/api/health", function (req, res) {
    res.json({
        status: "OK",
        message: "Library Locker backend is running!"
    });
});

app.listen(PORT, function () {
    console.log(`Server is running at http://localhost:${PORT}`);
});
