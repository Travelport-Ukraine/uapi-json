module.exports = (airPricingInfo, coupon) => {
  const couponTicketDesignator = coupon['air:TicketDesignator']
    && coupon['air:TicketDesignator'].Value;
  const couponFareBasisResult = couponTicketDesignator
    ? `${coupon.FareBasis}/${couponTicketDesignator}`
    : coupon.FareBasis;

  if (!airPricingInfo) {
    return couponFareBasisResult;
  }

  const [fareInfoData] = Object.values(airPricingInfo['air:FareInfo'])
    .filter((obj) => {
      return obj.Origin === coupon.Origin
        && obj.Destination === coupon.Destination;
    });

  if (!fareInfoData) {
    return couponFareBasisResult;
  }

  const ticketDesignator = fareInfoData && fareInfoData['air:FareTicketDesignator'];
  return ticketDesignator
    ? `${fareInfoData.FareBasis}/${ticketDesignator.replace(/\W/g, '')}`
    : fareInfoData.FareBasis;
};
