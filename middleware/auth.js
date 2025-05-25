import { verifyJwtToken } from '../utils/tokenHelper.js';

export const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  const { valid, decoded, error } = verifyJwtToken(token);

  if (!valid) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.user = decoded;
  next();
};
