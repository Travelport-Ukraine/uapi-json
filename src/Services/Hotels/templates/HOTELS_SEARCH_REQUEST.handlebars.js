module.exports = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:hot="http://www.travelport.com/schema/hotel_v47_0" xmlns:com="http://www.travelport.com/schema/common_v47_0">
  <soapenv:Header/>
  <soapenv:Body>
    <hot:HotelSearchAvailabilityReq TargetBranch="{{TargetBranch}}" >
      <com:BillingPointOfSaleInfo OriginApplication="UAPI" />
      {{#nextResult}}
        <com:NextResultReference ProviderCode="TRM" >
          {{nextResult}}
        </com:NextResultReference>
        {{/nextResult}}
      <hot:HotelSearchLocation>
        {{#if location}}
          <hot:HotelLocation Location="{{location}}"/>
        {{/if}}

        {{#if code}}
          <hot:ProviderLocation ProviderCode="TRM" Location="{{code}}" />
        {{/if}}

      </hot:HotelSearchLocation>
      <hot:HotelSearchModifiers MaxWait="{{#MaxWait}}{{.}}{{/MaxWait}}{{^MaxWait}}15000{{/MaxWait}}" AvailableHotelsOnly="true" ReturnPropertyDescription="true" MaxProperties="{{#MaxProperties}}{{.}}{{/MaxProperties}}{{^MaxProperties}}30{{/MaxProperties}}" {{#currency}} PreferredCurrency="{{.}}" {{/currency}}>
        <com:PermittedProviders xmlns:com="http://www.travelport.com/schema/common_v47_0">
          <com:Provider Code="TRM"/>
        </com:PermittedProviders>
        {{#if rating}}
        <hot:HotelRating RatingProvider="TRM">
          {{#each rating}}
          <hot:Rating>{{this}}</hot:Rating>
          {{/each}}
        </hot:HotelRating>
        {{/if}}
        <hot:BookingGuestInformation>
          {{#rooms}}
            <hot:Room>
              <hot:Adults>{{adults}}</hot:Adults>
              {{#children}}
                <hot:Child Age="{{.}}"></hot:Child>
              {{/children}}
            </hot:Room>
          {{/rooms}}
        </hot:BookingGuestInformation>
      </hot:HotelSearchModifiers>
      <hot:HotelStay>
        <hot:CheckinDate>{{startDate}}</hot:CheckinDate>
        <hot:CheckoutDate>{{endDate}}</hot:CheckoutDate>
      </hot:HotelStay>
    </hot:HotelSearchAvailabilityReq>
  </soapenv:Body>
</soapenv:Envelope>
`;
