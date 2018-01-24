# Terminal :computer:

Terminal service provides an interface to run terminal commands
for terminal-enabled uAPI credentials.

You can use Terminal service to run commands on behalf of your own PCC
or to use `emulatePcc` option from `auth` to run commands on behalf of other PCC
using your own Service bureau.

# API

**TerminalService**
* [`.executeCommand()`](#execute_command)
* [`.closeSession()`](#close_session)
* [`.getToken()`](#get_token)

## .executeCommand(command)
<a name="execute_command"></a>
Executes a command in terminal and returns its terminal response

**Returns**: `Promise` that returns terminal command response in `String` format

| Param | Type | Description |
| --- | --- | --- |
| command | `String` | String representation of the command you want to execute |

## .closeSession()
<a name="close_session"></a>
When you have finished command execution it's necessary to close terminal connection
to free up space in the terminal pool. Takes no parameters

**Returns**: `Promise` which fullfills with true if terminal was succesfully closed


## .getToken()
<a name="get_token"></a>
Use this method to resolve token.
If token is resolved after `executeCommand` it takes no time for resolving.  
Takes no parameters

**Returns**: `Promise<String>`
