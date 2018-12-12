module.exports = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ter="http://www.travelport.com/schema/terminal_v33_0" xmlns:com="http://www.travelport.com/schema/common_v33_0">
   <soapenv:Header/>
   <soapenv:Body>
      <ter:CreateTerminalSessionReq Host="{{provider}}" TargetBranch="{{TargetBranch}}" {{#if timeout}}SessionTimeout="{{timeout}}"{{/if}}>
         <com:BillingPointOfSaleInfo OriginApplication="uAPI" />
      </ter:CreateTerminalSessionReq>
   </soapenv:Body>
</soapenv:Envelope>
`;
