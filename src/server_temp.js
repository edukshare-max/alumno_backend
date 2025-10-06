import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { signToken, authMiddleware } from "./auth.js";
import { getCarnetByMatricula, getCitasByMatricula, createPromocionSalud, getPromocionesActivasForStudent } from "./cosmos.js";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

// CORS Configuration - Hardcoded to bypass env var issues
const allowedOrigins = [
  'https://app.carnetdigital.space',
  'https://carnetdigital.space',
  'https://www.carnetdigital.space',
  'https://edukshare-max.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:3000'
];

console.log('🌐 CORS configured for origins:', allowedOrigins);

app.use(cors({
  origin: (origin, cb) => {
    console.log(`🔍 CORS check for origin: ${origin}`);
    if (!origin || allowedOrigins.includes(origin)) {
      console.log(`✅ CORS allowed for origin: ${origin}`);
      return cb(null, true);
    }
    console.warn(`❌ CORS blocked origin: ${origin}`);
    cb(new Error("Not allowed by CORS"));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Health Check
app.get("/_health", (req, res) => {
  res.json({ ok: true, service: "alumno-backend-node", timestamp: new Date().toISOString() });
});

// Simple test endpoint (no dependencies)
app.get("/test/simple", (req, res) => {
  res.json({ 
    message: "Endpoint simple funcionando", 
    timestamp: new Date().toISOString(),
    version: "2025-10-06-systematic"
  });
});

// Authentication Endpoint
app.post("/auth/login", async (req, res) => {
  let { email, matricula } = req.body || {};
  
  if (!email || !matricula) {
    return res.status(400).json({ error: "Email and matricula are required" });
  }
  
  // Normalize inputs
  email = String(email).trim().toLowerCase();
  matricula = String(matricula).trim();
  
  try {
    const carnet = await getCarnetByMatricula(matricula);
    
    if (!carnet) {
      console.log(`Login attempt failed: matricula ${matricula} not found`);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    if (!carnet.correo) {
      console.log(`Login attempt failed: no email in carnet for matricula ${matricula}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const carnetEmail = String(carnet.correo).trim().toLowerCase();
    if (carnetEmail !== email) {
      console.log(`Login attempt failed: email mismatch for matricula ${matricula}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const access_token = signToken({ matricula, email });
    console.log(`Successful login for matricula ${matricula}`);
    
    res.json({ 
      access_token, 
      token_type: "bearer",
      expires_in: parseInt(process.env.JWT_EXPIRES_MIN || "120") * 60
    });
    
  } catch (err) {
    console.error(`Login error for matricula ${matricula}:`, err.message);
    res.status(500).json({ error: "Authentication service temporarily unavailable" });
  }
});

// Protected: Get Student Carnet
app.get("/me/carnet", authMiddleware, async (req, res) => {
  try {
    const carnet = await getCarnetByMatricula(req.user.matricula);
    
    if (!carnet) {
      return res.status(404).json({ error: "Carnet not found" });
    }
    
    // Los campos internos ya se filtran en cosmos.js
    res.json(carnet);
    
  } catch (err) {
    console.error(`Error getting carnet for matricula ${req.user.matricula}:`, err.message);
    res.status(500).json({ error: "Service temporarily unavailable" });
  }
});

// Protected: Get Student Citas
app.get("/me/citas", authMiddleware, async (req, res) => {
  try {
    const citas = await getCitasByMatricula(req.user.matricula);
    res.json(Array.isArray(citas) ? citas : []);
    
  } catch (err) {
    console.error(`Error getting citas for matricula ${req.user.matricula}:`, err.message);
    res.status(500).json({ error: "Service temporarily unavailable" });
  }
});

// ** REMOVED CATCH-ALL MIDDLEWARE FROM HERE **
// (Moved to end of file to allow all routes to be defined first)

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// =========================================================================
// CATCH-ALL MIDDLEWARE (MUST BE LAST - after all route definitions)
// =========================================================================

// [PROMOCIONES WILL BE INSERTED HERE]


  }

    res.status(500).json({ error: 'Error interno del servidor' });

    console.error('Error getting promociones:', error);

  } catch (error) {

    res.json(promociones);

    const promociones = await getPromocionesActivasForStudent(matricula);

    const matricula = req.user.matricula;

  try {

app.get('/me/promociones', authMiddleware, async (req, res) => {



});

  }

    res.status(500).json({ error: 'Error interno del servidor' });

    console.error('Error creating promocion:', error);

  } catch (error) {

    res.json({ success: true, id: promocion.id, message: 'Promocion creada exitosamente' });

    const promocion = await createPromocionSalud(promocionData);

    

    };

      prioridad

      matriculaEspecifica: matriculaEspecifica || null,

      grupoObjetivo,

      descripcion,

      enlace,

      departamento,

    const promocionData = {

    

    }

      return res.status(400).json({ error: 'Faltan campos requeridos' });

    if (!departamento || !enlace || !descripcion || !grupoObjetivo || !prioridad) {

    

    }

      return res.status(401).json({ error: 'Master key invalida' });

    if (masterKey !== 'Promocionsalud2025') {

    

    const { departamento, enlace, descripcion, grupoObjetivo, matriculaEspecifica, prioridad, masterKey } = req.body;

  try {

app.post('/promociones/health', async (req, res) => {




// ==============================================================================

// PROMOCIONES DE SALUD - Endpoints

// ==============================================================================


Invoke-RestMethod -Headers @{Authorization="Bearer $TOKEN"} -Uri http://localhost:10000/me/citas
Invoke-RestMethod -Headers @{Authorization="Bearer $TOKEN"} -Uri http://localhost:10000/me/carnet
# Rutas protegidas

$TOKEN = $login.access_token
$login = Invoke-RestMethod -Method Post -Uri http://localhost:10000/auth/login -ContentType application/json -Body $body
$body = @{ email="correo@uagro.mx"; matricula="2025" } | ConvertTo-Json
# Login (usar matrícula/email que existan en SASU/carnets_id)

Invoke-RestMethod http://localhost:10000/_health
# Salud

SMOKE TEST (PowerShell):
/*

});
  console.log(`🔒 CORS origins: ${allowedOrigins.join(", ") || "None configured"}`);
  console.log(`📊 Health check: http://localhost:${PORT}/_health`);
  console.log(`🚀 alumno-backend-node listening on port ${PORT}`);
app.listen(PORT, () => {
const PORT = process.env.PORT || 10000;

});
  res.status(404).json({ error: "Endpoint not found" });
app.use("*", (req, res) => {
// =========================================================================
// CATCH-ALL MIDDLEWARE (MUST BE LAST - after all route definitions)
// =========================================================================

});
  res.status(500).json({ error: "Internal server error" });
  console.error("Unhandled error:", err.message);
app.use((err, req, res, next) => {
// Global error handler

// (Moved to end of file to allow all routes to be defined first)
// ** REMOVED CATCH-ALL MIDDLEWARE FROM HERE **

});
  }
    res.status(500).json({ error: "Service temporarily unavailable" });
    console.error(`Error getting citas for matricula ${req.user.matricula}:`, err.message);
  } catch (err) {
    
    res.json(Array.isArray(citas) ? citas : []);
    const citas = await getCitasByMatricula(req.user.matricula);
  try {
app.get("/me/citas", authMiddleware, async (req, res) => {
// Protected: Get Student Citas

});
  }
    res.status(500).json({ error: "Service temporarily unavailable" });
    console.error(`Error getting carnet for matricula ${req.user.matricula}:`, err.message);
  } catch (err) {
    
    res.json(carnet);
    // Los campos internos ya se filtran en cosmos.js
    
    }
      return res.status(404).json({ error: "Carnet not found" });
    if (!carnet) {
    
    const carnet = await getCarnetByMatricula(req.user.matricula);
  try {
app.get("/me/carnet", authMiddleware, async (req, res) => {
// Protected: Get Student Carnet

});
  }
    res.status(500).json({ error: "Authentication service temporarily unavailable" });
    console.error(`Login error for matricula ${matricula}:`, err.message);
  } catch (err) {
    
    });
      expires_in: parseInt(process.env.JWT_EXPIRES_MIN || "120") * 60
      token_type: "bearer",
      access_token, 
    res.json({ 
    
    console.log(`Successful login for matricula ${matricula}`);
    const access_token = signToken({ matricula, email });
    
    }
      return res.status(401).json({ error: "Invalid credentials" });
      console.log(`Login attempt failed: email mismatch for matricula ${matricula}`);
    if (carnetEmail !== email) {
    const carnetEmail = String(carnet.correo).trim().toLowerCase();
    
    }
      return res.status(401).json({ error: "Invalid credentials" });
      console.log(`Login attempt failed: no email in carnet for matricula ${matricula}`);
    if (!carnet.correo) {
    
    }
      return res.status(401).json({ error: "Invalid credentials" });
      console.log(`Login attempt failed: matricula ${matricula} not found`);
    if (!carnet) {
    
    const carnet = await getCarnetByMatricula(matricula);
  try {
  
  matricula = String(matricula).trim();
  email = String(email).trim().toLowerCase();
  // Normalize inputs
  
  }
    return res.status(400).json({ error: "Email and matricula are required" });
  if (!email || !matricula) {
  
  let { email, matricula } = req.body || {};
app.post("/auth/login", async (req, res) => {
// Authentication Endpoint

});
  });
    version: "2025-10-06-systematic"
    timestamp: new Date().toISOString(),
    message: "Endpoint simple funcionando", 
  res.json({ 
app.get("/test/simple", (req, res) => {
// Simple test endpoint (no dependencies)

});
  res.json({ ok: true, service: "alumno-backend-node", timestamp: new Date().toISOString() });
app.get("/_health", (req, res) => {
// Health Check

}));
  credentials: true
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  methods: ['GET', 'POST', 'OPTIONS'],
  },
    cb(new Error("Not allowed by CORS"));
    console.warn(`❌ CORS blocked origin: ${origin}`);
    }
      return cb(null, true);
      console.log(`✅ CORS allowed for origin: ${origin}`);
    if (!origin || allowedOrigins.includes(origin)) {
    console.log(`🔍 CORS check for origin: ${origin}`);
  origin: (origin, cb) => {
app.use(cors({

console.log('🌐 CORS configured for origins:', allowedOrigins);

];
  'http://127.0.0.1:3000'
  'http://localhost:5173',
  'https://edukshare-max.github.io',
  'https://www.carnetdigital.space',
  'https://carnetdigital.space',
  'https://app.carnetdigital.space',
const allowedOrigins = [
// CORS Configuration - Hardcoded to bypass env var issues

app.use(express.json({ limit: "10mb" }));
const app = express();

dotenv.config();

import { getCarnetByMatricula, getCitasByMatricula, createPromocionSalud, getPromocionesActivasForStudent } from "./cosmos.js";
import { signToken, authMiddleware } from "./auth.js";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
*/
