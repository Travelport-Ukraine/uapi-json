module.exports = (airPricingInfo, coupon) => {
  const couponTicketDesignator = coupon['air:TicketDesignator']
    && coupon['air:TicketDesignator'].Value;

  if (!airPricingInfo) {
    return couponTicketDesignator
      ? `${coupon.FareBasis}/${couponTicketDesignator}`
      : coupon.FareBasis;
  }

  const [fareInfoData] = Object.values(airPricingInfo['air:FareInfo'])
    .filter((obj) => {
      return obj.Origin === coupon.Origin
        && obj.Destination === coupon.Destination;
    });

  const ticketDesignator = fareInfoData && fareInfoData['air:FareTicketDesignator'];
  return ticketDesignator
    ? `${fareInfoData.FareBasis}/${ticketDesignator}`
    : fareInfoData.FareBasis;
};
