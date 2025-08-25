export default () => ({
  app: {
    port: parseInt(process.env.APP_PORT!, 10) || 3000,
    env: process.env.APP_ENV || 'dev',
  },
  database: {
    url: process.env.DATABASE_URL,
    user: process.env.DATABASE_USER || 'properview',
    password: process.env.DATABASE_PASSWORD || 'properview',
    db: process.env.DATABASE_DB || 'properview',
    port: parseInt(process.env.DATABASE_PORT!, 10) || 5435,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
  },
  mapbox: {
    accessToken: process.env.MAPBOX_ACCESS_TOKEN,
  },
});
