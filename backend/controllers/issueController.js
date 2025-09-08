const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const Issue = require("../models/issueModel");
const User = require("../models/userModel");

async function createIssue(req, res) {
    const { title, description } = req.body;
    const { id } = req.params;
    try {
        const issue = new Issue({
            title,
            description,
            repository: id,
        });

        await issue.save();

        res.status(201).json(issue);
    } catch (err) {
        console.error("Error during creating Issue. : ", err.message);
        res.status(500).send("Server error");
    }
}
async function updateIssueById(req, res) {
    const { id } = req.params;
    const { title, description, status } = req.body;

    try {
        const issue = await Issue.findById(id);
        if (!issue) {
            return res.status(404).json({ error: "Issue not found" });
        }

        issue.title = title;
        issue.description = description;
        issue.status = status;

        await issue.save();

        res.json(issue, { message: "Issue deleted" });
    } catch (err) {
        console.error("Error during updating Issue. : ", err.message);
        res.status(500).send("Server error");
    }
}


async function deleteIssueById(req, res) {
    const { id } = req.params;

    try {
        const issue = Issue.findByIdAndDelete(id);

        if (!issue) {
            return res.status(404).json({ error: "Issue not found" });
        }

        res.json({ message: "Issue deleted" });
    } catch (err) {
        console.error("Error during deleting Issue. : ", err.message);
        res.status(500).send("Server error");
    }
}


async function fetchAllIssues(req, res) {
    const { id } = req.params;

    try {
        const issues = Issue.find({ repository: id });
        if (!issues) {
            return res.status(404).json({ error: "Issues not found" });
        }
        res.status(200).json(issues);
    }catch (err) {
        console.error("Error during fetching all Issue. : ", err.message);
        res.status(500).send("Server error");
    }
}
async function getIssuesById(req, res) {
    const { id } = req.params;

    try {
        const issue = await Issue.findById(id);
        if (!issue) {
            return res.status(404).json({ error: "Issue not found" });
        }
        await issue.save();

        res.json(issue);
    } catch (err) {
        console.error("Error during detching the Issue. : ", err.message);
        res.status(500).send("Server error");
    }
}

module.exports = {
    createIssue,
    updateIssueById,
    deleteIssueById,
    fetchAllIssues,
    getIssuesById,
};
