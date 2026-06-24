import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import authRoutes from './src/server/routes/authRoutes';
import userRoutes from './src/server/routes/userRoutes';
import propertyRoutes from './src/server/routes/propertyRoutes';
import { initDatabase } from './src/server/config/database';

async function startServer() {
  const app = express();
  const PORT = 3000;

  initDatabase();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

 
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/properties', propertyRoutes);

user/listings
  app.use('/api/properties/user', propertyRoutes);

  
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PropSpace Server] Running at http://localhost:${PORT}`);
  });
}

startServer();
