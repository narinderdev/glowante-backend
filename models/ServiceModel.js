import db from '../lib/db';

const ServiceModel = {
  getAllServices: async () => {
    return await db.manyOrNone('SELECT * FROM services');
  },

  createService: async (service_name, description) => {
    return await db.one(
      `INSERT INTO services (service_name, description) VALUES ($1, $2) RETURNING *`,
      [service_name, description]
    );
  },
};

export default ServiceModel;