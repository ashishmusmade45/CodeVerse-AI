const express = require('express');
const cors = require('cors');
const { clerkMiddleware } = require('@clerk/express');
const aiRoutes = require('./routes/ai.routes');

const app = express();

app.use(express.json());
app.use(cors());

app.use(clerkMiddleware());

app.get('/', (req, res) => {
    res.send("Hello World");
});

app.use('/ai', aiRoutes);

module.exports = app;
