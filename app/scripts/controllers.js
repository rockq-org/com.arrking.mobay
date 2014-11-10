'use strict';
/*
 * Licensed Materials - Property of Hai Liang Wang
 * All Rights Reserved.
 */
angular.module('mobay.controllers', [])

.controller('LoginCtrl', function($scope, $state, $http, $log, store, cfg, webq) {
    // check out the sid value and decide which page should be
    // navigator.splashscreen.hide();
  //   try{
        // $state.go('tab.dash');
  //    var sid = store.getUserSID();
  //   }catch(e){
  //    $log.error(e);
  //   }
    // Form data for the login modal
    $scope.loginData = {};
    $scope.doLogin = function(){
        webq.loginLocalPassport($scope.loginData.username,
            $scope.loginData.password).then(function(token){
            store.setAccessToken(token);
            $state.go('tab.dash');
        }, function(err){
            // TODO show an error message
            /*
             * Possible Cause for login error 
             * (1) wrong username and password
             * (2) no network
             */
            $log.error(err);
            $scope.loginData = {};
        });
    };
})

.controller('DashCtrl', function($scope, $state, $log, webq) {
    webq.getUserProfile().then(function(profile){
        $log.debug(profile);
    }, function(err){
        // maybe token is revoked or has no network
        // TODO add a utility for get network status
        if(true){
            // has no network
        }else{
            // token is revoked, force the user login again
            $state.go('login.form');
        }
        $log.error(err);
    });
})

.controller('NotificationsCtrl', function($scope, Friends) {
    $scope.friends = Friends.all();
})

.controller('NotificationDetailCtrl', function($scope, $stateParams, Friends) {
    $scope.friend = Friends.get($stateParams.friendId);
})

.controller('ProfileCtrl', function($scope) {
    $scope.labels = [
        {
            name: '学校'
        },
        {
            name: '公司'
        },
        {
            name: '兴趣'
        }
    ];
    $scope.school = '中国科学院大学';
    $scope.save = function (){
        $scope.school = '12345';
        location.href='#/tab/profile';
    };
})

.controller('PeopleCtrl', function ($scope) {
    $scope.people = [
        {
            name: '路人甲'
        },
        {
            name: '路人乙'
        },
        {
            name: '路人丙'
        }
    ];
})

.controller('SettingsCtrl', function ($rootScope, $state, $scope, $log, $http, cfg, webq) {
    $scope.title = 'moBay';
    $scope.appVersion = cfg.version;

    function mailUnAvailable(){
        $scope.title = '邮件服务不可用';
        setTimeout(function(){
            $scope.title = 'moBay';
            // https://docs.angularjs.org/api/ng/type/$rootScope.Scope
            $rootScope.$digest();
        }, 2000)
    }

    $scope.logout = function(){
        webq.logout();
        $state.go('login.form');
    }

    $scope.openFeedbackMailTemplate = function(){
        if(window.cordova && window.cordova.plugins.email){
            cordova.plugins.email.isAvailable(function(isAvailable) {
                // alert('Service is not available') unless isAvailable;
                if (isAvailable) {
                    // get appVersion
                    cordova.plugins.email.open({
                        to: ['mobay@arrking.com'], // email addresses for TO field
                        //bcc: [],
                        //cc:  [],
                        // attachments: Array, // file paths or base64 data streams
                        subject: '[moBay用户反馈] 版本 v{0}'.f(cfg.version||''), // subject of the email
                        body: '你好，moBay 团队 <br/>', // email body (for HTML, set isHtml to true)
                        isHtml: true, // indicats if the body is HTML or plain text
                    }, function() {
                        $log.debug('email view dismissed');
                    });
                } else {
                    mailUnAvailable();
                }
            });
        }else{
            mailUnAvailable();
            $log.debug('no mail plugins')
        }
    }
})

.controller('TermsCtrl', function ($scope, $log, $http, cfg) {
    $http({
        method: 'GET',
        url: 'http://' + cfg.host + '/public/md/user-service-agreements.md'
    }).success(function(data, status, headers, config) {
        $log.debug(data);
        try{
            var converter = new Showdown.converter();
            var html = converter.makeHtml(data);
            $scope.terms = html;
        }catch(e){
            $log.error(e);
        }
    }).error(function(data, status){
        $log.error('Can not get /public/md/user-service-agreements.md from server.');
        $log.debug(data);
    });
});