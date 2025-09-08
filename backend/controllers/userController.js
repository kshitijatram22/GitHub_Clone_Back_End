// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const dotenv = require("dotenv");
// const mongoose = require("mongoose");

// dotenv.config();

// // ✅ User Schema & Model
// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true },
//   password: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   repositories: { type: Array, default: [] },
//   followedUsers: { type: Array, default: [] },
//   starRepos: { type: Array, default: [] },
// });

// const User = mongoose.model("User", userSchema);

// /**
//  * SIGNUP
//  */
// async function signup(req, res) {
//   try {
//     const { username, email, password } = req.body;

//     // check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: "User already exists" });
//     }

//     // hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // create user
//     const newUser = new User({
//       username,
//       email,
//       password: hashedPassword,
//     });

//     await newUser.save();

//     res.status(201).json({ message: "User registered successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// }

// /**
//  * LOGIN
//  */
// async function login(req, res) {
//   try {
//     const { email, password } = req.body;

//     // find user
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     // check password
//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     // generate token
//     const token = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET_KEY,
//       { expiresIn: "1h" }
//     );

//     res.json({ token, user });
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// }

// /**
//  * GET USER PROFILE (Protected)
//  */
// async function getProfile(req, res) {
//   try {
//     const userId = req.userId; // middleware should set this from JWT

//     const user = await User.findById(userId).select("-password"); // exclude password
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// }

// module.exports = {
//   signup,
//   login,
//   getProfile,
//   User, // export model in case we need it elsewhere
// };

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

const uri = process.env.MONGODB_URI;

let client;

async function connectClient() {
  if (!client) {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
  }
}

/**
 * SIGNUP
 */
async function signup(req, res) {
  const { username, password, email } = req.body;
  try {
    await connectClient();
    const db = client.db("githubclone");
    const userCollection = db.collection("users");

    const existingUser = await userCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      username,
      password: hashedPassword,
      email,
      repositories: [],
      followedUsers: [],
      starRepos: [],
    };

    const result = await userCollection.insertOne(newUser);

    const token = jwt.sign(
      { id: result.insertedId },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ token, userId: result.insertedId });
  } catch (err) {
    console.error("Error during signup : ", err.message);
    res.status(500).send("Server error");
  }
}

/**
 * LOGIN
 */
async function login(req, res) {
  const { email, password } = req.body;
  try {
    await connectClient();
    const db = client.db("githubclone");
    const userCollection = db.collection("users");

    const user = await userCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // ✅ check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({ token, userId: user._id });
  } catch (err) {
    console.error("Error during login : ", err.message);
    res.status(500).send("Server error");
  }
}

/**
 * GET ALL USERS
 */
async function getAllUsers(req, res) {
  try {
    await connectClient();
    const db = client.db("githubclone");
    const userCollection = db.collection("users");

    const users = await userCollection.find({}).toArray();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users : ", err.message);
    res.status(500).send("Server error");
  }
}

/**
 * GET USER PROFILE
 */
async function getUserProfile(req, res) {
  const currentId = req.params.id;
  try {
    await connectClient();
    const db = client.db("githubclone");
    const userCollection = db.collection("users");

    const user = await userCollection.findOne({
      _id: new ObjectId(currentId),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(user);
  } catch (err) {
    console.error("Error during fetching user : ", err.message);
    res.status(500).send("Server error");
  }
}

/**
 * UPDATE USER PROFILE
 */
async function updateUserProfile(req, res) {
  const currentId = req.params.id;
  const { email, password } = req.body;

  try {
    await connectClient();
    const db = client.db("githubclone");
    const userCollection = db.collection("users");

    let updateFields = {};
    if (email) updateFields.email = email;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.password = hashedPassword;
    }

    const result = await userCollection.findOneAndUpdate(
      { _id: new ObjectId(currentId) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({ message: "User not found." });
    }

    res.send(result.value);
  } catch (err) {
    console.error("Error during updating user : ", err.message);
    res.status(500).send("Server error");
  }
}

/**
 * DELETE USER PROFILE
 */
async function deleteUserProfile(req, res) {
  const currentId = req.params.id;

  try {
    await connectClient();
    const db = client.db("githubclone");
    const userCollection = db.collection("users");

    const result = await userCollection.deleteOne({
      _id: new ObjectId(currentId),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User profile deleted" });
  } catch (err) {
    console.error("Error during deleting user : ", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  getAllUsers,
  login,
  signup,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
