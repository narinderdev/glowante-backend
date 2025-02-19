import db from '../lib/db';

const CategoryModel = {
  getAllCategory: async () => {
    return await db.manyOrNone('SELECT * FROM category');
  },

  createCategory: async (name, description) => {
    return await db.one(
      `INSERT INTO category (name, description) VALUES ($1, $2) RETURNING *`,
      [name, description]
    );
  },
};

export default CategoryModel;