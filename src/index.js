const express = require('express');
const app = express();

const cors = require('cors');

// utils
require('dotenv').config();
require('../database/connect')();

// port
const PORT = process.env.PORT;

// routes
const routerUser = require('./routes/routerUser');
const routerMobile = require('./routes/routerMobile');

app.use(express.json());
app.use(cors());

app.use('/api/auth', routerUser);
app.use('/api/mobile', routerMobile);

app.listen(PORT, () => console.log(`Server init in port: ${PORT}`));