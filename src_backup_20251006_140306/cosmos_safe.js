import { CosmosClient } from "@azure/cosmos";

// Validar variables de entorno
const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DB;
const containerCarnets = process.env.COSMOS_CONTAINER_CARNETS;
const containerCitas = process.env.COSMOS_CONTAINER_CITAS;

// Si faltan variables, crear funciones dummy que no crasheen
if (!endpoint || !key || !databaseId) {
  console.warn(" Cosmos DB variables not configured. Using dummy functions.");
  
  export async function getCarnetByMatricula(matricula) {
    return { error: "Cosmos DB not configured" };
  }
  
  export async function getCitasByMatricula(matricula) {
    return { error: "Cosmos DB not configured" };
  }
  
  export async function createPromocionSalud(promocionData) {
    return { error: "Cosmos DB not configured" };
  }
  
  export async function getPromocionesActivasForStudent(matricula) {
    return { error: "Cosmos DB not configured" };
  }
} else {
  // Código original de Cosmos DB
  const client = new CosmosClient({ endpoint, key });
  const database = client.database(databaseId);
  
  // ... resto del código original aquí
  console.log(" Cosmos DB configured successfully");
}
