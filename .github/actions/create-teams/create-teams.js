const core = require("@actions/core");
const { GITHUB_ACTIONS_BOT_NAME } = require("../utils");
const fs = require("fs");

const createTeams = async () => {
  try {
    const team_size = core.getInput("team_size");
    const total_people = core.getInput("total_people");
    const total_teams = Math.floor(total_people / team_size);

    console.log(`Total people: ${total_people}`);
    console.log(`Total per team: ${team_size}`);
    console.log(`Total teams: ${total_teams}`);

    const people_folder_path = `${process.env.GITHUB_WORKSPACE}/people`;
    const teams_file_path = `${process.env.GITHUB_WORKSPACE}/public/resources/teams.json`;

    const people = fs
      .readdirSync(people_folder_path)
      .filter((person) => person !== GITHUB_ACTIONS_BOT_NAME);

    // In below logic we'll get the existing teams from "teams.json" file and we'll
    // feed this into our reducer which will build on top of that. This ensures that
    // any existing groups will persist through workflow runs.
    const teams_file_contents = fs.readFileSync(teams_file_path);

    console.log({
      content: teams_file_contents.toString(),
    });

    let existing_teams;

    try {
      console.log({
        parsed: JSON.parse(teams_file_contents),
      });
      existing_teams = JSON.parse(teams_file_contents).teams;
    } catch {
      // eslint-disable-next-line no-console
      console.log("An error occured while trying to read teams.json.");

      // Happens when teams.json has been tampered with.
      existing_teams = [[]];
    }

    console.log({ people, existing_teams });

    // Get the newly added names (they weren't part of the "teams.json" yet).
    // We'll use this later to set a COMMIT_MSG.
    const new_names = people.reduce((names, person) => {
      return existing_teams.some((team) => team.includes(person))
        ? names
        : [...names, person];
    }, []);

    const teams = [...existing_teams];

    if (teams.length < total_teams) {
      for (let i = teams.length; i < total_teams; i++) {
        teams.push([]);
      }
    }

    console.log({ new_names });

    // Assign each new person to a random team.
    new_names.forEach((person) => {
      let iterations = 0;

      while (true) {
        const random_idx = Math.floor(Math.random() * total_teams);
        const random_team = teams[random_idx];

        console.log({ random_team, random_idx });

        if (random_team.length < team_size) {
          console.log({
            random_idx,
            random_team,
          });

          random_team.push(person);
          break;
        }

        // Loop trap.
        if (iterations > total_teams) {
          break;
        }

        iterations++;
      }
    });

    // Write updated teams to "teams.json" file.
    // In the next step, we'll check whether the file has been updated
    // and if so, we'll create a PR there.
    fs.writeFileSync(teams_file_path, JSON.stringify({ teams }, null, 4));
    console.log({ teams, new_names });

    if (new_names.length === 1) {
      core.setOutput("commit_msg", `feat: add ${new_names[0]} to teams.json`);
    } else if (new_names.length > 1) {
      const first_names = new_names.slice(0, new_names.length).join(", ");
      const last_name = new_names[new_names.length - 1];
      core.setOutput(
        "commit_msg",
        `feat: add ${first_names} and ${last_name} to teams.json`
      );
    }
  } catch (error) {
    console.log({ error });
  }
};

createTeams().catch((e) => core.setFailed(e));
