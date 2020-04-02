module.exports = `
  <soap:Envelope
      xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
      xmlns:univ="http://www.travelport.com/schema/universal_v47_0"
      xmlns:com="http://www.travelport.com/schema/common_v47_0">
    <soap:Body>
      <univ:AckScheduleChangeReq
        AuthorizedBy="user" TraceId="{{requestId}}" TargetBranch="{{TargetBranch}}"
        Version="{{version}}"
        UniversalRecordLocatorCode="{{universalRecordLocatorCode}}"
        >
        <com:BillingPointOfSaleInfo OriginApplication="uAPI"/>
      </univ:AckScheduleChangeReq>
    </soap:Body>
  </soap:Envelope>
`;
