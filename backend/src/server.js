import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(env.PORT, () => {
      console.log(`[School Management API] Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      console.log(`[School Management API] Swagger Docs available at http://localhost:${env.PORT}/api/docs`);
    });

    const shutdown = () => {
      console.log('\n[School Management API] Gracefully shutting down...');
      server.close(() => {
        console.log('[School Management API] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error(`[School Management API] Failed to start server:`, error);
    process.exit(1);
  }
};

startServer();
