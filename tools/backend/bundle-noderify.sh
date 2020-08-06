#!/bin/bash

# Any copyright is dedicated to the Public Domain.
# http://creativecommons.org/publicdomain/zero/1.0/

set -eEu -o pipefail
shopt -s extdebug
IFS=$'\n\t'
trap 'onFailure $?' ERR

function onFailure() {
  echo "Unhandled script error $1 at ${BASH_SOURCE[0]}:${BASH_LINENO[0]}" >&2
  exit 1
}

cd ./nodejs-assets/nodejs-project;

# Why some packages are filter'd or replaced:
#   bindings: after noderify, the paths to .node files might be different, so
#      we use a special fork of bindings
#   sodium-native: needs special compilation configs for mobile, and we'd like to
#      remove unused packages such as sodium-browserify etc
#   leveldown: newer versions of leveldown are intentionally ignoring
#      nodejs-mobile support, so we run an older version
#   utp-native: we want to compile for nodejs-mobile instead of using prebuilds
#   node-extend: can't remember why we need to replace it, build seemed to fail
#   non-private-ip: we use a "better" fork of this package
#   multiserver net plugin: we're fixing a corner case bug with error recovery
#   rn-bridge: this is not an npm package, it's just a nodejs-mobile shortcut
#   bl: we didn't use it, and bl@0.8.x has security vulnerabilities
#   bufferutil: because we want nodejs-mobile to load its native bindings
#   supports-color: optional dependency within package `debug`
#   utf-8-validate: because we want nodejs-mobile to load its native bindings

# Babel filters
# --filter=@babel/core \
# --filter=@babel/code-frame \
# --filter=@babel/generator \
# --filter=@babel/helper-function-name \
# --filter=@babel/helper-split-export-declaration \
# --filter=@babel/helpers \
# --filter=@babel/highlight \
# --filter=@babel/parser \
# --filter=@babel/plugin-proposal-async-generator-functions \
# --filter=@babel/plugin-proposal-object-rest-spread \
# --filter=@babel/plugin-syntax-typescript \
# --filter=@babel/plugin-transform-parameters \
# --filter=@babel/plugin-transform-spread \
# --filter=@babel/template \
# --filter=@babel/traverse \
# --filter=@babel/types \
# --filter=babel-plugin-syntax-object-rest-spread \
# --filter=babel-plugin-transform-es2015-spread \
# --filter=convert-source-map \
# --filter=debug \
# --filter=esutils \
# --filter=gensync \
# --filter=globals \
# --filter=jsesc \
# --filter=json5 \
# --filter=lodash \
# --filter=minimist \
# --filter=ms \
# --filter=path-parse \
# --filter=resolve \
# --filter=safe-buffer \
# --filter=semver \
# --filter=source-map \
# --filter=to-fast-properties \
# --filter=supports-color \
# Regenerator filters
# --filter=regenerator-runtime \

# Only difference with bundle-noderify-android.sh is it filters utp-native instead of replacing it

$(npm bin)/noderify \
  --ignoreMissing \
  --replace.bindings=bindings-noderify-nodejs-mobile \
  --replace.leveldown=leveldown-nodejs-mobile \
  --replace.sodium-native=sodium-native-nodejs-mobile \
  --replace.node-extend=xtend \
  --filter=rn-bridge \
  --filter=bl \
  --filter=bufferutil \
  --filter=utf-8-validate \
  --filter=utp-native \
  --filter=bip39/src/wordlists/chinese_simplified.json \
  --filter=bip39/src/wordlists/chinese_traditional.json \
  --filter=bip39/src/wordlists/french.json \
  --filter=bip39/src/wordlists/italian.json \
  --filter=bip39/src/wordlists/japanese.json \
  --filter=bip39/src/wordlists/korean.json \
  --filter=bip39/src/wordlists/spanish.json \
  index.js > _index.js;
rm index.js; mv _index.js index.js;

rm -rf lib;
rm -rf documents_modules;

cd ../..;
