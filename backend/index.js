const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const mainRouter = require("./routes/main.router");

dotenv.config();

const { initRepo } = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { pushRepo } = require("./controllers/push");
const { pullRepo } = require("./controllers/pull");
const { revertRepo } = require("./controllers/revert");

// ---------------- CLI Commands ---------------- //
yargs(hideBin(process.argv))
  .command("init", "Initialise a new repository", {}, initRepo)
  .command(
    "add <file>",
    "Add a file to repository",
    (yargs) => {
      yargs.positional("file", {
        describe: "File to add to the staging area",
        type: "string",
      });
    },
    (argv) => {
      addRepo(argv.file);
    }
  )
  .command(
    "commit <message>",
    "Commit the staged files",
    (yargs) => {
      yargs.positional("message", {
        describe: "Commit message",
        type: "string",
      });
    },
    (argv) => {
      commitRepo(argv.message);
    }
  )
  .command("start", "Starts the new Server", {}, startServer)
  .command("push", "Push commits to S3", {}, pushRepo)
  .command("pull", "Pull commits from S3", {}, pullRepo)
  .command(
    "revert <commitID>",
    "Revert to specific commit",
    (yargs) => {
      yargs.positional("commitID", {
        describe: "Commit ID to revert to",
        type: "string",
      });
    },
    (argv) => {
      revertRepo(argv.commitID);
    }
  )
  .demandCommand(1, "You need at least one command")
  .help().argv;

// ---------------- Start Server ---------------- //
function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  // Middleware
  app.use(bodyParser.json());
  app.use(express.json());
  app.use(cors({ origin: "*" }));

  // Routes
  app.use("/", mainRouter);

  // Connect MongoDB (Mongoose)
  const mongoURI = process.env.MONGODB_URI;

  mongoose
    .connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => {
      console.error("❌ MongoDB Connection Error:", err);
      process.exit(1);
    });

  // Socket.IO
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🔗 A user connected:", socket.id);

    socket.on("joinRoom", (userID) => {
      console.log(`📢 User joined room: ${userID}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ A user disconnected:", socket.id);
    });
  });

  // DB ready
  mongoose.connection.once("open", () => {
    console.log("📂 MongoDB ready for CRUD operations.");
  });

  // Start server
  httpServer.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
  });
}
