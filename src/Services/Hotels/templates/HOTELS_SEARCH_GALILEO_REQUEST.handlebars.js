module.exports = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:hot="http://www.travelport.com/schema/hotel_v47_0" xmlns:com="http://www.travelport.com/schema/common_v47_0">
  <soapenv:Header/>
  <soapenv:Body>
    <hot:HotelSearchAvailabilityReq TargetBranch="{{TargetBranch}}" >
      <com:BillingPointOfSaleInfo OriginApplication="UAPI" />
      {{#nextResult}}
        <com:NextResultReference ProviderCode="{{provider}}" >
          {{nextResult}}
        </com:NextResultReference>
        {{/nextResult}}
      <hot:HotelSearchLocation>
        <hot:HotelLocation Location="{{location}}"/>
      </hot:HotelSearchLocation>
      <hot:HotelSearchModifiers AvailableHotelsOnly="true" {{#currency}} PreferredCurrency="{{currency}}" {{/currency}} NumberOfAdults="{{NumberOfAdults}}" NumberOfRooms="{{NumberOfRooms}}">
        <com:PermittedProviders xmlns:com="http://www.travelport.com/schema/common_v47_0">
          <com:Provider Code="{{provider}}"/>
        </com:PermittedProviders>
        {{#children.length}}
        <hot:NumberOfChildren Count="{{children.length}}">
          {{#children}}
          <hot:Age>{{.}}</hot:Age>
          {{/children}}
        </hot:NumberOfChildren>
        {{/children.length}}
      </hot:HotelSearchModifiers>
      <hot:HotelStay>
        <hot:CheckinDate>{{startDate}}</hot:CheckinDate>
        <hot:CheckoutDate>{{endDate}}</hot:CheckoutDate>
      </hot:HotelStay>
    </hot:HotelSearchAvailabilityReq>
  </soapenv:Body>
</soapenv:Envelope>
`;
