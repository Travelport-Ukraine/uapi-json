module.exports = `
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:air="http://www.travelport.com/schema/air_v47_0"
  xmlns:com="http://www.travelport.com/schema/common_v47_0"
  xmlns:univ="http://www.travelport.com/schema/universal_v47_0"
  >
  <soapenv:Header/>
  <soapenv:Body>
    <univ:UniversalRecordModifyReq AuthorizedBy="user" TargetBranch="{{TargetBranch}}" Version="{{version}}">
      <com:BillingPointOfSaleInfo OriginApplication="UAPI"/>
      {{#if emulatePcc}}
        <com:OverridePCC ProviderCode="{{provider}}" PseudoCityCode="{{emulatePcc}}"/>
      {{/if}}
      <univ:RecordIdentifier ProviderCode="{{provider}}" ProviderLocatorCode="{{pnr}}" UniversalLocatorCode="{{universalRecordLocatorCode}}"/>
      <univ:UniversalModifyCmd Key="BOOKING_MODIFY_SEGMENTS"> 
        <univ:AirAdd ReservationLocatorCode="{{reservationLocatorCode}}" > 
          {{#segments}}
          <air:AirSegment
            ArrivalTime="{{arrival}}"
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
            Group="{{group}}"
          >
            {{#if transfer}}
            <air:Connection/>
            {{/if}}
          </air:AirSegment>
          {{/segments}}
        </univ:AirAdd>
      </univ:UniversalModifyCmd>
    </univ:UniversalRecordModifyReq>
  </soapenv:Body>
</soapenv:Envelope>
`;
