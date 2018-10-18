module.exports = (params) => {
  params.business = (params.segments[0].serviceClass === 'Business');
  return params;
};
