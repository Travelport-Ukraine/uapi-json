const uAPI = require('./index');

const config7j8j = {
  username: 'Universal API/uAPI7980742859-07362d4f',
  password: 'K&e3%4Lfo=',
  targetBranch: 'P2731609',
  emulatePcc: '7J8J',
};

// const config36ag = {
//   username: 'Universal API/uAPI7980742859-07362d4f',
//   password: 'K&e3%4Lfo=',
//   targetBranch: 'P2731609',
//   emulatePcc: '36AG',
// };

// const config3aq0 = {
//   username: 'Universal API/uAPI4466145968-d6034ec2 ',
//   password: 'm3CK9Y6j',
//   targetBranch: 'P2660493',
//   // emulatePcc: '3AQ0',
// };

// const config7e53 = {
//   username: 'Universal API/uAPI4466145968-d6034ec2 ',
//   password: 'm3CK9Y6j',
//   targetBranch: 'P2660493',
//   emulatePcc: '7E53',
// };

// const config36d5 = {
//   password: 'u2C2t8WQ',
//   targetBranch: 'P2660143',
//   username: 'Universal API/uAPI3210545979-0a952404',
// };

// const configPreprod = {
//   password: 'Z}w39iE_%K',
//   username: 'Universal API/uAPI4020390780-5aa5a254',
//   targetBranch: 'P7042916',
// };

// const TerminalServicePreprod = uAPI.createTerminalService(
//   {
//     auth: configPreprod,
//     debug: 2,
//     production: false,
//   }
// );

// const AirServicePreprod = uAPI.createAirService(
//   {
//     auth: configPreprod,
//     debug: 2,
//     production: false,
//   }
// );

const AirService7j8j = uAPI.createAirService(
  {
    auth: config7j8j,
    debug: 2,
    production: true,
  }
);

// const TerminalService7j8j = uAPI.createTerminalService(
//   {
//     auth: config7j8j,
//     debug: 2,
//     production: true,
//   }
// );

// const TerminalService36d5 = uAPI.createTerminalService(
//   {
//     auth: config36d5,
//     debug: 2,
//     production: true,
//   }
// );

// const AirService36ag = uAPI.createAirService(
//   {
//     auth: config36ag,
//     debug: 2,
//     production: true,
//   }
// );

// const AirService3aq0 = uAPI.createAirService(
//   {
//     auth: config3aq0,
//     debug: 2,
//     production: true,
//   }
// );

// const AirService7e53 = uAPI.createAirService(
//   {
//     auth: config7e53,
//     debug: 2,
//     production: true,
//   }
// );

// const AirService36d5 = uAPI.createAirService(
//   {
//     auth: config36d5,
//     debug: 2,
//     production: true,
//   }
// );

const searchParams = {
  legs: [
    {
      from: 'IEV',
      to: 'BRU',
      departureDate: '2017-11-10',
    },
    {
      from: 'BRU',
      to: 'IEV',
      departureDate: '2017-11-20',
    },
  ],
  passengers: {
    ADT: 1,
  },
  requestId: 'test-request',
};

AirService7j8j.shop(searchParams)
  .then(
    results => ({
      segments: [].concat(
        results[0].directions[0][0].segments,
        results[0].directions[1][0].segments
      ),
      rule: 'SIP',
      phone: {
        countryCode: '38',
        location: 'IEV',
        number: '0660419905',
      },
      passengers: [{
        lastName: 'ANAKIN',
        firstName: 'SKYWALKER',
        passCountry: 'UA',
        passNumber: 'ES221731',
        birthDate: '19680725',
        gender: 'M',
        ageCategory: 'ADT',
      }],
      // deliveryInformation: {
      //   name: 'Dmitry Chertousov',
      //   street: 'Maleckiego 5/23',
      //   city: 'Poznan',
      //   zip: '60705',
      //   country: 'Poland',
      // },
    })
  )
  .then(AirService7j8j.book)
  .then(result => console.log(JSON.stringify(result, null, 2)))
  .catch(console.error);


// AirService36d5.importPNR({ pnr: 'T8QJ05' })
//   .then(AirService36d5.toQueue({
//     pnr: 'T8QJ05',
//     pcc: '3AQ0',
//     queue: 50,
//   }))
//   .then(() => AirService3aq0.ticket({
//     pnr: 'T8QJ05',
//     fop: {
//       type: 'Cash',
//     },
//     commission: {
//       percent: '0',
//     },
//   }))
//   .then(() => AirService3aq0.importPNR({ pnr: 'T8QJ05' }))
//   .then(pnrData => console.log(JSON.stringify(pnrData, null, 2)))
//   .catch(console.error);

// // SINGLE TICKET
// AirService3aq0.importPNR({ pnr: 'AFTSK8' })
//   .then(pnrData => AirService3aq0.getTicket({ ticketNumber: pnrData[0].tickets[0].number }))
//   .then(data => console.log(JSON.stringify(data, null, 2)))
//   .catch(console.error);


// // CONJUCTION TICKET
// AirService7j8i.importPNR({
//   pnr: 'S52194',
// })
//   .then(data => console.log(JSON.stringify(data, null, 2)))
//   .catch(console.error);

// NORMAL
// AirService.getTicket({
//   ticketNumber: '0579902789293',
// })
//   .then(data => console.log(JSON.stringify(data, null, 2)))
//   .catch(console.error);


// AirService7j8j.importPNR({
//   pnr: '8167L2',
// })
//   .then(data => console.log(JSON.stringify(data, null, 2)))
//   .catch(err => console.error(JSON.stringify(err, null, 2)));

// AirService7j8j.importPNR({
//   pnr: '6V5F26',
//   // cancelTickets: true,
// });

// AirService7j8j.importPNR({
//   pnr: 'DK1CNK',
//   // cancelTickets: true,
// })
//   .then(data => console.log(JSON.stringify(data, null, 2)))
//   .catch(err => console.error(err));

// AirServicePreprod.getTicket({
//   ticketNumber: '5555267481152',
// })
//   .then(console.log)
//   .catch(console.error);

// TerminalService7j8j.executeCommand('><')
//   .then(console.log)
//   .catch(console.error);


// ticketNumber: '9949902789371',
// Response SOAP:  <SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/"><SOAP:Body><air:AirRetrieveDocumentRsp TransactionId="EFFD6D400A07425DCBB23D8BBF08F7CD" ResponseTime="117" xmlns:air="http://www.travelport.com/schema/air_v39_0" xmlns:common_v39_0="http://www.travelport.com/schema/common_v39_0"><common_v39_0:ResponseMessage Code="12009" Type="Error" ProviderCode="1G">Host error during ticket retrieve.- Ticket Number 9949902789371- UNABLE TO PROCESS UNABLE TO PROCESS</common_v39_0:ResponseMessage></air:AirRetrieveDocumentRsp></SOAP:Body></SOAP:Envelope>
// uAPI_Parse execution time: 1ms
// Parsed response {"common_v39_0:ResponseMessage":[{"_":"Host error during ticket retrieve.- Ticket Number 9949902789371- UNABLE TO PROCESS UNABLE TO PROCESS","Code":"12009","Type":"Error","ProviderCode":"1G"}],"TransactionId":"EFFD6D400A07425DCBB23D8BBF08F7CD","ResponseTime":"117","xmlns:air":"http://www.travelport.com/schema/air_v39_0","xmlns:common_v39_0":"http://www.travelport.com/schema/common_v39_0"}
// {}


// ticketNumber: '0649902781111',
// Response SOAP:  <SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/"><SOAP:Body><air:AirRetrieveDocumentRsp TransactionId="EFFEA6CF0A07425B6CFB8AB5F193E18F" ResponseTime="310" xmlns:air="http://www.travelport.com/schema/air_v39_0" xmlns:common_v39_0="http://www.travelport.com/schema/common_v39_0"><common_v39_0:ResponseMessage Code="12009" Type="Error" ProviderCode="1G">Host error during ticket retrieve.</common_v39_0:ResponseMessage></air:AirRetrieveDocumentRsp></SOAP:Body></SOAP:Envelope>

