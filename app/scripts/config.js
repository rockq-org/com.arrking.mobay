"use strict";

 angular.module("config", [])

.constant("cfg", {
  "version": "0.0.2",
  "host": "mobay.mybluemix.net",
  "debug": true,
  "ssehost": "mobaysse.mybluemix.net",
  "linkedinOauth": "/mobile/auth/linkedin",
  "pushAppId": "ce4f3de5-e09c-4fc1-9c76-b70ff66cbcac",
  "pushAppRoute": "mobay.mybluemix.net",
  "pushAppSecret": "32ee827761803e99e0164d30560aa0a6603bafcb"
})

;