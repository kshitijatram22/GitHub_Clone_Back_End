const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config");

async function pushRepo() {
    //Access the path of .ourGit folder's files
  const repoPath = path.resolve(process.cwd(), ".ourGit");
  const commitsPath = path.join(repoPath, "commits");

  try {
    //Access the folder which we have to push
    const commitDirs = await fs.readdir(commitsPath);
    //Folder level loop
    for (const commitDir of commitDirs) {
      const commitPath = path.join(commitsPath, commitDir);
      const files = await fs.readdir(commitPath);
        //File level loop 
      for (const file of files) {
        const filePath = path.join(commitPath, file);

        //Grab all the content and push to the S3_BUCKET
        const fileContent = await fs.readFile(filePath);
        const params = {
          Bucket: S3_BUCKET,
          Key: `commits/${commitDir}/${file}`,
          Body: fileContent,
        };
        await s3.upload(params).promise();
      }
    }
    console.log("All commits pushed to S3.");
  } catch (err) {
    console.log("Error pushing to S3", err);
  }
}

module.exports = { pushRepo };
