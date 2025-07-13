import { API_ENDPOINTS } from '@aiprojectteam/shared';
import fastify from './server';

console.log('API Server starting...');
console.log('Available endpoints:', API_ENDPOINTS);

// Iniciar o servidor
const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port: Number(port), host });
    console.log(`🚀 API Server running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start(); 