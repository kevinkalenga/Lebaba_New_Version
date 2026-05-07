const express = require('express');
const User = require('./user.model');
const generateToken = require('../middleware/generateToken');
const router = express.Router();
const multer = require("multer");
const sendResetEmail = require("../../utils/sendResetEmail");
const jwt = require("jsonwebtoken");
const {delete_file, upload_file} = require('../../utils/cloudinary.js')
const storage = multer.memoryStorage();

const upload = multer({
    storage
});

// Register endpoint

router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username, password });
        await user.save();
        res.status(201).send({ message: "User registered successfully!" });
    } catch (error) {
        console.error("Error registering user", error);
        res.status(500).send({ message: "Error registering user" });
    }
});

// Login user endpoint 

router.post('/login', async(req, res) => {
    // console.log(req.body)
    const {email, password} = req.body

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).send({ message: "Password not match" });
        }

        const token = await generateToken(user._id);
        console.log(token)
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        })
        

        res.status(200).send({
            message: "Logged in successfully", token,
            user:  {
                _id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                profileImage: user.profileImage,
                bio: user.bio,
                profession: user.profession,

            }
        });
    } catch (error) {
        console.error("Error logged in user", error);
        res.status(500).send({ message: "Error logged in user" });
    }

})

// logout endpoint

router.post('/logout', async (req, res) => {
    res.clearCookie('token');
    res.status(200).send({ message: 'Logged out successfully' })
})


// delete a user
router.delete("/users/:id", async (req, res) => {
    try {
        // base on id and we get it from the params
        const { id } = req.params;
        // get the user
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        
        // Supression de l img depuis cloudinary 
        if(user?.profileImage?.public_id) {
            await delete_file(user?.profileImage.public_id)
        }
        
        
        res.status(200).send({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user", error);
        res.status(500).send({ message: "Error deleting user" });
    }
});


// get all users
router.get("/users", async (req, res) => {
    try {
        // we will return id, email, role
        const users = await User.find({}, "id email role").sort({ createdAt: -1 });
        res.status(200).send(users);
    } catch (error) {
        console.error("Error fetching users", error);
        res.status(500).send({ message: "Error fetching user" });
    }
});


// update user role
router.put("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(id, { role }, { new: true });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.status(200).send({ message: "User role updated successfully", user });
    } catch (error) {
        console.error("Error updating user role", error);
        res.status(500).send({ message: "Error updating user role" });
    }
});






// edit or update profile
router.patch("/edit-profile", async (req, res) => {
    try {
        const { userId, username, profileImage, bio, profession } = req.body;
        if (!userId) {
            return res.status(400).send({ message: "User ID is required" });
        }
        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }
        // update profile
        if (username !== undefined) user.username = username;
        if (profileImage !== undefined) user.profileImage = profileImage;
        if (bio !== undefined) user.bio = bio;
        if (profession !== undefined) user.profession = profession;

        await user.save();
        res.status(200).send({
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                bio: user.bio,
                profession: user.profession,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Error updating user profile", error);
        res.status(500).send({ message: "Error updating user profile" });
    }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).send({ message: "Invalid email" });
    }

    const user = await User.findOne({ email });

    if (user) {
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '15m' }
      );

      const resetLink =
        `${process.env.CLIENT_URL}/reset-password/${token}`;

      await sendResetEmail(email, resetLink);
    }

    //  TOUJOURS répondre 200
    return res.status(200).send({
      message: "If email exists, reset link sent"
    });

  } catch (error) {
    console.log("FORGOT PASSWORD ERROR:", error);
    res.status(500).send({ message: "Server error" });
  }
});

router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).send({ message: "Password is required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    user.password = password; // hash via pre-save middleware
    await user.save();

    res.status(200).send({ message: "Password updated successfully" });

  } catch (error) {
    console.log("RESET PASSWORD ERROR:", error);
    res.status(400).send({ message: "Invalid or expired token" });
  }
});



router.post("/me/upload_image", upload.single("image"), async (req, res) => {

    const imgResponse = await upload_file(
        req.file.buffer,
        "lebaba/avatar"
    );

    const user = await User.findByIdAndUpdate(
        req.body.userId,
        {
            profileImage: imgResponse
        },
        { new: true }
    );

    res.json({ user });
});














module.exports = router;