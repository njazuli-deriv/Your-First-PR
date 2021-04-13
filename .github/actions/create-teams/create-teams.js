const core = require("@actions/core");
const { GITHUB_ACTIONS_BOT_NAME } = require("../utils");
const fs = require("fs");

const createTeams = async () => {
  try {
    const cwd = process.cwd();
    const people_folder_path = `${cwd}/people`;
    const teams_file_path = `${cwd}/.very_secret_folder/teams.json`;
    const team_size = core.getInput("team_size");
    const people = fs
      .readdirSync(people_folder_path)
      .filter((person) => person !== GITHUB_ACTIONS_BOT_NAME);

    // In below logic we'll get the existing teams from "teams.json" file and we'll
    // feed this into our reducer which will build on top of that. This ensures that
    // any existing groups will persist through workflow runs.
    const teams_file_contents = fs.readFileSync(teams_file_path);
    const existing_teams = JSON.parse(teams_file_contents).teams;

    // Get the newly added names (they weren't part of the "teams.json" yet).
    // We'll use this later to set a COMMIT_MSG.
    const new_names = people.reduce((names, person) => {
      return existing_teams.some((team) => team.includes(person))
        ? [...names, person]
        : names;
    }, []);

    const teams = people.reduce((teams, person) => {
      let current_team_idx = teams.findIndex((team) => team.length < team_size);

      // If no available team, create a new one.
      if (current_team_idx === -1) {
        current_team_idx = teams.length;
      }

      // Add the person to this team.
      // (below should also remove duplicates (e.g. added through merge conflicts))
      teams[current_team_idx] = [
        ...(Array.isArray(teams[current_team_idx])
          ? teams[current_team_idx]
          : []),
        person,
      ];

      return teams;
    }, existing_teams);

    // Write updated teams to "teams.json" file.
    // In the next step, we'll check whether the file has been updated
    // and if so, we'll create a PR there.
    fs.writeFileSync(teams_file_path, JSON.stringify(teams, null, 4));
    console.log({ teams, new_names });

    let commit_msg;

    if (new_names.length === 1) {
      commit_msg = `feat: add ${new_names[0]} to teams.json`;
    } else if (new_names.length > 1) {
      const first_names = new_names.slice(0, new_names.length).join(", ");
      const last_name = new_names[new_names.length - 1];
      commit_msg = `feat: add ${first_names} and ${last_name} to teams.json`;
    }

    core.setOutput("commit_msg", commit_msg);
  } catch (error) {
    console.log({ error });
  }
};

createTeams().catch((e) => core.setFailed(e));
