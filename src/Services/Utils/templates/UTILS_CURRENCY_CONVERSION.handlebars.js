module.exports = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:util="http://www.travelport.com/schema/util_v47_0" xmlns:com="http://www.travelport.com/schema/common_v47_0">
  <soapenv:Body>
    <util:CurrencyConversionReq TargetBranch="{{TargetBranch}}">
      <com:BillingPointOfSaleInfo OriginApplication="UAPI" />
      {{#currencies}}
      <util:CurrencyConversion From="{{from}}" To="{{to}}" />
      {{/currencies}}
    </util:CurrencyConversionReq>
  </soapenv:Body>
</soapenv:Envelope>
`;
