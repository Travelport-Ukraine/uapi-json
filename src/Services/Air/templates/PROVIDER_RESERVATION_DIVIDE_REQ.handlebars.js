module.exports = `
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:air="http://www.travelport.com/schema/air_v47_0"
  xmlns:com="http://www.travelport.com/schema/common_v47_0"
  xmlns:univ="http://www.travelport.com/schema/universal_v47_0"
  >
  <soapenv:Header/>
  <soapenv:Body>
    <univ:ProviderReservationDivideReq AuthorizedBy="user" TargetBranch="{{TargetBranch}}"
     CreateChildUniversalRecord="New"
     UniversalRecordLocatorCode="{{uapi_ur_locator}}"
     ProviderCode="{{provider}}"
     ProviderLocatorCode="{{pnr}}">
      <com:BillingPointOfSaleInfo OriginApplication="UAPI" />
      {{#each passengers}}
      <univ:BookingTravelerRef Key="{{{uapi_passenger_ref}}}" />
      {{/each}}
      {{#if emulatePcc}}
      <com:OverridePCC ProviderCode="{{provider}}" PseudoCityCode="{{emulatePcc}}" />
      {{/if}}
    </univ:ProviderReservationDivideReq>
  </soapenv:Body>
</soapenv:Envelope>
`;
