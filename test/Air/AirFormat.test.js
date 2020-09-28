const { expect } = require('chai');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const AirFormat = require('../../src/Services/Air/AirFormat');
const Parser = require('../../src/Request/uapi-parser');

const xmlFolder = path.join(__dirname, '..', 'FakeResponses', 'Air');
const { AirParsingError } = require('../../src/Services/Air/AirErrors');

describe('#AirFormat', () => {
  describe('.getBaggage()', () => {
    it('should work when object is null and undefined', () => {
      const parsed = AirFormat.getBaggage(null);
      expect(parsed).to.be.an('object').and.to.have.all.keys([
        'amount', 'units',
      ]);
      expect(parsed.amount).to.be.equal(0);
      expect(parsed.units).to.be.equal('piece');
    });

    it('should correctly parse air:NumberOfPieces', () => {
      const parsed = AirFormat.getBaggage({ 'air:NumberOfPieces': 10 });
      expect(parsed).to.be.an('object').and.to.have.all.keys([
        'amount', 'units',
      ]);
      expect(parsed.amount).to.be.equal(10);
      expect(parsed.units).to.be.equal('piece');
    });

    it('should correctly parse air:MaxWeight', () => {
      const parsed = AirFormat.getBaggage({ 'air:MaxWeight': { Unit: 'kg', Value: 10 } });
      expect(parsed).to.be.an('object').and.to.have.all.keys([
        'amount', 'units',
      ]);
      expect(parsed.amount).to.be.equal(10);
      expect(parsed.units).to.be.equal('kg');
    });
  });

  describe('.formatLowFaresSearch()', () => {
    it('should return list of fares without faresOnly param', () => {
      const uParser = new Parser('air:LowFareSearchRsp', 'v47_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/LowFaresSearch.2ADT1CNNIEVBKK.xml`).toString();

      return uParser.parse(xml).then((json) => {
        const result = AirFormat.formatLowFaresSearch({
          provider: '1G',
        }, json);

        expect(result).to.be.an('array').and.to.have.length.above(0);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should return an array with solutionResult = true', () => {
      const uParser = new Parser('air:LowFareSearchRsp', 'v47_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/LowFaresSearch.1ADTSELIEV.solutionResult.xml`).toString();

      return uParser.parse(xml).then((json) => {
        const result = AirFormat.formatLowFaresSearch({
          provider: '1G',
          solutionResult: true,
        }, json);

        expect(result).to.be.an('array').and.to.have.length.above(0);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should return an object with fares with solutionResult = true and faresOnly=false', () => {
      const uParser = new Parser('air:LowFareSearchRsp', 'v47_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/LowFaresSearch.1ADTSELIEV.solutionResult.xml`).toString();

      return uParser.parse(xml).then((json) => {
        const result = AirFormat.formatLowFaresSearch({
          provider: '1G',
          solutionResult: true,
          faresOnly: false,
        }, json);

        expect(result).to.be.an('object');
        expect(result).to.have.all.keys('transactionId', 'fares');
        expect(result.transactionId).to.be.equal('EEEEEEEEEEEE59CD33ED7BE13D945FEE');
        expect(result.fares).to.be.an('array').and.to.have.length(55);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should return an object with fares with faresOnly=false', () => {
      const uParser = new Parser('air:LowFareSearchRsp', 'v47_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/LowFaresSearch.2ADT1CNNIEVBKK.xml`).toString();

      return uParser.parse(xml).then((json) => {
        const result = AirFormat.formatLowFaresSearch({
          provider: '1G',
          faresOnly: false,
        }, json);

        expect(result).to.be.an('object');
        expect(result).to.have.all.keys('transactionId', 'fares');
        expect(result.transactionId).to.be.equal('EA12C12B0A0759C12225F702ADCB99E9');
        expect(result.fares).to.be.an('array').and.to.have.length(27);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should return an object with fares with faresOnly=false in asynch results', () => {
      const uParser = new Parser('air:LowFareSearchAsynchRsp', 'v47_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/LowFaresSearchAsync.1ADTICNKKJ.xml`).toString();

      return uParser.parse(xml).then((json) => {
        const result = AirFormat.formatLowFaresSearch({
          provider: '1G',
          faresOnly: false,
        }, json);

        expect(result).to.be.an('object');
        expect(result).to.have.any.keys('transactionId', 'searchId', 'providerCode', 'hasMoreResults', 'fares');
        expect(result.transactionId).to.be.equal('A93F11A30A076478EAD0520D3E91FDC7');
        expect(result.searchId).to.be.equal('A93F11A30A076478EAD0520D3E91FDC7_OICNKKJ20Oct19Economyfnull-1f-1-1tftnull300-1-1MI1GnullfADTKRWnullnullnullnullnullnullnullnullnullfff2124774');
        expect(result.providerCode).to.be.equal('1G');
        expect(result.fares).to.be.an('array').and.to.have.length(13);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });
  });
  describe('.getBaggageInfo()', () => {
    it('should work when object is null and undefined', () => {
      const parsed = AirFormat.getBaggageInfo(null);
      expect(parsed).to.be.an('object').and.to.have.all.keys([
        'amount', 'units',
      ]);
      expect(parsed.amount).to.be.equal(0);
      expect(parsed.units).to.be.equal('piece');
    });

    const defaultValue = {
      'air:TextInfo': [
        '20K',
        'BAGGAGE DISCOUNTS MAY APPLY BASED ON FREQUENT FLYER STATUS/ ONLINE CHECKIN/FORM OF PAYMENT/MILITARY/ETC.',
      ],
      'air:BagDetails': [
        {
          ApplicableBags: '1stChecked',
          BasePrice: 'UAH1026',
          ApproximateBasePrice: 'UAH1026',
          TotalPrice: 'UAH1026',
          ApproximateTotalPrice: 'UAH1026',
          'air:BaggageRestriction': {
            'air:TextInfo': {
              'air:Text': 'UPTO50LB/23KG AND UPTO62LI/158LCM'
            }
          }
        },
      ]
    };

    it('should correctly parse air:TextInfo in pieces', () => {
      const parsed = AirFormat.getBaggageInfo({
        'air:TextInfo': [
          '1P',
          'BAGGAGE DISCOUNTS MAY APPLY BASED ON FREQUENT FLYER STATUS/ ONLINE CHECKIN/FORM OF PAYMENT/MILITARY/ETC.',
        ]
      });
      expect(parsed).to.be.an('object').and.to.have.keys([
        'amount', 'units',
      ]);
      expect(parsed.amount).to.be.equal('1');
      expect(parsed.units).to.be.equal('piece');
    });
    it('should correctly parse air:TextInfo in kgs', () => {
      const parsed = AirFormat.getBaggageInfo({
        'air:TextInfo': [
          '20K',
          'BAGGAGE DISCOUNTS MAY APPLY BASED ON FREQUENT FLYER STATUS/ ONLINE CHECKIN/FORM OF PAYMENT/MILITARY/ETC.',
        ]
      });
      expect(parsed).to.be.an('object').and.to.have.keys([
        'amount', 'units',
      ]);
      expect(parsed.amount).to.be.equal('20');
      expect(parsed.units).to.be.equal('kilograms');
    });

    it('should correctly parse air:BagDetails', () => {
      const parsed = AirFormat.getBaggageInfo(defaultValue);
      expect(parsed).to.be.an('object').and.to.have.keys([
        'amount', 'units',
        'detail',
      ]);
      expect(parsed.detail[0].applicableBags).to.be.equal('1stChecked');
      expect(parsed.detail[0].basePrice).to.be.equal('UAH1026');
    });
  });

  describe('.formatPassengerCategories', () => {
    it('should throw error without passenger type', () => {
      try {
        AirFormat.formatPassengerCategories({
          'TESTABCD12==': {
          }
        });
      } catch (e) {
        expect(e).to.be.an.instanceof(AirParsingError.PTCTypeInvalid);
      }
    });
    it('should throw error with empty passenger type array', () => {
      try {
        AirFormat.formatPassengerCategories({
          'TESTABCD12==': {
            'air:PassengerType': [],
          }
        });
      } catch (e) {
        expect(e).to.be.an.instanceof(AirParsingError.PTCIsNotSet);
      }
    });
    it('should able to parse string passenger type', () => {
      const parsed = AirFormat.formatPassengerCategories({
        'TESTABCD12==': {
          'air:PassengerType': 'ADT',
        }
      });

      expect(parsed.passengerCounts.ADT).to.be.equal(1);
    });
    it('should able to parse array of passenger type', () => {
      const parsed = AirFormat.formatPassengerCategories({
        '3EvdYq7Q2BKA+SFvEAAAAA==': {
          'air:PassengerType': ['ADT', 'ADT'],
        },
        '3EvdYq7Q2BKAXSFvEAAAAA==': {
          'air:PassengerType': ['CNN'],
        }
      });

      expect(parsed.passengerCounts.ADT).to.be.equal(2);
      expect(parsed.passengerCounts.CNN).to.be.equal(1);
    });
    it('should able to parse object array of passenger type', () => {
      const parsed = AirFormat.formatPassengerCategories({
        '3EvdYq7Q2BKA+SFvEAAAAA==': {
          'air:PassengerType': [{ Code: 'ADT' }, { Code: 'ADT' }],
        },
        '3EvdYq7Q2BKAXSFvEAAAAA==': {
          'air:PassengerType': [{ Code: 'CNN' }],
        }
      });

      expect(parsed.passengerCounts.ADT).to.be.equal(2);
      expect(parsed.passengerCounts.CNN).to.be.equal(1);
    });
    it('should correctly to parse passenger fares by passenger types', () => {
      const parsed = AirFormat.formatPassengerCategories(
        {
          't7MhYq3R2BKANHnsEAAAAA==': {
            'air:FareInfo': {
              't7MhYq3R2BKASHnsEAAAAA==': {
                Key: 't7MhYq3R2BKASHnsEAAAAA==',
                FareBasis: 'XAVNA0BQ',
                PassengerTypeCode: 'ADT',
                Origin: 'SLC',
                Destination: 'SFO',
                EffectiveDate: '2019-05-13T16:34:00.000+09:00',
                DepartureDate: '2019-10-10',
                Amount: 'KRW94200',
                NotValidBefore: '2019-10-10',
                NotValidAfter: '2019-10-10',
                TaxAmount: 'KRW23500'
              }
            },
            'air:PassengerType': ['ADT'],
            'air:BookingInfo': [
              {
                BookingCode: 'E',
                CabinClass: 'Economy',
                FareInfoRef: 't7MhYq3R2BKASHnsEAAAAA==',
                SegmentRef: 't7MhYq3R2BKAJHnsEAAAAA==',
                HostTokenRef: 't7MhYq3R2BKAMHnsEAAAAA=='
              },
            ],
            'air:TaxInfo': {
              't7MhYq3R2BKAOHnsEAAAAA==': {
                Category: 'AY',
                Amount: 'KRW6400',
                Key: 't7MhYq3R2BKAOHnsEAAAAA=='
              },
              't7MhYq3R2BKAPHnsEAAAAA==': {
                Category: 'US',
                Amount: 'KRW7100',
                Key: 't7MhYq3R2BKAPHnsEAAAAA=='
              },
              't7MhYq3R2BKAQHnsEAAAAA==': {
                'common_v47_0:TaxDetail': [
                  {
                    Amount: 'USD5.00',
                    OriginAirport: 'SLC'
                  },
                ],
                Category: 'XF',
                Amount: 'KRW5200',
                Key: 't7MhYq3R2BKAQHnsEAAAAA=='
              },
              't7MhYq3R2BKARHnsEAAAAA==': {
                'common_v47_0:TaxDetail': [
                  {
                    Amount: 'USD4.20',
                    OriginAirport: 'SLC'
                  },
                ],
                Category: 'ZP',
                Amount: 'KRW4800',
                Key: 't7MhYq3R2BKARHnsEAAAAA=='
              }
            },
            'air:FareCalc': 'SLC DL SFO 82.79XAVNA0BQ USD82.79END',
            'air:ChangePenalty': {
              'air:Percentage': '100.00',
              PenaltyApplies: 'Anytime'
            },
            'air:CancelPenalty': {
              'air:Percentage': '100.00',
              NoShow: 'true',
              PenaltyApplies: 'Anytime'
            },
            Key: 't7MhYq3R2BKANHnsEAAAAA==',
            TotalPrice: 'KRW117700',
            BasePrice: 'USD82.79',
            ApproximateTotalPrice: 'KRW117700',
            ApproximateBasePrice: 'KRW94200',
            EquivalentBasePrice: 'KRW94200',
            ApproximateTaxes: 'KRW23500',
            Taxes: 'KRW23500',
            LatestTicketingTime: '2019-05-14T23:59:00.000+09:00',
            PricingMethod: 'Guaranteed',
            IncludesVAT: 'false',
            ETicketability: 'Yes',
            PlatingCarrier: 'DL',
            ProviderCode: '1G'
          }
        }
      );

      expect(parsed.passengerCounts.ADT).to.be.equal(1);

      expect(parsed.passengerFares.ADT.totalPrice).to.be.equal('KRW117700');
    });
  });

  describe('.formatFarePricingInfo', () => {
    it('should correctly parse air:ChangePenalty', () => {
      const parsed = AirFormat.formatFarePricingInfo({
        'air:ChangePenalty': {
          'air:Amount': 'Amount',
          'air:Percentage': '100',
          PenaltyApplies: 'Anytime',
        }
      });

      expect(parsed).to.be.an('object').and.to.have.keys([
        'latestTicketingTime',
        'eTicketability',
        'refundable',
        'changePenalty',
        'cancelPenalty',
      ]);

      expect(parsed.changePenalty.amount).to.be.equal('Amount');
      expect(parsed.changePenalty.percentage).to.be.equal('100');
      expect(parsed.changePenalty.penaltyApplies).to.be.equal('Anytime');
    });

    it('should correctly parse air:CancelPenalty', () => {
      const parsed = AirFormat.formatFarePricingInfo({
        'air:CancelPenalty': {
          'air:Amount': 'Amount',
          'air:Percentage': '100',
          NoShow: 'true',
          PenaltyApplies: 'Anytime',
        }
      });

      expect(parsed).to.be.an('object').and.to.have.keys([
        'latestTicketingTime',
        'eTicketability',
        'refundable',
        'changePenalty',
        'cancelPenalty',
      ]);

      expect(parsed.cancelPenalty.amount).to.be.equal('Amount');
      expect(parsed.cancelPenalty.percentage).to.be.equal('100');
      expect(parsed.cancelPenalty.noShow).to.be.equal('true');
      expect(parsed.cancelPenalty.penaltyApplies).to.be.equal('Anytime');
    });

    it('should correctly parse refundable', () => {
      const parsed = AirFormat.formatFarePricingInfo({
        Refundable: 'true'
      });

      expect(parsed).to.be.an('object').and.to.include.any.keys([
        'refundable',
      ]);

      expect(parsed.refundable).to.be.equal('true');
    });

    it('should correctly parse eTicketability', () => {
      const parsed = AirFormat.formatFarePricingInfo({
        eTicketability: 'Yes'
      });

      expect(parsed).to.be.an('object').and.to.include.any.keys([
        'eTicketability',
      ]);

      expect(parsed.eTicketability).to.be.equal('Yes');
    });

    it('should correctly parse latestTicketingTime', () => {
      const parsed = AirFormat.formatFarePricingInfo({
        LatestTicketingTime: '2019-05-14T23:59:00.000+09:00'
      });

      expect(parsed).to.be.an('object').and.to.include.any.keys([
        'latestTicketingTime',
      ]);

      expect(parsed.latestTicketingTime).to.be.equal('2019-05-14T23:59:00.000+09:00');
    });
  });
});

describe('.setReferencesForSegments', () => {
  it('should add nextSegmentReference', () => {
    const segments = [
      {
        group: 0,
        uapi_segment_ref: 'EFmoUIBAAA/B1NrWrDAAAA==',
        uapiSegmentReference: 'EFmoUIBAAA/B1NrWrDAAAA==',
      },
      {
        group: 0,
        uapi_segment_ref: 'EFmoUIBAAA/B3NrWrDAAAA==',
        uapiSegmentReference: 'EFmoUIBAAA/B3NrWrDAAAA==',
      },
      {
        group: 1,
        uapi_segment_ref: 'H57jFKkJ0BKADVIflJAAAA==',
        uapiSegmentReference: 'H57jFKkJ0BKADVIflJAAAA==',
      },
      {
        group: 2,
        uapi_segment_ref: 'D1cSNQBAAA/BF/bRSAAAAA==',
        uapiSegmentReference: 'D1cSNQBAAA/BF/bRSAAAAA==',
      },
    ];

    const referencedSegments = AirFormat.setReferencesForSegments(segments);

    expect(referencedSegments).to.have.lengthOf(4);
    expect(referencedSegments[0].nextSegmentReference).to.be.equal('EFmoUIBAAA/B3NrWrDAAAA==');
    expect(referencedSegments[1].nextSegmentReference).to.be.equal(null);
    expect(referencedSegments[2].nextSegmentReference).to.be.equal(null);
    expect(referencedSegments[3].nextSegmentReference).to.be.equal(null);
  });
});
