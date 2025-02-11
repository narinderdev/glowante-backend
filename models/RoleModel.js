import db from '../lib/db';

const RoleModel = {
  getAllRoles: async () => {
    return await db.manyOrNone('SELECT * FROM roles');
  },

  assignRoleToUser: async (user_id, role_id) => {
    return await db.none(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
      [user_id, role_id]
    );
  },
};

export default RoleModel;