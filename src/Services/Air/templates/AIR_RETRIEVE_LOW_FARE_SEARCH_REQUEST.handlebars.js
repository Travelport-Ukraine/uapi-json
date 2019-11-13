module.exports = `
<!--Release 33-->
<!--Version Dated as of 14/Aug/2015 18:47:44-->
<!--Air Low Fare Search For Galileo({{provider}}) Request-->
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <air:RetrieveLowFareSearchReq
            AuthorizedBy="user" TraceId="{{requestId}}" TargetBranch="{{TargetBranch}}"
            ProviderCode="{{providerCode}}"
            SearchId="{{searchId}}"
            xmlns:air="http://www.travelport.com/schema/air_v47_0"
            xmlns:com="http://www.travelport.com/schema/common_v47_0"
            >
            <com:BillingPointOfSaleInfo OriginApplication="uAPI"/>
        </air:RetrieveLowFareSearchReq>
    </soap:Body>
</soap:Envelope>
`;
