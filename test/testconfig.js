if (!process.env.USERNAME) {
  throw new Error('USERNAME env var should be provided');
}
if (!process.env.PASSWORD) {
  throw new Error('PASSWORD env var should be provided');
}

module.exports = {
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  targetBranch: process.env.BRANCH,
  pcc: process.env.PCC,
};
