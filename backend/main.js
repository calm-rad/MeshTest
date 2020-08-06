// This is the loader file that sets up nodejs-mobile before continuing with index.js
const os = require('os');
const rn_bridge = require('rn-bridge');
const dataDir = rn_bridge.app.datadir();

const setStrongGlobal = (target, prop, value) => {
  if (typeof value === 'object') {
    value = Object.freeze(value);
  }
  Object.defineProperty(target, prop, {
    value,
    writable: false,
    enumerable: false,
    configurable: false,
  });
};

setStrongGlobal(global, 'dataDir', dataDir);
setStrongGlobal(global, 'tmpDir', os.tmpdir());

var Module = require('module');
if (!global.originalRequire) {
  setStrongGlobal(global, 'originalRequire', Module.prototype.require);
}
setStrongGlobal(
  Module.prototype,
  'require',
  new Proxy(Module.prototype.require, {
    apply(target, thisArg, argumentsList) {
      if (typeof argumentsList[0] === 'string') {
        // TODO H - Check for protocols, else check for normal require, else check Documents directory, else fallback to normal require (for failure)
      }
      return Reflect.apply(target, thisArg, argumentsList);
    },
  }),
);

// TODO H - Migrate listeners here to setup
// Echo every message received from react-native.
rn_bridge.channel.on('message', msg => {
  rn_bridge.channel.send(msg);
});

// Inform react-native node is initialized.
rn_bridge.channel.send('Node was initialized.');

// Set default directory
os.homedir = () => dataDir;
process.cwd = () => dataDir;

// Force libsodium to use a WebAssembly implementation
if (process.env == null) {
  process.env = {};
}
// process.env.DEBUG = '*'; // uncomment this to debug! don't commit it tho
// process.env.CHLORIDE_JS = 'yes'; // uncomment to enable WASM libsodium

// Report JS backend crashes
process.on('unhandledRejection', (reason, _promise) => {
  console.log('[ERROR] NODE - unhandledRejection', reason, _promise);
  rn_bridge.channel.post('browser-error', {error: reason});
  setTimeout(() => {
    process.exit(1);
  });
});
process.on('uncaughtException', err => {
  console.log('[ERROR] NODE - uncaughtException', err);
  rn_bridge.channel.post('browser-error', {error: err});
  setTimeout(() => {
    process.exit(1);
  });
});
const _removeAllListeners = process.removeAllListeners;
process.removeAllListeners = function removeAllListeners(eventName) {
  if (typeof eventName === 'string') {
    if (eventName !== 'uncaughtException') {
      return _removeAllListeners.call(this, eventName);
    }
    return process;
  }
};

require('./index.js');
