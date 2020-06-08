// Sandstorm - Personal Cloud Sandbox
// Copyright (c) 2014 Sandstorm Development Group, Inc. and contributors
// All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Accounts } from "meteor/accounts-base";
import { Router } from "meteor/iron:router";
import { recoverPersonalSignature } from "eth-sig-util"


Meteor.loginWithWeb3 = function (options, callback) {
  // support a callback without options
  if (!callback && typeof options === "function") {
    callback = options;
    options = null;
  }

  if (Meteor.isServer) { return callback(new Error('loginWithWeb3 called on server?')) }

  if (!ethereum) {
    return cb(new Error('could not find injected web3 api'))
  }

  ethereum.send({ id: 1, "method": "eth_requestAccounts", params: [] }, (err, res) => {
    if (err) return callback(err)
    const { result: [address] } = res
    // need to do an actual MITM-resistant authentication, but mostly a wallet-side issue
    const challenge = Math.random().toString().slice(2)
    const message = `Authenticate with this sandstorm.io instance: ${challenge}`
    ethereum.send({ id: 2, "method": "personal_sign", params: [message, address] }, (err, res) => {
      if (err) return callback(err)
      const { result: msgSignatureHex } = res
      const msgHex = '0x' + Buffer.from(message, 'utf8').toString('hex')
      try {
        const recoveredAddress = recoverPersonalSignature({
          data: msgHex,
          sig: msgSignatureHex,
        })
        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
          throw new Error('Signature did not match!')
        }
      } catch (err) {
        return callback(err)
      }
      // ok everything checks out, send it to the server
      Accounts.callLoginMethod({
        methodName: "createWeb3Account",
        methodArguments: [address, msgHex, msgSignatureHex],
        userCallback: callback,
      });
    })
  })

};