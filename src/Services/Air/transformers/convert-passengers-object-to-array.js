module.exports = (params) => {
  const list = [];

  Object.keys(params.passengers).forEach((ageCategory) => {
    const number = params.passengers[ageCategory];
    if (number) {
      for (let i = 0; i < number; i += 1) {
        list.push({
          ageCategory,
          child: (ageCategory === 'CNN'), // quickfix
        });
      }
    }
  });

  params.passengers = list;
  return params;
};
