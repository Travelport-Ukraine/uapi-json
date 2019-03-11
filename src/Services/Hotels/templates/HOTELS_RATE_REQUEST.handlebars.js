module.exports = `
<soapenv:Envelope
    xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
    <soapenv:Header/>
    <soapenv:Body>
        <hot:HotelDetailsReq xmlns:com="http://www.travelport.com/schema/common_v47_0" xmlns:hot="http://www.travelport.com/schema/hotel_v47_0" ReturnGuestReviews="true" ReturnMediaLinks="true" TargetBranch="{{TargetBranch}}">
            <com:BillingPointOfSaleInfo OriginApplication="UAPI"/>
            <hot:HotelProperty HotelChain="{{HotelChain}}" HotelCode="{{HotelCode}}" {{#if Name}} Name="{{Name}}" {{/if}}/>
            <hot:HotelDetailsModifiers MaxWait="11000" RateRuleDetail="Complete"  {{#if currency}} PreferredCurrency="{{currency}}" {{/if}}>
                <com:PermittedProviders>
                    <com:Provider Code="TRM"/>
                </com:PermittedProviders>
                <hot:HotelStay>
                    <hot:CheckinDate>{{startDate}}</hot:CheckinDate>
                    <hot:CheckoutDate>{{endDate}}</hot:CheckoutDate>
                </hot:HotelStay>
                <hot:PermittedAggregators>
                {{#each Suppliers}}
                   <hot:Aggregator Name="{{this}}"/>
                {{/each}}
                </hot:PermittedAggregators>
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
            </hot:HotelDetailsModifiers>
            {{#if HostToken}}
            <com:HostToken Host="TRM"  xmlns:com="http://www.travelport.com/schema/common_v47_0">
            {{HostToken}}
            </com:HostToken>
            {{/if}}
        </hot:HotelDetailsReq>
    </soapenv:Body>
</soapenv:Envelope>
`;
