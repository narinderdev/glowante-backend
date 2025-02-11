import db from '../lib/db';

const UserModel = {
  getAllUsers: async () => {
    return await db.manyOrNone('SELECT * FROM users');
  },

  getUserById: async (id) => {
    return await db.oneOrNone('SELECT * FROM users WHERE id = $1', [id]);
  },

  createUser: async (first_name, last_name, email, password, phone_number, country_code) => {
    return await db.one(
      `INSERT INTO users (first_name, last_name, email, password, phone_number, country_code)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [first_name, last_name, email, password, phone_number, country_code]
    );
  },
};

export default UserModel;