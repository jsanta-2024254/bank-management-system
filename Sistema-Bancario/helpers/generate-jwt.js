import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../configs/config.js';

export const generateJWT = (userId, extraClaims = {}, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // JWT payload with sub, jti, iat, and optional role
      const payload = {
        sub: String(userId), // Ensure sub is string to match .NET behavior
        jti: crypto.randomUUID(), // Match .NET Guid.NewGuid()
        iat: Math.floor(Date.now() / 1000), // Match .NET DateTimeOffset.UtcNow.ToUnixTimeSeconds()
      };

      // Add extra claims, but ensure they're properly serializable
      if (extraClaims && typeof extraClaims === 'object') {
        Object.keys(extraClaims).forEach((key) => {
          // Ensure claim values are primitive types (string, number, boolean)
          if (
            extraClaims[key] !== null &&
            typeof extraClaims[key] !== 'object'
          ) {
            payload[key] = extraClaims[key];
          }
        });
      }

      const signOptions = {
        expiresIn: options.expiresIn || config.jwt.expiresIn,
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
        algorithm: 'HS256', // Explicitly set algorithm
      };

      jwt.sign(payload, config.jwt.secret, signOptions, (err, token) => {
        if (err) {
          console.error('Error generating JWT:', err);
          reject(err);
        } else {
          // Validate that token is properly formatted
          if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
            reject(new Error('Generated token is malformed'));
          } else {
            resolve(token);
          }
        }
      });
    } catch (error) {
      console.error('Error in generateJWT:', error);
      reject(error);
    }
  });
};

export const verifyJWT = (token) => {
  return new Promise((resolve, reject) => {
    // Validate token format before verifying
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      return reject(new Error('jwt malformed'));
    }

    const verifyOptions = {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
      algorithms: ['HS256'],
    };

    jwt.verify(token, config.jwt.secret, verifyOptions, (err, decoded) => {
      if (err) {
        console.error('Error verifying JWT:', err);
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

export const generateVerificationToken = (userId, type, expiresIn = '24h') => {
  return new Promise((resolve, reject) => {
    const payload = {
      sub: String(userId),
      type: type,
      iat: Math.floor(Date.now() / 1000),
    };

    const signOptions = {
      expiresIn,
      jwtid: crypto.randomUUID(),
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    };

    jwt.sign(payload, config.jwt.secret, signOptions, (err, token) => {
      if (err) {
        console.error('Error generating verification token:', err);
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
};

export const verifyVerificationToken = (token) => {
  return verifyJWT(token);
};
