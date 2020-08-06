#!/usr/bin/env node
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const util = require('util');
const ora = require('ora');
const exec = util.promisify(require('child_process').exec);

const loading = ora('...').start();
const say = require('say');
const verbose = !!process.argv.includes('--verbose');
const speak = true; // !!process.argv.includes('--speak');
const targetPlatform = !!process.argv.includes('--ios') ? 'ios' : 'android';
const fix = !!process.argv.includes('--fix') ? true : false;

async function runAndReport(label, task) {
  const now = Date.now();
  try {
    loading.start(label);
    var {stdout, stderr} = await task;
  } catch (err) {
    loading.fail();
    if (verbose) {
      console.error(stderr);
    }
    console.error(err.stack);
    if (speak) {
      say.speak('Gateway backend failed to build. ');
    }
    process.exit(err.code);
  }
  const duration = Date.now() - now;
  const durationLabel =
    duration < 1000
      ? duration + ' milliseconds'
      : duration < 60000
      ? (duration * 0.001).toFixed(1) + ' seconds'
      : ((duration * 0.001) / 60).toFixed(1) + ' minutes';
  loading.succeed(`${label} (${durationLabel})`);
  if (verbose) {
    console.log(stdout);
  }
}

(async function () {
  await runAndReport(
    'Move backend project to ./nodejs-assets',
    exec('./tools/backend/move-to-nodejs-assets.sh'),
  );

  await runAndReport(
    'Install backend node modules',
    exec('npm install', {
      cwd: './nodejs-assets/nodejs-project',
    }),
  );

  await runAndReport(
    'Install sodium native nodejs mobile',
    exec(
      'npm install github:calm-rad/sodium-native-nodejs-mobile --ignore-scripts',
      {
        cwd: './nodejs-assets/nodejs-project',
      },
    ),
  );
  await runAndReport(
    'Install utp native nodejs mobile',
    exec(
      'npm install github:calm-rad/utp-native-nodejs-mobile --ignore-scripts',
      {
        cwd: './nodejs-assets/nodejs-project',
      },
    ),
  );

  await runAndReport(
    'Patch backend node modules',
    exec('npx patch-package', {cwd: './nodejs-assets/nodejs-project'}),
  );

  await runAndReport(
    'Update package-lock.json in ./backend',
    exec(
      'cp ./nodejs-assets/nodejs-project/package-lock.json ' +
        './backend/package-lock.json',
    ),
  );

  await runAndReport(
    'Remove unused files meant for macOS or Windows or Electron',
    exec('./tools/backend/remove-unused-files.sh'),
  );

  if (targetPlatform === 'android') {
    await runAndReport(
      'Remove Sodium Native',
      exec(
        'find ./nodejs-assets/nodejs-project/node_modules -name sodium-native -type d -print0|xargs -0 rm -r --',
      ),
    );
    await runAndReport(
      'Move Babel Cli',
      exec(
        'mkdir -p ./babel-cli-holder && ' +
          'cp -r ./nodejs-assets/nodejs-project/node_modules/@babel/cli ./babel-cli-holder && ' +
          'rm -rf ./nodejs-assets/nodejs-project/node_modules/@babel/cli',
      ),
    );

    await runAndReport(
      'Build native modules for Android armeabi-v7a and arm64-v8a',
      exec('./tools/backend/build-native-modules.sh', {
        maxBuffer: 1024 * 1024 * 4 /* 4MB */,
      }),
    );

    await runAndReport(
      'Return Babel Cli to node_modules',
      exec(
        'cp -r ./babel-cli-holder/cli ./nodejs-assets/nodejs-project/node_modules/@babel && ' +
          'rm -rf ./babel-cli-holder',
      ),
    );
  }

  if (targetPlatform === 'android') {
    await runAndReport(
      'Bundle and minify backend JS into one file',
      exec('./tools/backend/bundle-noderify-android.sh'),
    );
  } else {
    await runAndReport(
      'Bundle and minify backend JS into one file',
      exec('./tools/backend/bundle-noderify.sh'),
    );
  }

  if (targetPlatform === 'android') {
    await runAndReport(
      'Move some shared dynamic native libraries to Android jniLibs',
      exec('./tools/backend/move-shared-libs-android.sh'),
    );

    await runAndReport(
      'Remove node_modules folder from the Android project',
      exec(
        'rm -rf ./nodejs-assets/nodejs-project/node_modules && ' +
          'rm ./nodejs-assets/nodejs-project/package-lock.json',
      ),
    );
  }

  if (speak) {
    say.speak('Finished building the backend!');
  }
})();
