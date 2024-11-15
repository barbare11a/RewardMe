const User = require('../models/User'); // Import User model
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const jwt = require('jsonwebtoken'); // Import jwt for token generation

// Register function
async function register(req, res) {
    try {
        const { name, email, password, role } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "User already exists" });
        }

        // Create new user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
        });

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ msg: `User ${newUser.name} registered successfully.`, token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
}


async function login(req, res) {
    //check if user exists by email
    try {

        const user = await User.findOne({ email: req.body.email });// if a matching document is found, the  <- user variable 
        if (!user) {                                                  //will be an object representing the user document retrieved
            return res.status(400).json({msg: "Invalid credentials"});//from the MongoDB database, this object will be an instance
        }                                                             // of the Mongoose model: User

        //verify password
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch){
            return res.status(400).json({msg: "Invalid credentials"});
        }

        //Generate JWT token
        const token = jwt.sign(
            {id: user.userID, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );

        // Send response with token
        res.json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
}
module.exports = { register, login };