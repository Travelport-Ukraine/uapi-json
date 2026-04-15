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

# uAPI error handling

In case you want to handle some specific errors from uAPI, you can provde `uapiErrorHandler` function
in options.

Function should return response from retried command or any other command.

Footprint of the functions should be as follows:
```javascript
async (
  executeCommandWithRetry,
  { command, error: err }
) => {
  // your code goes here
  // response is an array of strings (lines of terminal response)
  return response;
}
```

# Session closing
Be aware to close the session after all your manipulations with the terminal.

Session closing takes the current token and sends a request to terminate the session,
see [close_session](#close_session) method.

# API

**TerminalService**
* [`.executeCommand(command, options)`](#execute_command)
* [`.executeStatelessCommandWhenIdle(command, options)`](#execute_stateless_command_when_idle)
* [`.closeSession()`](#close_session)
* [`.getToken()`](#get_token)

## .executeCommand(command, options)
<a name="execute_command"></a>
Executes a command in terminal and returns its terminal response

**Returns**: `Promise` that returns terminal command response in `String` format

| Param | Type | Description |
| --- | --- | --- |
| command | `String` | String representation of the command you want to execute |
| options | `Object` | Optional command execution options. |

**Options**

| Param | Type | Description |
| --- | --- | --- |
| stopMD | `(screens) => boolean` | Function which gets all previous screens concatenated and detects if more `MD` command needed. |
| sleepInterval | `Number` | Minimum delay in milliseconds from the last successful full terminal response to the next command send. |

`stopMD` must be passed inside `options`; passing it directly as the second argument
is not supported.

## .executeStatelessCommandWhenIdle(command, options)
<a name="execute_stateless_command_when_idle"></a>
Executes a stateless command when terminal is idle and returns its terminal response.

If terminal is busy, command is added to the stateless commands queue and executed
after the current command and previously queued stateless commands are finished.
Queued commands are executed one by one in FIFO order.
If terminal is idle, regular `executeCommand` calls execute before queued stateless
commands.

This method is promise based. Every caller receives the result or error from its own
command execution. If one queued command fails, later queued commands are still executed.
If the active command fails before the queue is drained, queued stateless commands are
skipped and rejected with the same terminal error.

Stateless means command is independent of terminal context, such as an open booking,
fare search, or other GDS working state. This method does not detect or enforce
statelessness; caller is responsible for using it only for commands safe in any
terminal context.

**Returns**: `Promise` that returns terminal command response in `String` format

| Param | Type | Description |
| --- | --- | --- |
| command | `String` | String representation of the stateless command you want to execute |
| options | `Object` | Optional command execution options. |

**Options**

| Param | Type | Description |
| --- | --- | --- |
| stopMD | `(screens) => boolean` | Function which gets all previous screens concatenated and detects if more `MD` command needed. |
| sleepInterval | `Number` | Minimum delay in milliseconds from the last successful full terminal response to the next command send. |

```javascript
await TerminalService.executeCommand('TE', {
  stopMD: (screens) => screens.includes('END OF DISPLAY'),
});

await TerminalService.executeStatelessCommandWhenIdle('.CDIEV', {
  sleepInterval: 1000,
});
```

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
