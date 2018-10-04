module.exports = (params) => {
  params.segments = params.segments.map((segment, i, segments) => {
    const transfer = !!(segments[i + 1] && segments[i + 1].group === segment.group);
    return Object.assign(segment, { transfer });
  });
  return params;
};
