import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

async function start() {
  await connectDB(MONGO_URI);

  const startServer = (port) => {
    const server = app.listen(port, () => {
      console.info(`SAMBX API listening on port ${port}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE' && port < 5100) {
        console.warn(`Port ${port} is in use, trying ${port + 1}...`);
        server.close(() => startServer(port + 1));
        return;
      }

      throw error;
    });

    return server;
  };

  startServer(Number(PORT));
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
