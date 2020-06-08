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

import { globalDb } from "/imports/db-deprecated.js";


Accounts.loginServices.web3 = {
  isEnabled: function () {
    // return serviceEnabled("web3");
    // return globalDb.getSettingWithFallback("web3", false);
    return true;
  },

  getLoginId: function (identity) {
    return identity.services.web3.address;
  },

  initiateLogin: function (loginId) {
    loginWeb3Account({ loginHint: loginId });
    return { oneClick: true };
  },

  loginTemplate: {
    name: "oauthLoginButton",
    priority: 0,
    data: {
      method: "loginWithWeb3",
      name: "web3",
      displayName: "Web3",
      linkingNewCredential: false,
    },
  }
};