export default (params) => {
  let group = 0;
  for (let i = 0; i < params.segments.length; i += 1) {
    params.segments[i].Group = group;
    if (params.segments[i].transfer === false) {
      group += 1;
    }
  }
  return params;
};
