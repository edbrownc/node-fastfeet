export default async (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(401).json({ error: 'Not an administrator' });
  }
  return next();
};
