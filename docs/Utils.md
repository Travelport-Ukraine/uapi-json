# Utils :cd:

Some powerfull utils that can help you build best products.

# API

**UtilsService**
* [.currencyConvert(params)](#currency)

## .currencyConvert(params)
<a name="currency"></a>
Return list of currencies exchange rates.

**Returns**: `Promise`
**See**: [CurrencyConversionReq](https://support.travelport.com/webhelp/uapi/uAPI.htm#../Subsystems/Schemas/Content/Schemas/CurrencyConversionReq.html%3FTocPath%3DSchema%7C_____47)

| Param | Type | Description |
| --- | --- | --- |
| currencies | `Array<Object{from, to}>` | Array of objects where `from` property represents currency you have and `to` - currency you want. |

**See: <a href="../examples/Utils/currencyConvert">Currency convert example</a>**
