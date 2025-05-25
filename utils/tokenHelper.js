import jwt from 'jsonwebtoken';
import constants from '../constants/constants.js';

const JWT_SECRET = constants.JWT_SECRET;

export const verifyJwtToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, decoded };
  } catch (err) {
    return { valid: false, error: err };
  }
};
