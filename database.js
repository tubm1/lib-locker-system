
const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "database.db");
const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

console.log("SQLite database connected successfully.");


db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('student', 'admin'))
    );

    CREATE TABLE IF NOT EXISTS lockers (
        id INTEGER PRIMARY KEY,
        status TEXT NOT NULL DEFAULT 'FREE'
            CHECK (status IN ('FREE', 'OCCUPIED', 'LOCKED', 'FROZEN')),
        owner_id INTEGER UNIQUE,
        FOREIGN KEY (owner_id) REFERENCES users(id)
    );
`);

const lockerCount = db.prepare(
    "SELECT COUNT(*) AS count FROM lockers"
).get().count;

if (lockerCount === 0) {
    const insertLocker = db.prepare(
        "INSERT INTO lockers (id, status) VALUES (?, ?)"
    );

    const createLockers = db.transaction(() => {
        for (let id = 1; id <= 24; id++) {
            insertLocker.run(id, "FREE");
        }
    });

    createLockers();
}

console.log("Users and lockers tables are ready.");

module.exports = db;
