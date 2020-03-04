module.exports = `
<!--AirCreateReservationReq-->
<!--Release 8.1-->
<!--Version Dated as of 15/Apr/2015 11:24:07-->
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Header xmlns:univ="http://www.travelport.com/schema/universal_v47_0">
        <univ:SupportedVersions airVersion="air_v47_0"/>
    </soap:Header>
    <soap:Body>
        <univ:AirCreateReservationReq
            AuthorizedBy="user" TraceId="{{requestId}}"
            RetainReservation="Both" TargetBranch="{{TargetBranch}}"
            {{#if rule}}RuleName="{{rule}}"{{/if}}
            {{#if UniversalRecordLocatorCode}} UniversalRecordLocatorCode="{{UniversalRecordLocatorCode}}" {{/if}}
            {{#if allowWaitlist}}RestrictWaitlist="false"{{else}}RestrictWaitlist="true"{{/if}}
            xmlns:univ="http://www.travelport.com/schema/universal_v47_0"
            xmlns:com="http://www.travelport.com/schema/common_v47_0"
            xmlns:air="http://www.travelport.com/schema/air_v47_0"
            xmlns:common_v47_0="http://www.travelport.com/schema/common_v47_0"
            >
            <com:BillingPointOfSaleInfo OriginApplication="uAPI" />
            {{#if emulatePcc}}
            <com:OverridePCC ProviderCode="{{provider}}" PseudoCityCode="{{emulatePcc}}"/>
            {{/if}}
            {{#each passengers}}
            <com:BookingTraveler Key="P_{{@index}}" Age="{{Age}}" DOB="{{DOB}}" Gender="{{gender}}" TravelerType="{{ageCategory}}">
                <com:BookingTravelerName First="{{firstName}}" Last="{{lastName}}" {{#if title}}Prefix="{{title}}"{{/if}}/>
                {{#if ../deliveryInformation}}
                <com:DeliveryInfo>
                    <com:ShippingAddress>
                        <com:AddressName>{{ ../deliveryInformation.name}}</com:AddressName>
                        <com:Street>{{ ../deliveryInformation.street}}</com:Street>
                        <com:City>{{ ../deliveryInformation.city}}</com:City>
                        <com:PostalCode>{{ ../deliveryInformation.zip}}</com:PostalCode>
                        <com:Country>{{ ../deliveryInformation.country}}</com:Country>
                    </com:ShippingAddress>
                </com:DeliveryInfo>
                {{/if}}

                {{#if ../phone}}
                    <com:PhoneNumber
                            CountryCode="{{../phone.countryCode}}"
                            Location="{{../phone.location}}"
                            Number="{{../phone.number}}"
                            Type="Other"
                    />
                {{/if}}

                {{#if ../email}}
                    <com:Email
                            EmailID="{{../email}}"
                            Type="Other"
                    />
                {{/if}}
                {{#ssr}}
                    {{#equal type "FQTV"}}
                        <com:LoyaltyCard Key="P_{{@index}}_FQTV" SupplierType="Air" SupplierCode="{{carrier}}" CardNumber="{{text}}" />
                    {{else}}
                        <com:SSR Type="{{type}}"{{#if carrier}} Carrier="{{carrier}}"{{/if}}{{#if segmentRef}} SegmentRef="{{{segmentRef}}}"{{/if}}{{#if status}} Status="{{{status}}}"{{/if}} FreeText="{{text}}" />
                    {{/equal}}
                {{/ssr}}
                {{#if isChild}}
                <com:NameRemark Key="P_{{@index}}">
                    <com:RemarkData>P-{{ageCategory}}</com:RemarkData>
                </com:NameRemark>
                {{/if}}
            </com:BookingTraveler>
            {{/each}}

            <air:AirPricingSolution {{#each air:AirPricingSolution}}{{@key}}="{{{this}}}" {{/each}}>
                {{{air:AirPricingSolution_XML.air:AirSegment_XML}}}
                {{{air:AirPricingSolution_XML.air:AirPricingInfo_XML}}}
                {{{air:AirPricingSolution_XML.air:FareNote_XML}}}
                {{{air:AirPricingSolution_XML.common_v47_0:HostToken_XML}}}
            </air:AirPricingSolution>

            <com:ActionStatus Type="{{ActionStatusType}}" TicketDate="{{ticketDate}}" ProviderCode="{{provider}}" />

        </univ:AirCreateReservationReq>
    </soap:Body>
</soap:Envelope>
`;
