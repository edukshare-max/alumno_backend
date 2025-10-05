import { CosmosClient } from "@azure/cosmos";
import dotenv from "dotenv";
dotenv.config();

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DB;
const containerCarnets = process.env.COSMOS_CONTAINER_CARNETS;
const containerCitas = process.env.COSMOS_CONTAINER_CITAS;

if (!endpoint || !key || !databaseId || !containerCarnets || !containerCitas) {
  console.error("Missing required Cosmos DB environment variables:");
  console.error("COSMOS_ENDPOINT:", endpoint ? "✅" : "❌");
  console.error("COSMOS_KEY:", key ? "✅" : "❌"); 
  console.error("COSMOS_DB:", databaseId ? "✅" : "❌");
  console.error("COSMOS_CONTAINER_CARNETS:", containerCarnets ? "✅" : "❌");
  console.error("COSMOS_CONTAINER_CITAS:", containerCitas ? "✅" : "❌");
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
