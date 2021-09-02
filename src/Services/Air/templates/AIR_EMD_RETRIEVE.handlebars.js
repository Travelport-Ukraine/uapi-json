module.exports = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:air="http://www.travelport.com/schema/air_v51_0" xmlns:com="http://www.tra   <soapenv:Header/>
   <soapenv:Body>
      <air:EMDRetrieveReq TraceId="{{requestId}}" TargetBranch="{{TargetBranch}}" RetrieveProviderReservationDetails="false">
         <com:BillingPointOfSaleInfo OriginApplication="uAPI"/>
         {{#if emulatePcc}}
         <com:OverridePCC ProviderCode="{{provider}}" PseudoCityCode="{{emulatePcc}}"/>
         {{/if}}
         <!--You have a CHOICE of the next 2 items at this level-->
         {{#if emdNumber}}
         <air:DetailRetrieve>
            <!--Optional:-->
            <com:ProviderReservationDetail ProviderCode="{{provider}}" ProviderLocatorCode="{{pnr}}" />
            <air:EMDNumber>{{emdNumber}}</air:EMDNumber>
         </air:DetailRetrieve>
         {{else}}
         <air:ListRetrieve>
            <com:ProviderReservationDetail ProviderCode="{{provider}}" ProviderLocatorCode="{{pnr}}" />
         </air:ListRetrieve>
         {{/if}}
      </air:EMDRetrieveReq>
   </soapenv:Body>
</soapenv:Envelope>
`;
