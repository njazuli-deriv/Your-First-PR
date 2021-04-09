rm -rf dist | true

ncc build \
    .github/actions/check-pull-request/check-pull-request.js \
    --out dist/check-pull-request \
    --license licenses.txt

ncc build \
    .github/actions/check-approvals/check-approvals.js \
    --out dist/check-approvals \
    --license licenses.txt