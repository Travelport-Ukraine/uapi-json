# Terminal :computer:

Terminal service provides an interface to run terminal commands
for terminal-enabled uAPI credentials.

# PCC Emulation
<a name='emulatePcc'></a>

You can use Terminal service to run commands on behalf of your own PCC
or to use `emulatePcc` option from [auth](../README.md#auth)
to run commands on behalf of other PCC using your own Service bureau.

In `uapi` terminals are not linked to the specific PCC and identified only by tokens.
That's why, if the `emulatePcc` option is passed, we run `SEM` command behind the scene
to provide emulation for specific PCC.

Though you may still send `SEM` commands to the terminal on your own,
in order to not messthings up, we highly recommend you to use several terminal instances
for several PCC emulations.

See [advanced emulation example](../examples/Terminal/emulation.js) to get an example
on how to use emulation.

# Session closing
Be aware to close the session after all your manipulations with the terminal.

Session closing takes the current token and sends a request to terminate the session,
see [close_session](#close_session) method.

# API

**TerminalService**
* [`.executeCommand(command, stopMD)`](#execute_command)
* [`.closeSession()`](#close_session)
* [`.getToken()`](#get_token)

## .executeCommand(command, stopMD)
<a name="execute_command"></a>
Executes a command in terminal and returns its terminal response

**Returns**: `Promise` that returns terminal command response in `String` format

| Param | Type | Description |
| --- | --- | --- |
| command | `String` | String representation of the command you want to execute |
| stopMD | `(screens) => boolean` | Function which gets all previous screens concatenated and detects if more `MD` command needed. |

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
