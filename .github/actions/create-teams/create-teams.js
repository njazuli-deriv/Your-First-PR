const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/action");
const { GITHUB_ACTIONS_BOT_NAME } = require("../utils");
const octokit = new Octokit();
const fs = require("fs");

const createTeams = async () => {
  try {
    const people_folder_path = `${process.cwd()}/people`;
    const teams_file_path = `${process.cwd()}/.very_secret_folder/teams.json`;
    const team_size = core.getInput("team_size");

    // Get existing teams
    const teams_file = fs.readFileSync(teams_file_path);
    const existing_teams = JSON.parse(teams_file).groups;
    const teams = fs
      .readdirSync(people_folder_path)
      // .filter((person) => person !== GITHUB_ACTIONS_BOT_NAME)
      .reduce((teams, person) => {
        let current_team_idx = teams.findIndex(
          (team) => team.length < team_size
        );

        // If no available team, create a new one.
        if (current_team_idx === -1) {
          current_team_idx = teams.length;
        }

        // Add the person to this team.
        teams[current_team_idx] = [
          ...(Array.isArray(teams[current_team_idx])
            ? teams[current_team_idx]
            : []),
          person,
        ];

        return teams;
      }, existing_teams);

    console.log({ teams });
  } catch (error) {
    console.log({ error });
  }
};

createTeams().catch((e) => core.setFailed(e));
