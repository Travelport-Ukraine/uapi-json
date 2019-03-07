module.exports = `
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:air="http://www.travelport.com/schema/air_v47_0"
  xmlns:com="http://www.travelport.com/schema/common_v47_0"
  xmlns:univ="http://www.travelport.com/schema/universal_v47_0"
  >
  <soapenv:Header/>
  <soapenv:Body>
    <univ:UniversalRecordModifyReq AuthorizedBy="user" TargetBranch="{{TargetBranch}}" Version="{{version}}">
      <com:BillingPointOfSaleInfo OriginApplication="UAPI"/>
      <univ:RecordIdentifier ProviderCode="{{provider}}" ProviderLocatorCode="{{pnr}}" UniversalLocatorCode="{{uapi_ur_locator}}"/>
      {{#each passengers}}
      <univ:UniversalModifyCmd Key="P_{{@index}}_CHANGE_FOID">
        <univ:AirAdd ReservationLocatorCode="{{../uapi_reservation_locator}}" BookingTravelerRef="{{{uapi_ref_key}}}">
          <com:SSR Key="P_{{@index}}" Type="FOID" Status="HK" Carrier="YY" FreeText="PP{{passNumber}}"/>
        </univ:AirAdd>
      </univ:UniversalModifyCmd>
      {{/each}}
      {{#if emulatePcc}}
      <com:OverridePCC ProviderCode="{{provider}}" PseudoCityCode="{{emulatePcc}}"/>
      {{/if}}
    </univ:UniversalRecordModifyReq>
  </soapenv:Body>
</soapenv:Envelope>
`;
