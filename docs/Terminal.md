# Terminal :computer:

Terminal service provides an interface to run terminal commands
for terminal-enabled uAPI credentials.

# PCC Emulation
<a name='emulatePcc'></a>

You can use Terminal service to run commands on behalf of your own PCC
or to use `emulatePcc` option from [auth](../README.md#auth) to run commands on behalf of other PCC
using your own Service bureau. 

If you logged in with your PCC you're still able to execute a command on behalf of other PCC, just simply switch PCC with the Terminal command `SEM/TARGET_PCC/AG`.

```javascript
const auth = {
  username: 'Universal API/ХХХХХХХХХХ',
  password: 'ХХХХХХХХХХ',
  targetBranch: 'ХХХХХХХ',
  emulatePcc: 'ХХХХ', // Optional
};

const TerminalService = uAPI.createTerminalService({
  auth: auth,
  debug: 2,
  production: true,
});

TerminalService.executeCommand('SEM/TARGET_PCC/AG')
  .then((res) => {
    console.log(res);
    TerminalService.closeSession();
  })
  .catch((err) => {
    console.error(err);
    TerminalService.closeSession();
  });
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
