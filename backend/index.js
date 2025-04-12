const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

// Prisma Client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.render('index.ejs', { error: null });
});

// Insert user
app.post('/insert', async (req, res) => {
    const { name, email, password } = req.body;

    if (!email || !password) {
        return res.render('index.ejs', { error: 'Please enter all required details.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        const user = await prisma.users.create({
            data: {
                uuid: userId,
                username: name || null,
                email: email,
                password: hashedPassword
            }
        });

        const users = await prisma.users.findMany({
            select: { uuid: true, username: true, email: true, password: true }
        });

        if (users.length > 0) {
            res.render('userDetails.ejs', { users });
        } else {
            res.render('index.ejs', { error: 'Failed to insert user.' });
        }

    } catch (err) {
        console.error('Error inserting user:', err);
        res.status(500).render('index.ejs', { error: 'Something went wrong. Please try again.' });
    }
});

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
