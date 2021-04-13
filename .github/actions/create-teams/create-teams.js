const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/action");
const { GITHUB_ACTIONS_BOT_NAME } = require("../utils");
const octokit = new Octokit();
const fs = require("fs");

const createTeams = async () => {
  try {
    const team_size = core.getInput("team_size");

    console.log({ cwd: process.cwd() });

    // Get all the files in this folder.
    const people_folder = `${process.cwd()}/people`;
    console.log({ people_folder: people_folder, team_size });
    const people = fs.readdirSync(people_folder);
    // .filter((person) => person !== GITHUB_ACTIONS_BOT_NAME);

    console.log({ people, people_folder: people_folder, team_size });
  } catch {}
};

createTeams().catch((e) => core.setFailed(e));
