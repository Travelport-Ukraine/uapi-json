module.exports = function prepareRequest(template, auth, params) {
  // adding target branch param from auth variable and render xml
  params.provider = auth.provider;
  params.TargetBranch = auth.targetBranch;
  params.Username = auth.username;
  params.emulatePcc = auth.emulatePcc
    ? auth.emulatePcc.toUpperCase()
    : false;
  const renderedObj = template(params);
  return renderedObj;
};
