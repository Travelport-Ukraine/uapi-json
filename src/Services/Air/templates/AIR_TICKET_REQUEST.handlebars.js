module.exports = `
<!--Release 8.1--><!--Version Dated as of 15/Apr/2015 11:24:08-->
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header/>
  <soap:Body>
    <air:AirTicketingReq AuthorizedBy="user" ReturnInfoOnFail="true" TargetBranch="{{TargetBranch}}"
      xmlns:air="http://www.travelport.com/schema/air_v47_0"
      xmlns:com="http://www.travelport.com/schema/common_v47_0"
      >
      <com:BillingPointOfSaleInfo OriginApplication="uAPI"/>
      {{#if emulatePcc}}
      <com:OverridePCC ProviderCode="{{provider}}" PseudoCityCode="{{emulatePcc}}"/>
      {{/if}}
      <air:AirReservationLocatorCode>{{ReservationLocator}}</air:AirReservationLocatorCode>
      {{#refs}}
      <air:AirPricingInfoRef Key="{{key}}"/>
      {{/refs}}
      <air:AirTicketingModifiers>
        {{#refs}}
          <air:AirPricingInfoRef Key="{{key}}"/>
        {{/refs}}
        {{#if commission}}
        <com:Commission Level="Fare"
          {{#equal commission.type "Z"}}
            Type="PercentBase" Percentage="{{commission.value}}"
          {{/equal}}
          {{#equal commission.type "ZA"}}
            Type="Flat" Amount="{{currency}}{{commission.value}}"
          {{/equal}}
        />
        {{/if}}
        <com:FormOfPayment Type="{{fop.type}}">
        {{#equal fop.type 'Credit'}}
          <com:CreditCard {{#if creditCard.type}}Type="{{creditCard.type}}"{{/if}}
                          Number="{{creditCard.number}}"
                          ExpDate="{{creditCard.expDate}}"
                          Name="{{creditCard.name}}"
                          CVV="{{creditCard.cvv2}}">
          </com:CreditCard>
        {{/equal}}
        </com:FormOfPayment>
      </air:AirTicketingModifiers>
    </air:AirTicketingReq>
  </soap:Body>
</soap:Envelope>
`;
