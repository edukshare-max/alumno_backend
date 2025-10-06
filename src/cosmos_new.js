import { CosmosClient } from "@azure/cosmos";
import dotenv from "dotenv";

dotenv.config();

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DB;
const containerCarnets = process.env.COSMOS_CONTAINER_CARNETS;
const containerCitas = process.env.COSMOS_CONTAINER_CITAS;

if (!endpoint || !key || !databaseId || !containerCarnets || !containerCitas) {
  console.error("Missing required Cosmos DB environment variables");
  process.exit(1);
}

const client = new CosmosClient({ endpoint, key });
const db = client.database(databaseId);
const carnets = db.container(containerCarnets);
const citas = db.container(containerCitas);

// Función para filtrar campos internos de Cosmos DB
function filterInternalFields(doc) {
  if (!doc) return null;
  const { _rid, _etag, _ts, _self, _attachments, ...cleanDoc } = doc;
  return cleanDoc;
}

export async function getCarnetByMatricula(matricula) {
  try {
    // Primer intento: readItem con id "carnet:{matricula}"
    const id = `carnet:${matricula}`;
    try {
      const { resource } = await carnets.item(id, id).read();
      return filterInternalFields(resource);
    } catch (err) {
      if (err.code !== 404) throw err;
    }

    // Segundo intento: query por campo matricula
    const query = {
      query: "SELECT * FROM c WHERE c.matricula = @m",
      parameters: [{ name: "@m", value: matricula }],
    };
    const { resources } = await carnets.items.query(query).fetchAll();
    return resources.length > 0 ? filterInternalFields(resources[0]) : null;
  } catch (err) {
    console.error(`Error getting carnet for matricula ${matricula}:`, err.message);
    return null;
  }
}

export async function getCitasByMatricula(matricula) {
  try {
    const query = {
      query: "SELECT * FROM c WHERE c.matricula = @m ORDER BY c.inicio DESC",
      parameters: [{ name: "@m", value: matricula }],
    };
    const { resources } = await citas.items.query(query).fetchAll();
    return resources.map(filterInternalFields);
  } catch (err) {
    console.error(`Error getting citas for matricula ${matricula}:`, err.message);
    return [];
  }
}

// ==============================================================================
// PROMOCIONES DE SALUD - Funciones agregadas para promociones
// ==============================================================================

// Obtener container de promociones de salud
export async function getPromocionesContainer() {
  try {
    const database = client.database(databaseId);
    return database.container('promociones_salud');
  } catch (error) {
    console.error('Error getting promociones container:', error);
    throw error;
  }
}

// Crear nueva promoción de salud
export async function createPromocionSalud(promocionData) {
  try {
    const container = await getPromocionesContainer();
    const result = await container.items.create({
      ...promocionData,
      id: `promo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fechaCreacion: new Date().toISOString(),
      activa: true
    });
    return result.resource;
  } catch (error) {
    console.error('Error creating promocion:', error);
    throw error;
  }
}

// Obtener promociones activas para un estudiante
export async function getPromocionesActivasForStudent(matricula) {
  try {
    const container = await getPromocionesContainer();
    const query = {
      query: `SELECT * FROM c WHERE c.activa = true AND 
              (c.grupoObjetivo = "Todos los estudiantes" OR 
               c.matriculaEspecifica = @matricula) 
              ORDER BY c.fechaCreacion DESC`,
      parameters: [{ name: "@matricula", value: matricula }]
    };
    const { resources } = await container.items.query(query).fetchAll();
    return resources;
  } catch (error) {
    console.error('Error getting promociones for student:', error);
    return [];
  }
}