module.exports = `
<!--
Air Universal Record Retrieve For Galileo(1G) LFS Request
-->
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:com="http://www.travelport.com/schema/common_v47_0"
  xmlns:univ="http://www.travelport.com/schema/universal_v47_0">
  <soapenv:Body>
    <univ:UniversalRecordRetrieveReq
      ViewOnlyInd="{{viewOnly}}"
      AuthorizedBy="user"
      TraceId="{{requestId}}"
      TargetBranch="{{TargetBranch}}"
    >
    <com:BillingPointOfSaleInfo OriginApplication="UAPI"/>
    {{#if emulatePcc}}
    <com:OverridePCC ProviderCode="{{provider}}" PseudoCityCode="{{emulatePcc}}"/>
    {{/if}}
    {{#if universalRecordLocatorCode}}
    <univ:UniversalRecordLocatorCode>{{universalRecordLocatorCode}}</univ:UniversalRecordLocatorCode>
    {{/if}}
    {{#if pnr}}
    <univ:ProviderReservationInfo ProviderCode="{{provider}}" ProviderLocatorCode="{{pnr}}" />
    {{/if}}
    </univ:UniversalRecordRetrieveReq>
  </soapenv:Body>
</soapenv:Envelope>
`;
