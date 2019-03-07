module.exports = `
<!--Release 16.1.0.60--><!--Version Dated as of 06/Mar/2016-->
<soap:Envelope
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  >
  <soap:Header/>
  <soap:Body>
    <univ:UniversalRecordImportReq
      AuthorizedBy="user" TraceId="{{requestId}}" TargetBranch="{{TargetBranch}}"
      ProviderCode="{{provider}}" ProviderLocatorCode="{{pnr}}"
      xmlns:univ="http://www.travelport.com/schema/universal_v47_0"
      xmlns:com="http://www.travelport.com/schema/common_v47_0"
      >
      <com:BillingPointOfSaleInfo OriginApplication="uAPI" xmlns:com="http://www.travelport.com/schema/common_v47_0"/>
      {{#if emulatePcc}}
      <com:OverridePCC ProviderCode="{{provider}}" PseudoCityCode="{{emulatePcc}}"/>
      {{/if}}
    </univ:UniversalRecordImportReq>
  </soap:Body>
</soap:Envelope>
`;
