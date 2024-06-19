const express = require('express');
const app = express();
const globalErrorHandler = require('./controllers/errorController');
require('dotenv').config();
const userRoutes = require('./routes/authRoutes');
const cors = require('cors');
const bodyParser = require('body-parser');

import mongoose from 'mongoose';
import busRoutes from './routes/busRoutes';
import tripRoutes from './routes/tripRoutes';

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'], credentials: true }));
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

mongoose
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

app.listen(process.env.SERVER_PORT || 3004, () => {
  console.log(`Server running on port ${process.env.SERVER_PORT}`);
});
app.use(globalErrorHandler);
