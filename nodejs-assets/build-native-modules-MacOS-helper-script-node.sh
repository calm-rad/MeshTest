#!/bin/bash
      # Helper script for Gradle to call node on macOS in case it is not found
      export PATH=$PATH:/usr/local/lib/node_modules/npm/node_modules/npm-lifecycle/node-gyp-bin:/Users/Armin/Documents/MeshTest/node_modules/nodejs-mobile-react-native/node_modules/.bin:/Users/Armin/Documents/MeshTest/node_modules/.bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/Library/Apple/usr/bin:/Users/Armin/Library/Android/sdk/emulator:/Users/Armin/Library/Android/sdk/tools:/Users/Armin/Library/Android/sdk/tools/bin:/Users/Armin/Library/Android/sdk/platform-tools:/Users/Armin/Library/Android/sdk/emulator:/Users/Armin/Library/Android/sdk/tools:/Users/Armin/Library/Android/sdk/tools/bin:/Users/Armin/Library/Android/sdk/platform-tools
      node $@
    