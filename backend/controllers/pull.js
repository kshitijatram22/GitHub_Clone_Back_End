const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config");

async function pullRepo() {
  const repoPath = path.resolve(process.cwd(), ".ourGit");
  const commitsPath = path.join(repoPath, "commits");

  try {
    const data = await s3
      .listObjectsV2({ Bucket: S3_BUCKET, Prefix: "commits/" })
      .promise();

    const objects = data.Contents;

    for (const object of objects) {
      const key = object.Key;

      const localPath = path.join(repoPath, key);
      const localDir = path.dirname(localPath);

      await fs.mkdir(localDir, { recursive: true });

      const params = {
        Bucket: S3_BUCKET, 
        Key: key,
      };

      const fileContent = await s3.getObject(params).promise();
      await fs.writeFile(repoPath, key), fileContent.Body;
    }

    console.log("✅ All commits pulled from S3.");
  } catch (err) {
    console.error("❌ Unable to pull from S3:", err.message);
  }
}

module.exports = { pullRepo };
