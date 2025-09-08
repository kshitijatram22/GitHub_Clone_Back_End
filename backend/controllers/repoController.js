const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const Issue = require("../models/issueModel");
const User = require("../models/userModel");

async function createRepository(req, res) {
  const { owner, name, issues, content, description, visibility } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: "Repository name required!" });
    }
    if (!mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(400).json({ error: "Invalid User ID!" });
    }

    const newRepository = new Repository({
      name,
      description,
      visibility,
      owner,
      content,
      issues,
    });

    const result = await newRepository.save();
    res.status(201).json({
      message: "Repository created",
      repositoryId: result._id,
    });
  } catch (err) {
    console.error("Error during creating repository: ", err.message);
    res.status(500).send("Server error");
  }
}

async function getAllRepositories(req, res) {
  try {
    const repositories = await Repository.find({})
      .populate("owner")
      .populate("issues");

    res.json({ repositories });
  } catch (err) {
    console.error("Error during fetching repository: ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchReposioryById(req, res) {
  const { id } = req.params;
  try {
    const repository = await Repository.findById(id)
      .populate("owner")
      .populate("issues");

    res.json(repository);
  } catch (err) {
    console.error("Error during fetching repository: ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchReposioryByName(req, res) {
  const { name } = req.params;
  try {
    const repository = await Repository.find({ name })
      .populate("owner")
      .populate("issues");

    res.json(repository);
  } catch (err) {
    console.error("Error during fetching repository: ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoryForCurrentUser(req, res) {
  const { userID } = req.params; // ✅ FIXED
  try {
    const repositories = await Repository.find({ owner: userID });

    return res.json({ repositories }); // ✅ Always return array
  } catch (err) {
    console.error("Error during fetching user repositories: ", err.message);
    res.status(500).send("Server error");
  }
}

async function updateRepositoryById(req, res) {
  const { id } = req.params;
  const { content, description } = req.body;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(400).json({ error: "Repository not Found" });
    }

    repository.content.push(content);
    repository.description = description;
    const updatedRepository = await repository.save();

    res.json({
      message: "Repository updated successfully",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during updating repository: ", err.message);
    res.status(500).send("Server error");
  }
}

async function toggleVisibilityById(req, res) {
  const { id } = req.params;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(400).json({ error: "Repository not Found" });
    }

    repository.visibility = !repository.visibility;
    const updatedRepository = await repository.save();

    res.json({
      message: "Repository toggled successfully",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during toggling visibility: ", err.message);
    res.status(500).send("Server error");
  }
}
async function deleteRepositoryById(req, res) {
  const { id } = req.params;
  try {
    const repository = await Repository.findByIdAndDelete(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json({ message: "Repository deleted successfully!" });
  } catch (err) {
    console.error("Error during deleting repository: ", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  createRepository,
  getAllRepositories,
  fetchReposioryById,
  fetchReposioryByName,
  fetchRepositoryForCurrentUser,
  updateRepositoryById,
  toggleVisibilityById,
  deleteRepositoryById,
};
