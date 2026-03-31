const createAdminMiddleware = (db) => {
  return async (req, res, next) => {
    const result = await db.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows[0]?.is_admin) next();
    else res.status(403).json({ message: 'Admin only' });
  };
};

module.exports = createAdminMiddleware;
