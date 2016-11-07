#[FlightService](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Flight_Information/Flight_Information.htm)

The Flight Information service provides the real-time status of a flight, in addition to scheduled flight information. Flight Information is typically used for flights that are either already in progress or scheduled for that day. 

* API

* **flightService**
  * flightInfo(params) ⇒ <code>Promise</code>
 
  
### .flightInfo(params)
Request for the Flight Info of segments.


| Param | Type | Description |
| --- | --- | --- |
| airline | <code>string</code> | The marketing carrier for the segment. |
| departure | <code>string</code> | The departure date; either the current date or a date in the future, not include the time zone which is derived from the origin location. |
| flightNumber | <code>string</code> | The flight number for the segment |
| key | <code>string</code> | The base-64 encoded UUID identifier that links the Flight Information responses to the request criteria. The value that is sent is returned in the resulting FlightInfo(s) elements. |

**Returns**: <code>Promise</code>
**See**: [Flight Information](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Flight_Information/Flight_Information.htm)