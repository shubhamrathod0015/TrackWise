// import dotenv from "dotenv";
// import path from "path";

// const env = process.env.NODE_ENV || "development";
// const envFile = `.env.${env}`;

// dotenv.config({
//     path: path.resolve(process.cwd(), envFile)
// });

// // Validate required environment variables
// const requiredEnvVars = [
//     "MONGO_URI",
//     "REDIS_URL",
//     "ACCESS_TOKEN_SECRET",
//     "REFRESH_TOKEN_SECRET"
// ];

// requiredEnvVars.forEach(varName => {
//     if (!process.env[varName]) {
//         throw new Error(`Missing required environment variable: ${varName}`);
//     }
// });

// // Configuration object
// export const config = {
//     env,
//     port: process.env.PORT || 3000,
//     mongo: {
//         uri: process.env.MONGO_URI,
//         options: {
//             autoIndex: true,
//             maxPoolSize: 10,
//             serverSelectionTimeoutMS: 5000,
//             socketTimeoutMS: 45000
//         }
//     },
//     redis: {
//         url: process.env.REDIS_URL
//     },
//     jwt: {
//         accessSecret: process.env.ACCESS_TOKEN_SECRET,
//         refreshSecret: process.env.REFRESH_TOKEN_SECRET,
//         accessExpiry: process.env.ACCESS_TOKEN_EXPIRY || "15m",
//         refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d"
//     },
//     rateLimit: {
//         windowMs: 60 * 1000, // 1 minute
//         max: 30 // Max requests per window
//     },
//     cors: {
//         origin: process.env.CORS_ORIGIN || "*",
//         methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
//     }
// };

// // Alias for easier access
// export const { env } = config;


// import dotenv from "dotenv";
// import path from "path";

// const NODE_ENV = process.env.NODE_ENV || "development";
// const envFile = `.env.${NODE_ENV}`;

// dotenv.config({
//     path: path.resolve(process.cwd(), envFile)
// });

// // Validate required environment variables
// const requiredEnvVars = [
//     "MONGO_URI",
//     "REDIS_URL",
//     "ACCESS_TOKEN_SECRET",
//     "REFRESH_TOKEN_SECRET"
// ];

// requiredEnvVars.forEach(varName => {
//     if (!process.env[varName]) {
//         throw new Error(`Missing required environment variable: ${varName}`);
//     }
// });

// // Configuration object
// export const config = {
//     env: NODE_ENV,
//     port: process.env.PORT || 3000,
//     mongo: {
//         uri: process.env.MONGO_URI,
//         options: {
//             autoIndex: true,
//             maxPoolSize: 10,
//             serverSelectionTimeoutMS: 5000,
//             socketTimeoutMS: 45000
//         }
//     },
//     redis: {
//         url: process.env.REDIS_URL
//     },
//     jwt: {
//         accessSecret: process.env.ACCESS_TOKEN_SECRET,
//         refreshSecret: process.env.REFRESH_TOKEN_SECRET,
//         accessExpiry: process.env.ACCESS_TOKEN_EXPIRY || "15m",
//         refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d"
//     },
//     rateLimit: {
//         windowMs: 60 * 1000, // 1 minute
//         max: 30 // Max requests per window
//     },
//     cors: {
//         origin: process.env.CORS_ORIGIN || "*",
//         methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
//     }
// };

// // Optional alias (if really needed)
// export const env = config.env;



import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
  "MONGO_URI",
  "ACCESS_TOKEN_SECRET",
  "ACCESS_TOKEN_EXPIRY",
  "REFRESH_TOKEN_SECRET",
  "REFRESH_TOKEN_EXPIRY",
  "NODE_ENV",
  "PORT"
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

export const config = {
  mongoUri: process.env.MONGO_URI,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY,
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
};
