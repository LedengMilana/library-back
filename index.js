const express = require('express');
const cors = require('cors');
const authRouter = require('./authRouter');
const db = require('./db');

const PORT = process.env.PORT || 5000;

const app = express();


app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);

const start = async () => {
    try {
        app.listen(PORT, () => console.log(`Server started on Port ${PORT}`));
    } catch (error) {
        console.log(error);
    }
};

start();
