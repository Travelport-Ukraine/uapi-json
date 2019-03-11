module.exports = `
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:univ="http://www.travelport.com/schema/universal_v47_0"
  xmlns:com="http://www.travelport.com/schema/common_v47_0"
  xmlns:air="http://www.travelport.com/schema/air_v47_0"
  >
  <soapenv:Header/>
  <soapenv:Body>
    <univ:AirCancelReq
      AuthorizedBy="user" TargetBranch="{{TargetBranch}}"
      RetrieveProviderReservationDetails="false" Version="{{version}}"
      >
      <com:BillingPointOfSaleInfo OriginApplication="uAPI" />
      {{#if emulatePcc}}
      <com:OverridePCC ProviderCode="{{provider}}" PseudoCityCode="{{emulatePcc}}"/>
      {{/if}}
      <air:AirReservationLocatorCode>{{uapi_reservation_locator}}</air:AirReservationLocatorCode>
      {{#segments}}
      <air:AirSegmentRef Key="{{{uapi_segment_ref}}}"/>
      {{/segments}}
    </univ:AirCancelReq>
  </soapenv:Body>
</soapenv:Envelope>
`;
