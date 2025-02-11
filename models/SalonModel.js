import db from '../lib/db';

const SalonModel = {
  getAllSalons: async () => {
    return await db.manyOrNone('SELECT * FROM salons');
  },

  createSalon: async (salon_name, address, phone_no, email, salon_owner_id, opening_time, closing_time, salon_description, salon_picture_url) => {
    return await db.one(
      `INSERT INTO salons (salon_name, address, phone_no, email, salon_owner_id, opening_time, closing_time, salon_description, salon_picture_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [salon_name, address, phone_no, email, salon_owner_id, opening_time, closing_time, salon_description, salon_picture_url]
    );
  },
};

export default SalonModel;