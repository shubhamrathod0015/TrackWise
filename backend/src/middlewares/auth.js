// # Admin authentication

// middlewares/auth.js
module.exports = (req, res, next) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};