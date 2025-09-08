const fs = require("fs").promises;
const path = require("path");

async function addRepo(filePath) {
  const repoPath = path.resolve(process.cwd(), ".ourGit");
  const stagingPath = path.join(repoPath, "staging");

  try {
    await fs.mkdir(stagingPath, { recursive: true });
    const fileName = path.basename(filePath);
    await fs.copyFile(filePath, path.join(stagingPath, fileName));

    console.log(`file ${fileName} added to the staging area!`);
  } catch (err) {
    console.log("The error Encountered", err);
  }
}

module.exports = { addRepo };
