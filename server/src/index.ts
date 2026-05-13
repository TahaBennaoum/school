import app from './app.js';
import { config } from './config/index.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✓ Connexion à la base de données établie');

    // Start server
    app.listen(config.port, () => {
      console.log(`✓ Serveur démarré sur le port ${config.port}`);
      console.log(`✓ Environnement: ${config.nodeEnv}`);
      console.log(`✓ API disponible sur: http://localhost:${config.port}/api`);
    });
  } catch (error) {
    console.error('✗ Erreur de démarrage:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM reçu, arrêt gracieux...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT reçu, arrêt gracieux...');
  await prisma.$disconnect();
  process.exit(0);
});

main();

export { prisma };
