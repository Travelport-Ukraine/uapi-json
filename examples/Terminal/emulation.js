/**
 * This is an example of advnaced emulation, using several PCCs.
 * In this example you can see a booking transfer from one PCC to another.
 * You can use this code snippet without any warranties.
 */

const uAPI = require('../../index');
const auth = require('../../test/testconfig');

const authABCD = {
  ...auth,
  emulatePcc: 'ABCD'
};
const authWXYZ = {
  ...auth,
  emulatePcc: 'WXYZ'
};

const TerminalServiceABCD = uAPI.createTerminalService({
  auth: authABCD,
  debug: 2,
  production: true,
});

const TerminalServiceWXYZ = uAPI.createTerminalService({
  auth: authWXYZ,
  debug: 2,
  production: true,
});

const pnr = 'PNR001';

async function main() {
  // Opening booking in ABCD
  await TerminalServiceABCD.executeCommand(`*${pnr}`);
  // Transfering booking from ABCD to WXYZ
  const transferResponse = await TerminalServiceABCD.executeCommand('QEB/WXYZ/77');
  if (!transferResponse.includes('ON QUEUE')) {
    throw new Error('Booking was not transfered');
  }
  // Opening booking in WXYZ
  await TerminalServiceWXYZ.executeCommand(`*${pnr}`);
  // Ticketing in WXYZ
  await TerminalServiceWXYZ.executeCommand('TKP');
}

main();
