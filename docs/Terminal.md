# Terminal :computer:

Terminal service provides an interface to run terminal commands
for terminal-enabled uAPI credentials.

# PCC Emulation
<a name='emulatePcc'></a>

You can use Terminal service to run commands on behalf of your own PCC
or to use `emulatePcc` option from [auth](../README.md#auth) to run commands on behalf of other PCC
using your own Service bureau.

Creatin a terminal instance creates a terminal with a token that links to the specific Terminal instance to keep emulation running on one instance.

With token assignment if `emulatePcc` is passed, behind the scene - runs command `SEM` to provide emulation of specified PCC.

To don't mess things up we highly recommend you to use several terminal instances for several PCC emulations.

```javascript
const auth = {
  username: 'Universal API/ХХХХХХХХХХ',
  password: 'ХХХХХХХХХХ',
  targetBranch: 'ХХХХХХХ',
  emulatePcc: 'ABCD', // Let's emulate 'ABCD' PCC
};

/*
  We create a terminal instance.
  Behind the scene, it creates a token, credentials, and runs `SEM` to emulate the PCC.
*/
const TerminalService = uAPI.createTerminalService({
  auth: auth,
  debug: 2,
  production: true,
});

/*
  As soon as we have Terminal instance - we can execute commands on its behalf.
  All executed commands of the instance will run on PCC's behalf.
*/
TerminalService
  .executeCommand('I')
  .then(console.log)
  .then(
    () => TerminalService.executeCommand('.CDIEV')
  )
  .then(console.log)
  .then(
    () => TerminalService.executeCommand('.ADPS')
  )
  .then(console.log)
  .then(
    () => TerminalService.executeCommand('@LT')
  )
  .then(console.log)
  .then(
    () => TerminalService.closeSession()
  )
  .catch(console.error);
```

Be aware to close the session after all your manipulations with the terminal.

Session closing takes the current token and sends a request to terminate the session, see [here](#close_session).

Let's see another example with several emulations:
```javascript
const auth =  {
  username: 'Universal API/ХХХХХХХХХХ',
  password: 'ХХХХХХХХХХ',
  targetBranch: 'ХХХХХХХ',
};

// Let's create two instances for two PCCs - ABCD and WXYZ
const auth_ABCD = {
  ...auth,
  emulatePcc: 'ABCD'
};
const auth_WXYZ = {
  ...auth,
  emulatePcc: 'WXYZ'
};

// Now, create two terminal instances
const TerminalServiceABCD = uAPI.createTerminalService({
  auth: auth_ABCD,
  debug: 2,
  production: true,
});
const TerminalServiceWXYZ = uAPI.createTerminalService({
  auth: auth_WXYZ,
  debug: 2,
  production: true,
});

/*
  At this point, we are having two instances with two different PCCs connected to.
  Now we're able to execute a command on behalf of both of the PCCs.
*/
TerminalServiceABCD
  .executeCommand('I')
  .then(console.log)
  .then(
    () => TerminalService.closeSession()
  )
  .catch(console.error);

TerminalServiceWXYZ
  .executeCommand('I')
  .then(console.log)
  .then(
    () => TerminalService.closeSession()
  )
  .catch(console.error);
```

More usage examples are [here](../examples/Terminal/).

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
