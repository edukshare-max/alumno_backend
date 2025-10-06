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

// Error handler for unmatched routes
app.use("*", (req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 alumno-backend-node listening on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/_health`);
  console.log(`🔒 CORS origins: ${allowedOrigins.join(", ") || "None configured"}`);
});

/*
SMOKE TEST (PowerShell):

# Salud
Invoke-RestMethod http://localhost:10000/_health

# Login (usar matrícula/email que existan en SASU/carnets_id)
$body = @{ email="correo@uagro.mx"; matricula="2025" } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri http://localhost:10000/auth/login -ContentType application/json -Body $body
$TOKEN = $login.access_token

# Rutas protegidas
Invoke-RestMethod -Headers @{Authorization="Bearer $TOKEN"} -Uri http://localhost:10000/me/carnet
Invoke-RestMethod -Headers @{Authorization="Bearer $TOKEN"} -Uri http://localhost:10000/me/citas


// ==============================================================================

// PROMOCIONES DE SALUD - Endpoints

// ==============================================================================




app.post('/promociones/health', authMiddleware, async (req, res) => {

  try {

    const { departamento, enlace, descripcion, grupoObjetivo, matriculaEspecifica, prioridad, masterKey } = req.body;

    

    if (masterKey !== 'Promocionsalud2025') {

      return res.status(401).json({ error: 'Master key invalida' });

    }

    

    if (!departamento || !enlace || !descripcion || !grupoObjetivo || !prioridad) {

      return res.status(400).json({ error: 'Faltan campos requeridos' });

    }

    

    const promocionData = {

      departamento,

      enlace,

      descripcion,

      grupoObjetivo,

      matriculaEspecifica: matriculaEspecifica || null,

      prioridad

    };

    

    const promocion = await createPromocionSalud(promocionData);

    res.json({ success: true, id: promocion.id, message: 'Promocion creada exitosamente' });

  } catch (error) {

    console.error('Error creating promocion:', error);

    res.status(500).json({ error: 'Error interno del servidor' });

  }

});



app.get('/me/promociones', authMiddleware, async (req, res) => {

  try {

    const matricula = req.user.matricula;

    const promociones = await getPromocionesActivasForStudent(matricula);

    res.json(promociones);

  } catch (error) {

    console.error('Error getting promociones:', error);

    res.status(500).json({ error: 'Error interno del servidor' });

  }

});
*/
