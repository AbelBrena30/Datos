const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = "tu_clave_secreta_super_segura_2024";

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Inicializar base de datos
const db = new sqlite3.Database("./datos.db", (err) => {
    if (err) {
        console.error("Error al conectar con la base de datos:", err);
    } else {
        console.log("Conectado a la base de datos SQLite");
        initializeDatabase();
    }
});

// Crear tablas si no existen
function initializeDatabase() {
    // Tabla de usuarios
    db.run(
        `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        has_personal_data BOOLEAN DEFAULT FALSE
    )`,
        (err) => {
            if (err) console.error("Error creando tabla users:", err);
        }
    );

    // Tabla de datos personales
    db.run(
        `CREATE TABLE IF NOT EXISTS personal_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        nombre TEXT,
        fecha_nacimiento TEXT,
        edad INTEGER,
        lugar_nacimiento TEXT,
        ocupacion TEXT,
        escuela TEXT,
        email TEXT,
        numero TEXT,
        direccion TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`,
        (err) => {
            if (err) console.error("Error creando tabla personal_data:", err);
        }
    );

    // Tabla de datos de padres
    db.run(
        `CREATE TABLE IF NOT EXISTS parents_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        padre_nombre TEXT,
        padre_edad INTEGER,
        padre_ocupacion TEXT,
        padre_lugar_nacimiento TEXT,
        padre_numero TEXT,
        madre_nombre TEXT,
        madre_edad INTEGER,
        madre_ocupacion TEXT,
        madre_lugar_nacimiento TEXT,
        madre_numero TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`,
        (err) => {
            if (err) console.error("Error creando tabla parents_data:", err);
        }
    );
}

// Middleware para verificar token
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
        return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Rutas de autenticación
app.post("/api/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res
                .status(400)
                .json({ error: "Todos los campos son requeridos" });
        }

        // Verificar si el usuario ya existe
        db.get(
            "SELECT * FROM users WHERE username = ? OR email = ?",
            [username, email],
            async (err, user) => {
                if (err) {
                    return res
                        .status(500)
                        .json({ error: "Error del servidor" });
                }

                if (user) {
                    return res
                        .status(400)
                        .json({ error: "El usuario o email ya existe" });
                }

                // Encriptar contraseña
                const hashedPassword = await bcrypt.hash(password, 10);

                // Insertar nuevo usuario
                db.run(
                    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                    [username, email, hashedPassword],
                    function (err) {
                        if (err) {
                            return res
                                .status(500)
                                .json({ error: "Error al crear usuario" });
                        }

                        const token = jwt.sign(
                            { id: this.lastID, username },
                            JWT_SECRET
                        );
                        res.status(201).json({
                            token,
                            user: { id: this.lastID, username, email },
                            hasPersonalData: false,
                        });
                    }
                );
            }
        );
    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        db.get(
            "SELECT * FROM users WHERE username = ?",
            [username],
            async (err, user) => {
                if (err) {
                    return res
                        .status(500)
                        .json({ error: "Error del servidor" });
                }

                if (!user) {
                    return res
                        .status(400)
                        .json({ error: "Usuario no encontrado" });
                }

                const validPassword = await bcrypt.compare(
                    password,
                    user.password
                );
                if (!validPassword) {
                    return res
                        .status(400)
                        .json({ error: "Contraseña incorrecta" });
                }

                const token = jwt.sign(
                    { id: user.id, username: user.username },
                    JWT_SECRET
                );
                res.json({
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                    },
                    hasPersonalData: user.has_personal_data,
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }
});

// Rutas para datos personales
app.get("/api/personal-data", authenticateToken, (req, res) => {
    db.get(
        "SELECT * FROM personal_data WHERE user_id = ?",
        [req.user.id],
        (err, data) => {
            if (err) {
                return res.status(500).json({ error: "Error del servidor" });
            }
            res.json(data || {});
        }
    );
});

app.post("/api/personal-data", authenticateToken, (req, res) => {
    const {
        nombre,
        fecha_nacimiento,
        edad,
        lugar_nacimiento,
        ocupacion,
        escuela,
        email,
        numero,
        direccion,
    } = req.body;

    const query = `INSERT OR REPLACE INTO personal_data 
        (user_id, nombre, fecha_nacimiento, edad, lugar_nacimiento, ocupacion, escuela, email, numero, direccion, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;

    db.run(
        query,
        [
            req.user.id,
            nombre,
            fecha_nacimiento,
            edad,
            lugar_nacimiento,
            ocupacion,
            escuela,
            email,
            numero,
            direccion,
        ],
        function (err) {
            if (err) {
                return res
                    .status(500)
                    .json({ error: "Error al guardar datos" });
            }

            // Actualizar flag de datos personales
            db.run("UPDATE users SET has_personal_data = TRUE WHERE id = ?", [
                req.user.id,
            ]);

            res.json({ message: "Datos guardados correctamente" });
        }
    );
});

// Rutas para datos de padres
app.get("/api/parents-data", authenticateToken, (req, res) => {
    db.get(
        "SELECT * FROM parents_data WHERE user_id = ?",
        [req.user.id],
        (err, data) => {
            if (err) {
                return res.status(500).json({ error: "Error del servidor" });
            }
            res.json(data || {});
        }
    );
});

app.post("/api/parents-data", authenticateToken, (req, res) => {
    const {
        padre_nombre,
        padre_edad,
        padre_ocupacion,
        padre_lugar_nacimiento,
        padre_numero,
        madre_nombre,
        madre_edad,
        madre_ocupacion,
        madre_lugar_nacimiento,
        madre_numero,
    } = req.body;

    const query = `INSERT OR REPLACE INTO parents_data 
        (user_id, padre_nombre, padre_edad, padre_ocupacion, padre_lugar_nacimiento, padre_numero,
         madre_nombre, madre_edad, madre_ocupacion, madre_lugar_nacimiento, madre_numero, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;

    db.run(
        query,
        [
            req.user.id,
            padre_nombre,
            padre_edad,
            padre_ocupacion,
            padre_lugar_nacimiento,
            padre_numero,
            madre_nombre,
            madre_edad,
            madre_ocupacion,
            madre_lugar_nacimiento,
            madre_numero,
        ],
        function (err) {
            if (err) {
                return res
                    .status(500)
                    .json({ error: "Error al guardar datos de padres" });
            }

            res.json({ message: "Datos de padres guardados correctamente" });
        }
    );
});

// Ruta para verificar token
app.get("/api/verify-token", authenticateToken, (req, res) => {
    db.get(
        "SELECT has_personal_data FROM users WHERE id = ?",
        [req.user.id],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: "Error del servidor" });
            }
            res.json({
                valid: true,
                user: req.user,
                hasPersonalData: user ? user.has_personal_data : false,
            });
        }
    );
});

// Servir archivos estáticos
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/app", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log("Conexión a la base de datos cerrada.");
        process.exit(0);
    });
});
