module.exports = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
    <soapenv:Header/>
    <soapenv:Body>
        <air:AirPriceReq
            AuthorizedBy="user" TraceId="{{requestId}}" TargetBranch="{{TargetBranch}}"
            CheckOBFees="false"
            FareRuleType="{{#if long}}long{{else}}short{{/if}}"
            xmlns:air="http://www.travelport.com/schema/air_v36_0"
            xmlns:com="http://www.travelport.com/schema/common_v36_0">
            <com:BillingPointOfSaleInfo OriginApplication="uAPI"/>
            <air:AirItinerary>
                {{#segments}}
                <air:AirSegment Key="{{@index}}" Group="0" ProviderCode="1G"
                                Carrier="{{airline}}"
                                CabinClass="{{serviceClass}}"
                                FlightNumber="{{flightNumber}}"
                                Origin="{{from}}"
                                Destination="{{to}}"
                                DepartureTime="{{departure}}"
                                ArrivalTime="{{arrival}}"
                                {{#if duration}}TravelTime="{{duration}}"{{/if}}
                                ClassOfService="{{bookingClass}}"
                                TravelOrder="{{@index}}" />
                    {{#if transfer}}
                    <air:Connection/>
                    {{/if}}
                {{/segments}}
            </air:AirItinerary>
            <com:SearchPassenger Key="P_0" Code="ADT" />
            {{#if hasFareBasis}}
            <air:AirPricingCommand>
                {{#segments}}
                <air:AirSegmentPricingModifiers AirSegmentRef="{{@index}}" FareBasisCode="{{fareBasisCode}}"/>
                {{/segments}}
            </air:AirPricingCommand>
            {{/if}}
            {{#if emulatePcc}}
            <com:OverridePCC ProviderCode="1G" PseudoCityCode="{{emulatePcc}}"/>
            {{/if}}
        </air:AirPriceReq>
    </soapenv:Body>
</soapenv:Envelope>
`;
