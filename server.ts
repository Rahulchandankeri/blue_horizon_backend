const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');

import mongoose from 'mongoose';
import busRoutes from './routes/busRoutes';
import userRoutes from './routes/authRoutes';
import tripRoutes from './routes/tripRoutes';
import testRoutes from './routes/test';
import { globalErrorHandler } from './controllers/errorController';

app.use(
  cors({ origin: ['http://localhost:3000', 'http://localhost:3002', 'https://bluehorizon.rahulcodes.dev'], credentials: true })
);
app.use(express.json());
app.use(bodyParser.json());

declare var process: {
  env: {
    DB: string;
    DB_PASS: string;
    NODE_ENV: string;
    SERVER_PORT: string;
  };
};

const connection = mongoose
  .connect(process.env.DB.replace('<password>', process.env.DB_PASS), {})
  .then((conn) => {
    console.log(`Connection to db success!`);
  })
  .catch((err) => {
    console.log(`Connection to db failed`);
    if (process.env.NODE_ENV == 'dev') {
      console.log(`[CRITICAL ERROR] ${err.message}`);
    }
  });

app.use(`/api/v1/user`, userRoutes);
app.use(`/api/v1/bus`, busRoutes);
app.use(`/api/v1/route`, tripRoutes);
app.use(`/`, testRoutes);
app.use(globalErrorHandler);

app.listen(process.env.SERVER_PORT || 3004, () => {
  console.log(`Server running on port ${process.env.SERVER_PORT}`);
});

// export default app;
