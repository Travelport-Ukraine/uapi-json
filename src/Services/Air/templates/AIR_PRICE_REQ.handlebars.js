module.exports = `
<!--Release 8.1-->
<!--Version Dated as of 15/Apr/2015 11:24:06-->
<!--Air Pricing For Galileo({{provider}}) with LFS CheckFlightDetails Request-->
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Header/>
    <soap:Body>
        <air:AirPriceReq
            AuthorizedBy="user" CheckFlightDetails="true" TargetBranch="{{TargetBranch}}"
            TraceId="{{requestId}}"
            {{#if fetchFareRules}}
            FareRuleType="{{#if long}}long{{else}}short{{/if}}"
            {{/if}}
            xmlns:air="http://www.travelport.com/schema/air_v47_0"
            xmlns:com="http://www.travelport.com/schema/common_v47_0">
            <com:BillingPointOfSaleInfo OriginApplication="UAPI" />
            <air:AirItinerary>
                {{#segments}}
                <air:AirSegment ArrivalTime="{{arrival}}"
                                DepartureTime="{{departure}}"
                                Carrier="{{airline}}"
                                {{#if bookingClass}} ClassOfService="{{bookingClass}}" {{/if}}
                                CabinClass="{{serviceClass}}"
                                Origin="{{from}}"
                                Destination="{{to}}"
                                ETicketability="Yes"
                                Equipment="{{plane}}"
                                FlightNumber="{{flightNumber}}"
                                LinkAvailability="true"
                                PolledAvailabilityOption="Polled avail exists"
                                ProviderCode="{{../provider}}"
                                Key="{{@index}}"
                                Group="{{group}}">
                    {{#if transfer}}
                    <air:Connection/>
                    {{/if}}
                </air:AirSegment>
                {{/segments}}
            </air:AirItinerary>
            
            <air:AirPricingModifiers
                InventoryRequestType="DirectAccess"
                {{#if pricing.currency}}
                CurrencyType="{{pricing.currency}}"
                {{/if}}
                {{#if pricing.eTicketability}}
                ETicketability="{{pricing.eTicketability}}"
                {{/if}}
                {{#if platingCarrier}}
                PlatingCarrier="{{platingCarrier}}"
                {{/if}}
                {{#if pricing.faresIndicator}}
                FaresIndicator="{{pricing.faresIndicator}}"
                {{else}}
                FaresIndicator="PublicAndPrivateFares"
                {{/if}}
            {{#if business}}
            >
                <air:PermittedCabins>
                    <com:CabinClass Type="Business" />
                </air:PermittedCabins>
            </air:AirPricingModifiers>   
            {{else}}
            />
            {{/if}}
            {{#passengers}}
            <com:SearchPassenger Key="P_{{@index}}" Code="{{ageCategory}}" {{#if child}}Age="9"{{else if Age}}Age="{{Age}}"{{/if}} xmlns:com="http://www.travelport.com/schema/common_v47_0"/>
            {{/passengers}}
            <air:AirPricingCommand>
                {{#segments}}
                <air:AirSegmentPricingModifiers AirSegmentRef="{{@index}}"{{#if fareBasisCode}} FareBasisCode="{{fareBasisCode}}"{{/if}}>
                {{#if bookingClass}}
                    <air:PermittedBookingCodes>
                            <air:BookingCode Code="{{bookingClass}}" />
                    </air:PermittedBookingCodes>
                {{/if}}
                </air:AirSegmentPricingModifiers>
                {{/segments}}
            </air:AirPricingCommand>
            {{#if emulatePcc}}
            <air:PCC>
                <com:OverridePCC ProviderCode="{{provider}}" PseudoCityCode="{{emulatePcc}}"/>
            </air:PCC>
            {{/if}}
        </air:AirPriceReq>
    </soap:Body>
</soap:Envelope>
`;
