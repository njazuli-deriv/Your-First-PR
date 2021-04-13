const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/action");
const { GITHUB_ACTIONS_BOT_NAME } = require("../utils");
const octokit = new Octokit();
const fs = require("fs");

const createTeams = async () => {
  try {
    const team_size = core.getInput("team_size");
    const testFolder = ".";

    console.log({ cwd: process.cwd() });

    fs.readdir(testFolder, (err, files) => {
      files.forEach((file) => {
        console.log(file);
      });
    });
  } catch (error) {}
};

createTeams().catch((e) => core.setFailed(e));
