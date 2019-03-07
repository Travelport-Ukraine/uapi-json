module.exports = `
<soapenv:Envelope
    xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
    <soapenv:Body>
        <univ:HotelCreateReservationReq
            xmlns:com="http://www.travelport.com/schema/common_v47_0"
            xmlns:common_v47_0="http://www.travelport.com/schema/common_v47_0"
            xmlns:hotel="http://www.travelport.com/schema/hotel_v47_0"
            xmlns:univ="http://www.travelport.com/schema/universal_v47_0"
            ProviderCode="TRM"
            TargetBranch="{{{TargetBranch}}}"
            UserAcceptance="true">
            <com:BillingPointOfSaleInfo OriginApplication="UAPI"/>

            {{#each people}}
            <com:BookingTraveler Key="{{{key}}}" DOB="{{{BirthDate}}}" Nationality="{{{Nationality}}}" TravelerType="{{TravelerType}}" {{#if Age}} Age="{{Age}}" {{/if}}>
                <com:BookingTravelerName First="{{{FirstName}}}" Last="{{{LastName}}}" Prefix="{{{PrefixName}}}"/>
                {{#if Number}}
                    <com:PhoneNumber CountryCode="{{{CountryCode}}}" AreaCode="{{{AreaCode}}}" Number="{{{Number}}}" Type="Home"/>
                {{/if}}
                {{#if Email}}
                    <com:Email EmailID="{{{Email}}}" Type="Home"/>
                {{/if}}
                {{#if Street}}
                <com:Address>
                    <com:Street>{{{Street}}}</com:Street>
                    <com:City>{{{City}}}</com:City>
                    <com:PostalCode>{{{PostalCode}}}</com:PostalCode>
                    {{#if State}}<com:State>{{{State}}}</com:State>{{/if}}
                    <com:Country>{{{Country}}}</com:Country>
                </com:Address>
                {{/if}}
            </com:BookingTraveler>
            {{/each}}

           <!--  <com:ReservationName xmlns:com="http://www.travelport.com/schema/common_v47_0">
                <com:BookingTravelerRef Key="1">
                </com:BookingTravelerRef>
            </com:ReservationName> -->



            {{#rates}}
            <hotel:HotelRateDetail xmlns:hotel="http://www.travelport.com/schema/hotel_v47_0"  RatePlanType="{{& RatePlanType}}" RateSupplier="{{& RateSupplier}}" RateOfferId="{{& RateOfferId}}" Base="{{& Base.currency}}{{& Base.value}}" Tax="{{& Tax.currency}}{{& Tax.value}}" Total="{{& Total.currency}}{{& Total.value}}" Surcharge="{{& Surcharge.currency}}{{& Surcharge.value}}" />
            {{/rates}}

            <hotel:HotelProperty xmlns:hotel="http://www.travelport.com/schema/hotel_v47_0" HotelChain="{{& HotelChain}}" HotelCode="{{& HotelCode}}" {{#if Name}} Name="{{Name}}" {{/if}}>
            </hotel:HotelProperty>
            <hotel:HotelStay xmlns:hot="http://www.travelport.com/schema/hotel_v47_0">
                <hotel:CheckinDate>{{{startDate}}}</hotel:CheckinDate>
                <hotel:CheckoutDate>{{{endDate}}}</hotel:CheckoutDate>
            </hotel:HotelStay>
            {{#Guarantee}}
            <com:Guarantee
                    xmlns:com="http://www.travelport.com/schema/common_v47_0" Type="Guarantee">
                    <com:CreditCard Type="{{& CardType}}" Number="{{& CardNumber}}" ExpDate="{{& ExpDate}}" Name="{{& CardHolder}}" CVV="{{& CVV}}" BankName="{{& BankName}}" BankCountryCode="{{& BankCountryCode}}" />
            </com:Guarantee>
            {{/Guarantee}}
            <common_v47_0:HostToken Host="TRM">
                {{& HostToken}}
            </common_v47_0:HostToken>
           <hot:BookingGuestInformation xmlns:hot="http://www.travelport.com/schema/hotel_v47_0">
                {{#roomsRefs}}
               <hot:Room>
                   <hot:Adults>{{& adults}}</hot:Adults>
                   {{#adultsRefs}}
                   <com:BookingTravelerRef Key="{{.}}"></com:BookingTravelerRef>
                   {{/adultsRefs}}
                 {{#children}}
                   <hot:Child Age="{{& age}}">
                      <com:BookingTravelerRef Key="{{& key}}"></com:BookingTravelerRef>
                   </hot:Child>
                 {{/children}}
               </hot:Room>
                {{/roomsRefs}}
            </hot:BookingGuestInformation>
        </univ:HotelCreateReservationReq>
    </soapenv:Body>
</soapenv:Envelope>
`;
