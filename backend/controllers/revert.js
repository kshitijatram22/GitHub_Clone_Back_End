const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const readdir = promisify(fs.readdir);
const CopyFile = promisify(fs.copyFile);

async function revertRepo(commitID) {
    const repoPath = path.resolve(process.cwd(), ".ourGit");
    const commitPath = path.join(repoPath, "commits");

    try {
        //Checking that the folder exist or not.
        const commitDir = path.join(commitPath, commitID);
        const files = await readdir(commitDir);
        const parentDir = path.resolve(repoPath, "..");

        //If there is a folder then copy the files from commits to parent folder.
        for (const file of files) {
            await CopyFile(path.join(commitDir, file), path.join(parentDir, file));
        }
        console.log(`The files for ${commitID} are reverted successfully.`);
    } catch (err) {
        console.log("Unable to revert.", err);
    }
}

module.exports = { revertRepo };
