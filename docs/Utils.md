# Utils :cd:

Some powerfull utils that can help you build best products.

# API

**UtilsService**
* [.currencyConvert(params)](#currency)
* [.referenceData(params)](#refdata)

<a name="currency"></a>
## .currencyConvert(params)
Return list of currencies exchange rates.

**Returns**: `Promise`
**See**: [CurrencyConversionReq](https://support.travelport.com/webhelp/uapi/uAPI.htm#../Subsystems/Schemas/Content/Schemas/CurrencyConversionReq.html%3FTocPath%3DSchema%7C_____47)

| Param | Type | Description |
| --- | --- | --- |
| currencies | `Array<Object{from, to}>` | Array of objects where `from` property represents currency you have and `to` - currency you want. |

**See: <a href="../examples/Utils/currencyConvert.js">Currency convert example</a>**

<a name="refdata"></a>
## .referenceData(params)
Returns list of Reference Data 

**Returns**: `Promise`
**See**: [Reference Data](https://support.travelport.com/webhelp/uapi/Content/Getting_Started/Design_Considerations/Reference_Data.htm)

| Param | Type | Description |
| --- | --- | --- |
| dataType | `String` | Types of Reference Data as specified from the support page. <a href="./ReferenceDataTypes.md">See List</a> |
| TraceId  | `String` | Random string or uuid to identify the request |

**See: <a href="../examples/Utils/referenceData.js">Reference Data request example</a>**
