module.exports = `
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:univ="http://www.travelport.com/schema/universal_v47_0"
  xmlns:gds="http://www.travelport.com/schema/gdsQueue_v47_0"
  xmlns:com="http://www.travelport.com/schema/common_v47_0"
  >
  <soapenv:Header />
  <soapenv:Body>
    <gds:GdsQueuePlaceReq TargetBranch="{{TargetBranch}}" RetrieveProviderReservationDetails="true" PseudoCityCode="{{pcc}}" ProviderCode="{{provider}}" ProviderLocatorCode="{{pnr}}">
      <com:BillingPointOfSaleInfo OriginApplication="uAPI" xmlns:com="http://www.travelport.com/schema/common_v47_0"/>
      <com:QueueSelector Queue="{{queue}}" xmlns:com="http://www.travelport.com/schema/common_v47_0"/>
      {{#if emulatePcc}}
      <com:OverridePCC ProviderCode="{{provider}}" PseudoCityCode="{{emulatePcc}}"/>
      {{/if}}
    </gds:GdsQueuePlaceReq>
  </soapenv:Body>
</soapenv:Envelope>
`;
