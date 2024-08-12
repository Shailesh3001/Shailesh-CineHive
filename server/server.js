import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from './schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;

mongoose.connect('mongodb+srv://shailesh1016:Shailesh9176@cluster0.gl1hx85.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to DB'))
  .catch(err => console.log("Connection Error", err));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
console.log(__dirname,'../public');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.post('/register', async (req, res) => {
    const { fullname, email, username, password, age, gender } = req.body;

    console.log(`Registration Details - Full Name: ${fullname}, Email: ${email}, Username: ${username}, Password: ${password}, Age: ${age}, Gender: ${gender}`);

    try {
        const userExists = await User.findOne({ $or: [{ username }, { email }] });

        if (userExists) {
            console.log('Registration failed: User already exists.');
            return res.json({ success: false, message: 'User already exists.' });
        }

        const newUser = new User({ fullname, email, username, password, age, gender });
        await newUser.save();

        console.log('Registration successful:', { fullname, email, username });
        res.json({ success: true, message: 'Registration successful.' });
    } catch (error) {
        console.log('Error during registration:', error);
        res.json({ success: false, message: 'Registration failed.' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    console.log(`Login Attempt - Username: ${username}, Password: ${password}`);

    try {
        const user = await User.findOne({ username });

        if (user && user.password === password) {
            console.log('Login successful:', { username });
            res.json({ success: true });
        } else {
            console.log('Login failed: Invalid credentials.');
            res.json({ success: false, message: 'Invalid credentials.' });
        }
    } catch (error) {
        console.log('Error during login:', error);
        res.json({ success: false, message: 'Login failed.' });
    }
});

app.get('/user-data', async (req, res) => {
    try {
        const data = await User.find();
        res.status(200).json(data);
    } catch (error) {
        console.log('Error fetching user data:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user data.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
