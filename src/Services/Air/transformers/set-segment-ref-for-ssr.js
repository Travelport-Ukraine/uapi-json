module.exports = (params) => {
  params.passengers = params.passengers.map((passenger) => {
    passenger.ssr = (passenger.ssr || []).map((ssr) => {
      if (ssr.segment !== undefined) {
        const segKey = Object.keys(params['air:AirSegment'])[ssr.segment];
        ssr.segmentRef = params['air:AirSegment'][segKey].Key;

        delete (ssr.segment);
      }
      return ssr;
    });

    return passenger;
  });

  return params;
};
