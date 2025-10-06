// ==============================================================================
// PROMOCIONES DE SALUD - Nuevas funciones (No afectan código existente)
// ==============================================================================

// Obtener container de promociones de salud
async function getPromocionesContainer() {
  try {
    const database = cosmosClient.database(databaseName);
    return database.container('promociones_salud');
  } catch (error) {
    console.error('Error getting promociones container:', error);
    throw error;
  }
}

// Crear nueva promoción de salud
async function createPromocionSalud(promocionData) {
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
async function getPromocionesActivasForStudent(matricula) {
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

// ==============================================================================
// EXPORTS - Todas las funciones (existentes + nuevas promociones)
// ==============================================================================
module.exports = {
  // Funciones existentes (asumiendo que existen en el contexto)
  connectToCosmosDB,
  getUserByMatricula,
  updateUserProfile,
  getCitasForMatricula,
  
  // Nuevas funciones de promociones
  getPromocionesContainer,
  createPromocionSalud,
  getPromocionesActivasForStudent
};