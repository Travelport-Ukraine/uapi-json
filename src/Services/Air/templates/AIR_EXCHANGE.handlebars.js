module.exports = `
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <air:AirExchangeReq
                xmlns:air="http://www.travelport.com/schema/air_v47_0"
                xmlns:common_v47_0="http://www.travelport.com/schema/common_v47_0"
                AuthorizedBy="user"
                ReturnReservation="false"
                TargetBranch="{{TargetBranch}}"
        >
            <com:BillingPointOfSaleInfo
                    xmlns:com="http://www.travelport.com/schema/common_v47_0"
                    OriginApplication="UAPI"/>

            {{#if emulatePcc}}
                <com:OverridePCC ProviderCode="{{provider}}"
                                 xmlns:com="http://www.travelport.com/schema/common_v47_0"
                                 PseudoCityCode="{{emulatePcc}}"
                />
            {{/if}}

            <air:AirReservationLocatorCode>{{uapi_reservation_locator}}</air:AirReservationLocatorCode>

            {{{xml.air:AirPricingSolution_XML}}}
            {{{xml.air:AirExchangeBundle_XML}}}
            {{{xml.common_v47_0:HostToken_XML}}}

            <com:FormOfPayment
                    xmlns:com="http://www.travelport.com/schema/common_v47_0"
                    Type="Cash"
            />
        </air:AirExchangeReq>
    </soap:Body>
</soap:Envelope>
`;
