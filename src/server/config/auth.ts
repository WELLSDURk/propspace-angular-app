export const JWT_SECRET = process.env.JWT_SECRET || 'propspace_super_secure_jwt_secret_key_2026';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
export const BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS ? parseInt(process.env.BCRYPT_ROUNDS, 10) : 10;
