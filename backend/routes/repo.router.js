const express = require("express");
const repoController = require("../controllers/repoController")

const repoRouter = express.Router();

repoRouter.post("/repo/create", repoController.createRepository);
repoRouter.get("/repo/all", repoController.getAllRepositories);
repoRouter.get("/repo/:id", repoController.fetchReposioryById);
repoRouter.get("/repo/name/:name", repoController.fetchReposioryByName);
repoRouter.get("/repo/user/:userID", repoController.fetchRepositoryForCurrentUser);
repoRouter.put("/repo/update/:id", repoController.updateRepositoryById);
repoRouter.patch("/repo/toggle/:id", repoController.toggleVisibilityById);
// repoRouter.delete("/repo/delete/:id", repoController.deleteRepositoryById);
router.delete("/repo/:id", repoController.deleteRepositoryById);


module.exports = repoRouter;
