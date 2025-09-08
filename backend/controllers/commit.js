const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

async function commitRepo(message) {
    //Accessed all the diectory paths
  const repoPath = path.resolve(process.cwd(), ".ourGit");
  const stagedPath = path.join(repoPath, "staging");
  const commitPath = path.join(repoPath, "commits");

  try {
    const commitID = uuidv4();
    //Create a new Directory for commited files
    const commitDir = path.join(commitPath, commitID);
    await fs.mkdir(commitDir, { recursive: true });

    //Read all the files and copy them form staged area to Commit directory
    const files = await fs.readdir(stagedPath);
    for (const file of files) {
      await fs.copyFile(
        path.join(stagedPath, file),
        path.join(commitDir, file)
      );
    }

    //Create a New JSON file to store the message and data and time of directory creation.
    await fs.writeFile(
      path.join(commitDir, "commitDir.json"),
      JSON.stringify({ message, date: new Date().toISOString() })
    );

    console.log(`Commit ${commitID} created with message ${message}`);
  } catch (err) {
    console.log("Error Commiting Files", err);
  }
}

module.exports = { commitRepo };
