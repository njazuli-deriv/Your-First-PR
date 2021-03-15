const core = require('@actions/core');
const github = require('@actions/github');

const run = async () => {
    console.log({
        context: github.context,
    });
};

run().catch((e) => core.setFailed(e))