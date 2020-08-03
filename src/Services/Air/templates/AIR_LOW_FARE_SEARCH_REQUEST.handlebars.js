module.exports = `
<!--Release 33-->
<!--Version Dated as of 14/Aug/2015 18:47:44-->
<!--Air Low Fare Search For Galileo({{provider}}) Request-->
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        {{#if async}}
        <air:LowFareSearchAsynchReq
            AuthorizedBy="user" TraceId="{{requestId}}" TargetBranch="{{TargetBranch}}"
            ReturnUpsellFare="true"
            xmlns:air="http://www.travelport.com/schema/air_v47_0"
            xmlns:com="http://www.travelport.com/schema/common_v47_0"
            >
        {{else}}
        <air:LowFareSearchReq
            AuthorizedBy="user" TraceId="{{requestId}}" TargetBranch="{{TargetBranch}}"
            ReturnUpsellFare="true"
            {{#if solutionResult}}
            SolutionResult="true"
            {{/if}}
            xmlns:air="http://www.travelport.com/schema/air_v47_0"
            xmlns:com="http://www.travelport.com/schema/common_v47_0"
            >
        {{/if}}
            <com:BillingPointOfSaleInfo OriginApplication="uAPI"/>
            {{#legs}}
            <air:SearchAirLeg>
                <air:SearchOrigin>
                    <com:CityOrAirport Code="{{from}}" PreferCity="true"/>
                </air:SearchOrigin>
                <air:SearchDestination>
                    <com:CityOrAirport Code="{{to}}" PreferCity="true"/>
                </air:SearchDestination>
                <air:SearchDepTime PreferredTime="{{departureDate}}"/>
                <air:AirLegModifiers>
                    {{#*inline "connectionPoint"}}
                      <com:ConnectionPoint>
                        <com:CityOrAirport Code="{{connection}}" />
                      </com:ConnectionPoint>
                    {{/inline}}

                    {{#if ../permittedConnectionPoints}}
                    <air:PermittedConnectionPoints>
                    {{#each ../permittedConnectionPoints as |connection|}}
                      {{> connectionPoint connection=connection}}
                    {{/each}}
                    </air:PermittedConnectionPoints>
                    {{/if}}

                    {{#if ../prohibitedConnectionPoints}}
                    <air:ProhibitedConnectionPoints>
                    {{#each ../prohibitedConnectionPoints as |connection| }}
                      {{> connectionPoint connection=connection}}
                    {{/each}}
                    </air:ProhibitedConnectionPoints>
                    {{/if}}

                    {{#if ../preferredConnectionPoints}}
                    <air:PreferredConnectionPoints>
                    {{#each ../preferredConnectionPoints as |connection|}}
                      {{> connectionPoint connection=connection}}
                    {{/each}}
                    </air:PreferredConnectionPoints>
                    {{/if}}
                
                    {{#if ../cabins}}
                    <air:PreferredCabins>
                        {{#each ../cabins}}
                        <com:CabinClass Type="{{capitalize this}}"/>
                        {{/each}}
                    </air:PreferredCabins>
                    {{/if}}
                    {{#if ../bookingClass}}
                    <air:PermittedBookingCodes>
                        {{#each ../bookingClass}}
                            <air:BookingCode Code="{{this}}" />
                        {{/each}}
                    </air:PermittedBookingCodes>
                    {{/if}}    
                </air:AirLegModifiers>
            </air:SearchAirLeg>
            {{/legs}}
            <air:AirSearchModifiers
                {{#if maxJourneyTime}}
                    MaxJourneyTime="{{maxJourneyTime}}"
                {{/if}}
                {{#if maxSolutions}}
                    MaxSolutions="{{maxSolutions}}"
                {{/if}}
            >
                <air:PreferredProviders>
                    <com:Provider Code="{{provider}}" />
                </air:PreferredProviders>
                {{#if carriers}}
                <air:PermittedCarriers>
                    {{#carriers}}
                        <com:Carrier Code="{{.}}" />
                    {{/carriers}}
                </air:PermittedCarriers>
                {{/if}}
            </air:AirSearchModifiers>
            {{#passengers}}
            <com:SearchPassenger Code="{{ageCategory}}"{{#if child}} Age="9"{{/if}} />
            {{/passengers}}
            <air:AirPricingModifiers
              {{#if pricing}}
                {{#if pricing.currency}}
                CurrencyType="{{pricing.currency}}"
                {{/if}}
                {{#if pricing.eTicketability}}
                ETicketability="{{pricing.eTicketability}}"
                {{/if}}
                {{#if pricing.faresIndicator}}
                FaresIndicator="{{pricing.faresIndicator}}"
                {{else}}
                FaresIndicator="PublicAndPrivateFares"
                {{/if}}
              {{/if}}
              {{#if platingCarrier}}
                PlatingCarrier="{{platingCarrier}}"
              {{/if}}>
                {{#if business}}
                    <air:PermittedCabins>
                        <com:CabinClass Type="Business" />
                    </air:PermittedCabins>
                {{else}}
                    {{#if cabins}}
                    <air:PermittedCabins>
                        {{#each cabins}}
                        <com:CabinClass Type="{{capitalize this}}"/>
                        {{/each}}
                    </air:PermittedCabins>
                    {{/if}}
                {{/if}}
            </air:AirPricingModifiers>   

            {{#if emulatePcc}}
            <air:PCC>
                <com:OverridePCC ProviderCode="{{provider}}" PseudoCityCode="{{emulatePcc}}"/>
            </air:PCC>
            {{/if}}

        {{#if async}}
        </air:LowFareSearchAsynchReq>
        {{else}}
        </air:LowFareSearchReq>
        {{/if}}
    </soap:Body>
</soap:Envelope>
`;
