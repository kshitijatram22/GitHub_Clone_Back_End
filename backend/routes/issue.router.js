const express = require("express");
const issueController = require("../controllers/issueController")

const issueRouter = express.Router();

issueRouter.post("/issue/create", issueController.createIssue);
issueRouter.put("/issue/update/:id", issueController.updateIssueById);
issueRouter.delete("/issue/delete/:id", issueController.deleteIssueById);
issueRouter.get("/issue/all", issueController.fetchAllIssues);
issueRouter.get("/issue/:id", issueController.getIssuesById);

module.exports = issueRouter;
