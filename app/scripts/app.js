'use strict';
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'mobay.services' is found in services.js
// 'mobay.controllers' is found in controllers.js
angular.module('mobay', ['ionic', 'mobay.controllers', 'mobay.services', 'config'])
.run(function($ionicPlatform, $log, $state, cfg, store, webq, mbaas, sse, ntm) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.overlaysWebView(true);
            StatusBar.styleLightContent();
            StatusBar.backgroundColorByName('white');
            // StatusBar.hide();
        }

        // start network manager service
        if(window.navigator.connection){
            ntm.start();
        }

        if(window.navigator.splashscreen){
            if (store.getAccessToken().access_token) {
                webq.getUserProfile().then(function(data){
                    // save data into localStorage
                    store.setUserId(data.emails[0].value);
                    store.setUserProfile(data);
                    // start mbaas service
                    if(window.IBMBluemix.hybrid){
                        mbaas.start(store.getUserId());
                    }

                    // save map meta data
                    webq.getMapdata().then(function(data){
                        store.setMaps(data);
                        sse.start();
                    }, function(err){
                        alert(err);
                    });

                    navigator.splashscreen.hide();
                }, function(err){
                    // TODO 
                    // {1} no network, stays in dash
                    // {2} access token is expired, go to login 
                    $state.go('login-form');
                    navigator.splashscreen.hide();
                });
            } else {
                $state.go('login-form');
                navigator.splashscreen.hide();
            }
        }
    });
})

.config(function($stateProvider, $urlRouterProvider, $logProvider, $httpProvider, $sceDelegateProvider, cfg) {

    // $httpProvider.defaults.withCredentials = true;
    $httpProvider.interceptors.push('accessTokenHttpInterceptor');
    $logProvider.debugEnabled(cfg.debug);

    // set log level - debug|production

    // http://stackoverflow.com/questions/12111936/angularjs-performs-an-options-http-request-for-a-cross-origin-resource
    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain.  Notice the difference between * and **.
        'http://*.mybluemix.net/**',
        'http://*.arrking.com'
    ]);

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    // doc : https://github.com/angular-ui/ui-router/wiki
    $stateProvider

    // abstract is used for nested states 
    // https://github.com/angular-ui/ui-router/wiki/Nested-States-%26-Nested-Views
    .state('login-form', {
        url: '/login-form/:msg/:email',
        templateUrl: 'templates/login-form.html',
        controller: 'LoginCtrl',
        resolve: {
            cordova: function($q) {
                var deferred = $q.defer();
                ionic.Platform.ready(function() {
                    deferred.resolve();
                });
                return deferred.promise;
            },
            activeSlideIndex: function(store){
                return store.getUserId()? 2 : 0;
            }
        }
    })

    .state('login-signup', {
        url: '/login-signup',
        templateUrl: 'templates/login-signup.html',
        controller: 'SignupCtrl',
        resolve: {
            cordova: function($q) {
                var deferred = $q.defer();
                ionic.Platform.ready(function() {
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    })

    .state('login-forget-pwd', {
        'url': '/login-forget-pwd',
        'templateUrl': 'templates/login-forget-pwd.html',
        controller: 'ForgetPwdCtrl',
        resolve: {
            cordova: function($q) {
                var deferred = $q.defer();
                ionic.Platform.ready(function() {
                    deferred.resolve();
                });
                return deferred.promise;
            }            
        }
    })

    // setup an abstract state for the tabs directive
    .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html',
        //  https://github.com/driftyco/ng-cordova/issues/8
        //  use the resolve feature of the UI router to wait 
        //  for ionic.Platform.ready signal before each state 
        //  that might need a plugin
        resolve: {
            cordova: function($q, $log) {
                var deferred = $q.defer();
                ionic.Platform.ready(function() {
                    $log.debug('ionic.Platform.ready');
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
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

    .state('tab.dash-map', {
        url: '/dash/map',
        views: {
            'tab-dash': {
                templateUrl: 'templates/dash-map.html',
                controller: 'MapCtrl'
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
        url: '/notification/:msgId/:title',
        views:
        {
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

    .state('tab.profile-editor', {
        url: '/profile/edit/{key}/{value}',
        views: {
            'tab-profile': {
                templateUrl: 'templates/profile-editor.html',
                controller: 'ProfileEditorCtrl'
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
    })

    .state('tab.settings-reset-pwd', {
        url: '/settings/reset-pwd',
        views: {
            'tab-settings': {
                templateUrl: 'templates/settings-reset-pwd.html',
                controller: 'ResetPwdCtrl'
            }
        }
    })

    ;

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');

});