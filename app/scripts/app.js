"use strict";

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'mobay.services' is found in services.js
// 'mobay.controllers' is found in controllers.js
angular.module('mobay', ['ionic', 'mobay.controllers', 'mobay.services', 'config'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $sceDelegateProvider) {

  // http://stackoverflow.com/questions/12111936/angularjs-performs-an-options-http-request-for-a-cross-origin-resource
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'http://*.mybluemix.net/**'
  ]);

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  // doc : https://github.com/angular-ui/ui-router/wiki
  $stateProvider

    // abstract is used for nested states 
    // https://github.com/angular-ui/ui-router/wiki/Nested-States-%26-Nested-Views
    .state('login', {
        url: '/login',
        abstract: true,
        templateUrl: 'templates/login.html'
    })

    .state('login.form', {
        url: '/form',
        views:{
            'login-form':{
                templateUrl : 'templates/login-form.html',
                controller: 'LoginCtrl'
            }
        }
    })

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('tab.dash', {
      url: '/dash',
      views: {
        'tab-dash': {
          templateUrl: 'templates/tab-dash.html',
          controller: 'DashCtrl'
        }
      }
    })

    .state('tab.notifications', {
      url: '/notifications',
      views: {
        'tab-notifications': {
          templateUrl: 'templates/tab-notifications.html',
          controller: 'NotificationsCtrl'
        }
      }
    })

    .state('tab.notification-detail', {
      url: '/notification/:friendId',
      views: {
        'tab-notifications': {
          templateUrl: 'templates/notification-detail.html',
          controller: 'NotificationDetailCtrl'
        }
      }
    })

    .state('tab.profile', {
      url: '/profile',
      views: {
        'tab-profile': {
          templateUrl: 'templates/tab-profile.html',
          controller: 'ProfileCtrl'
        }
      }
    })  

    .state('tab.settings', {
      url: '/settings',
      views: {
        'tab-settings': {
          templateUrl: 'templates/tab-settings.html',
          controller: 'SettingsCtrl'
        }
      }
    });    

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login/form');

});
