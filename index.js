const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  res.render('index');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// mono DB  connection

mongoose.connect('mongodb+srv://kalpraj51:FEkXXxZu0SeNXWiq@cluster0.dly4bej.mongodb.net/Blog?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log("Connected to Database"))
  .catch((error) => console.log("Error in Connecting to Database:", error));


let loggedInUserEmail = "";


const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

const blogSchema = new mongoose.Schema({
    userEmail: String,
    title: String,
    description: String,
    information: String
});

// Create Mongoose models
const User = mongoose.model('User', userSchema);
const Blog = mongoose.model('Blog', blogSchema);

app.get("/login", (req, res) => {
    res.render('login');
  });
  app.get("/signup", (req, res) => {
    res.render('index');
  });

// User signup endpoint
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10); 
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.render('login');
    } catch (err) {
        res.status(400).send(`Error signing up user: ${err.message}`);
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send('User not found');
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).send('Invalid password');
        }
  
        loggedInUserEmail = email; 
        res.redirect('/blog');
  
    } catch (err) {
        res.status(500).send(`Error logging in: ${err.message}`);
    }
  });

  app.post('/createblog', async (req, res) => {
    try {
        const { title, description, information } = req.body;
        console.log('Received blog data:', { title, description, information });

        const newBlog = new Blog({ userEmail: loggedInUserEmail, title, description, information });
        await newBlog.save();
        console.log('Blog saved successfully:', newBlog);
        res.redirect('/blog'); 
    } catch (err) {
        console.error('Error creating blog:', err);
        res.status(500).send(`Error creating blog: ${err.message}`);
    }
});
  

  app.get('/blog', async (req, res) => {
    try {
        let userBlogs = await Blog.find({ userEmail: loggedInUserEmail });
        res.render('blog', { userBlogs }); 
        console.log(userBlogs);
    } catch (err) {
        res.status(500).send(`Error fetching user blogs: ${err.message}`);
    }
});

app.get('/allblog', async (req, res) => {
    try {
        const allBlogs = await Blog.find();
        res.render('allblog', { allBlogs }); 
        console.log(allBlogs);

    } catch (err) {
        res.status(500).send(`Error fetching user blogs: ${err.message}`);
    }
});

app.get('/myblog', async (req, res) => {
    try {
        let userBlogs2 = await Blog.find({ userEmail: loggedInUserEmail });
        res.render('myblog', { userBlogs2 }); 
        console.log(userBlogs2);
    } catch (err) {
        res.status(500).send(`Error fetching user blogs: ${err.message}`);
    }
})

app.get('/delete-blog/:id', async (req, res) => {
    try {
        const blogId = req.params.id;
        await Blog.findByIdAndDelete(blogId);
        res.redirect('/blog');
    } catch (err) {
        res.status(500).send(`Error deleting blog: ${err.message}`);
    }
});


