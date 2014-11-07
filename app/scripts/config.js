"use strict";

 angular.module("config", [])

.constant("cfg", {
  "host": "mobay.mybluemix.net",
  "ssehost": "mobaysse.mybluemix.net",
  "linkedinOauth": "/mobile/auth/linkedin",
  "pushAppId": "cd16f387-608a-47fa-839e-1d0fd9a859d9",
  "pushAppRoute": "mobay.mybluemix.net",
  "pushAppSecret": "0870db1e3946355b335a042c2976679770772299",
  "console": "DEBUG",
  "weinreDebug": "false",
  "weinreServer": "http://192.168.9.232:9088/target/target-script-min.js#musa"
})

;