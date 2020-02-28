module.exports = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
       <soapenv:Header/>
        <soapenv:Body>
          <ReferenceDataRetrieveReq TraceId="{{TraceId}}" AuthorizedBy="user" TargetBranch="{{TargetBranch}}" TypeCode="{{dataType}}" xmlns="http://www.travelport.com/schema/util_v47_0">
             <BillingPointOfSaleInfo OriginApplication="UAPI" xmlns="http://www.travelport.com/schema/common_v47_0"/>
             <ReferenceDataSearchModifiers MaxResults="20000" ProviderCode="1V"/>
          </ReferenceDataRetrieveReq>
        </soapenv:Body>
    </soapenv:Envelope>
`;
