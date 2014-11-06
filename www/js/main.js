requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'js/lib',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        app: '../app',
        underscore: 'underscore-min',
        geolib: 'geolib.min',
        q: 'q.min',
        console: 'console.min',
        showdown: 'showdown',
        i18next: 'i18next.amd.min',
        ionic: 'ionic/js/ionic.bundle'
    },
    shim: {
        'underscore': {
            exports: '_'
        },
        'q': {
            exports: 'Q'
        },
        'console': {},
        'showdown': {}
    }
});

/**
 * this code is ugly, but still not found better ways to make handleBlueMixNotification globally.
 * because it has to be global to support callback from IBMPush iOS Native Code.
 * use a timeout function can make backgroud-foreground works.
 * but close-foreground still does not work.
 * the message arrives, but when the app wake up, the cordova method does not called.
 */
function handleApplePushNotificationArrival(msg) {
}

requirejs([ 'cordova.js', 'ionic', 'app/controllers', 
    'app/services', 'underscore', 'showdown', 'q'
    ],
    function() {
// start of require

// cordova is now available globally
// var config = require('app/config');
// var util = require('app/util');

// DEBUG = config.console;
// alert(config.console)


// moBay App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'mobay.services' is found in services.js
// 'mobay.controllers' is found in controllers.js
angular.module('mobay', ['ionic', 'mobay.controllers', 'mobay.services'])

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

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

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
  $urlRouterProvider.otherwise('/tab/dash');

});

// end of require
}
);