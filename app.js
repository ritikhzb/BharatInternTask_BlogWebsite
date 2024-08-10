// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// View Engine
app.set('view engine', 'ejs');

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => console.log(err));

// Blog Post Schema
const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    date: {
        type: Date,
        default: Date.now,
    },
});

const Post = mongoose.model('Post', postSchema);

// Routes
app.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.render('home', { posts });
    } catch (err) {
        res.status(500).send("An error occurred: " + err.message);
    }
});

app.get('/compose', (req, res) => {
    res.render('compose');
});

app.post('/compose', async (req, res) => {
    try {
        const newPost = new Post({
            title: req.body.title,
            content: req.body.content,
        });

        await newPost.save(); // No callback needed
        res.redirect('/');
    } catch (err) {
        res.status(500).send("An error occurred: " + err.message);
    }
});

app.get('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.render('post', { post });
    } catch (err) {
        res.status(500).send("An error occurred: " + err.message);
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// Route to render edit page
app.get('/edit/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.render('edit', { post });
    } catch (err) {
        res.status(500).send("An error occurred: " + err.message);
    }
});

// Route to handle updating a post
app.post('/update/:id', async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            content: req.body.content,
        });
        res.redirect('/');
    } catch (err) {
        res.status(500).send("An error occurred: " + err.message);
    }
});

// Route to handle deleting a post
app.get('/delete/:id', async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (err) {
        res.status(500).send("An error occurred: " + err.message);
    }
});
