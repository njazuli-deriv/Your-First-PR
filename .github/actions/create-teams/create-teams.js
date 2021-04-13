const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/action");
const { GITHUB_ACTIONS_BOT_NAME } = require("../utils");
const octokit = new Octokit();
const fs = require("fs");

const createTeams = async () => {
  try {
    const team_size = core.getInput("team_size");
    const people_folder = `${process.cwd()}/people`;
    const groups = fs
      .readdirSync(people_folder)
      .filter((person) => person !== GITHUB_ACTIONS_BOT_NAME)
      .reduce(
        (groups, person) => {
          let current_group_idx = groups.findIndex(
            (group) => group.length < team_size
          );

          // If no available group, create a new one.
          if (current_group_idx === -1) {
            current_group_idx = groups.length;
          }

          // Add the person to this group.
          groups[current_group_idx] = [
            ...(groups[current_group_idx] ?? []),
            person,
          ];

          return groups;
        },
        [[]]
      );

    console.log({ groups });
  } catch {}
};

createTeams().catch((e) => core.setFailed(e));
