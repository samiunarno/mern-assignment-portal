/// <reference types="node" />

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app';
import path from 'path';
import { Router } from 'express';
import apiRouter from './routes';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const port = process.env.PORT || 4000;

const DB = process.env.MONGO_URI;

if (!DB) {
  console.error('❌ FATAL ERROR: MONGO_URI is not defined in your backend/.env file.');
  process.exit(1);
}

const listEndpoints = (router: Router, prefix: string) => {
  const routes: { method: string; path: string }[] = [];

  const processStack = (stack: any[], currentPrefix: string) => {
    stack.forEach((layer: any) => {
      if (layer.route) { 
        const path = layer.route.path;
        const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
        methods.forEach(method => {
          const finalPath = `${currentPrefix}${path}`.replace(/\/$/, '') || '/';
          routes.push({ method, path: finalPath });
        });
      } else if (layer.name === 'router' && layer.handle.stack) { 
        let newPrefix = layer.regexp.source
          .replace('^\\', '')
          .replace('\\/?(?=\\/|$)', '');
        if (newPrefix.startsWith('/')) {
            newPrefix = newPrefix.substring(1);
        }
        const finalPrefix = `${currentPrefix}/${newPrefix}`;
        processStack(layer.handle.stack, finalPrefix.replace(/\/$/, ''));
      }
    });
  };

  processStack((router as any).stack, prefix);

  routes.sort((a, b) => a.path.localeCompare(b.path));
  
  console.log('\n----------------------------------------------------');
  console.log('           AVAILABLE API ENDPOINTS');
  console.log('----------------------------------------------------\n');
  console.log(`  METHOD        ENDPOINT`);
  console.log('----------------------------------------------------');
  routes.forEach(({ method, path }) => {
    console.log(`  ${method.padEnd(13)}${path}`);
  });
  console.log('----------------------------------------------------\n');
};

console.log('Attempting to connect to MongoDB...');
console.log('Please ensure your IP address is whitelisted in MongoDB Atlas.');

mongoose
  .connect(DB)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    const server = app.listen(port, () => {
      console.log(`🚀 App running on port ${port}...`);
      listEndpoints(apiRouter, '/api');
    });

    process.on('unhandledRejection', (err: Error) => {
      console.error('UNHANDLED REJECTION! 💥 Shutting down...');
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
      server.close(() => {
        console.log('💥 Process terminated!');
      });
    });
  })
  .catch((err) => {
      console.error('❌ MongoDB connection FAILED.');
      console.error('----------------------------------------------------');
      console.error('This is usually caused by one of two things:');
      console.error('1. Incorrect MONGO_URI in your backend/.env file (check your password).');
      console.error('2. Your current IP address is not whitelisted in MongoDB Atlas Network Access settings.');
      console.error('----------------------------------------------------');
      console.error('Original Error:', err.message);
      process.exit(1);
  });