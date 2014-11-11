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
            webq.getUserProfile().then(function(data){
                store.setUserId(data.emails[0].value);
                store.setUserProfile(data);
                $state.go('tab.dash');
                
            })
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

})

.controller('NotificationsCtrl', function($scope, Friends) {
    $scope.friends = Friends.all();
})

.controller('NotificationDetailCtrl', function($scope, $stateParams, Friends) {
    $scope.friend = Friends.get($stateParams.friendId);
})

.controller('ProfileCtrl', function($scope, $log, store) {
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

    var profile = store.getUserProfile()._json;
    // TODO resolve the default avatar
    $scope.avatarUrl = profile.pictureUrl || 'http://musa-hw-cafe.qiniudn.com/avatar/local-mobay-demo@qq.com-1414464704244.png';
    $log.debug(">> get user profile " + JSON.stringify(profile));
    // append edu
    if (profile.educations._total > 0) {
      $scope.school = profile.educations.values[0].schoolName;
    }

    // append company
    if (profile.positions._total > 0) {
      $scope.company = profile.positions.values[0].company.name;
    }

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

.controller('TermsCtrl', function ($scope, $log, webq, cfg) {
    webq.getUserServiceAgreements().then(function(data){
        $scope.terms = data;
    })
});