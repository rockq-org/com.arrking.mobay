'use strict';
/*
 * Licensed Materials - Property of Hai Liang Wang
 * All Rights Reserved.
 */
angular.module('mobay.controllers', [])

.controller('LoginCtrl', function($scope, $state, $http, $log, $ionicLoading, store, cfg, webq) {
    $scope.errMessage = false;
    $scope.loginData = {};

    $scope.doLogin = function(){
        if($scope.loginData.username &&
            $scope.loginData.password){
            $ionicLoading.show({template: '登录中 ...'});
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
                if(err.rc){
                    switch(err.rc){
                        case 2:
                            $scope.errMessage = '不存在该用户';
                            $scope.loginData = {};
                            break;
                        case 3:
                            $scope.errMessage = '密码错误';
                            $scope.loginData.password = '';
                            break;
                        default:
                            $log.error(err);
                    }
                }else{
                    $log.error('>> can not understand :');
                    $log.error(err)
                    $scope.loginData = {};
                }
            }).finally(function(){
                $ionicLoading.hide();
            });
        }else{
            $scope.errMessage = '用户名或密码不能为空';
        }
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

    var profile = store.getUserProfile();
    // TODO resolve the default avatar
    $scope.avatarUrl = profile._json.pictureUrl || 'http://musa-hw-cafe.qiniudn.com/avatar/local-mobay-demo@qq.com-1414464704244.png';
    $log.debug(">> get user profile " + JSON.stringify(profile));
    $scope.name = profile.displayName;
    $scope.email = profile.emails[0].value;
    // append edu
    if (profile._json.educations._total > 0) {
      $scope.school = profile._json.educations.values[0].schoolName;
    }

    // append company
    if (profile._json.positions._total > 0) {
      $scope.company = profile._json.positions.values[0].company.name;
    }
    $scope.save = function (){
        $scope.school = '12345';
        location.href='#/tab/profile';
    };

    // take photo as avatar
    $scope.updateAvatar = function(){
    }
})

.controller('ProfileEditorCtrl', function($state, $scope, $log, $stateParams){
    $log.debug($stateParams);
    $scope.data = {};
    switch($stateParams.key){
        case 'company':
            $scope.data.title = '公司';
            $scope.data.placeholder = '请输入公司/单位';
            break;
        case 'interests':
            $scope.data.title = '兴趣';
            $scope.data.placeholder = '请输入兴趣爱好';
            break;
        case 'school':
            $scope.data.title = '学校';
            $scope.data.placeholder = '请输入(曾经)就读学校';
            break;
        default:
            break;
    };
    $scope.data.value = $stateParams.value;

    $scope.save = function(){
        $log.debug('>> {0} : {1}'.f($scope.data.title, $scope.data.value));
        // TODO save that value from webq

        $state.go('tab.profile');
    }
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