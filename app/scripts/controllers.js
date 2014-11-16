'use strict';
/*
 * Licensed Materials - Property of Hai Liang Wang
 * All Rights Reserved.
 */
angular.module('mobay.controllers', [])

.controller('LoginCtrl', function($scope, $state, $http, $log,
    $ionicLoading, store, cfg, webq, mbaas) {
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
                    // start mbaas service, register device
                    if(!mbaas.isRunning()){
                        mbaas.start(data.emails[0].value);
                    }
                    // save map meta data
                    webq.getMapdata().then(function(data){
                        store.setMaps(data);
                    });
                    $state.go('tab.dash');
                });
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
                    $log.error(err);
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

.controller('DashCtrl', function($scope, $ionicPopup, $ionicLoading,
    $state, $log, store, $q, webq, las, gps) {
    $scope.$root.tabsHidden = '';
    $scope.incoming = function(){
        $ionicLoading.show({
            template: 'not done yet ...',
            duration: 1000
        });
    };

    $scope.scanQRCode = function(){
        gps.getCurrentPosition().then(function(pos){
            // resolve -> in premise
            // reject -> not in premise or can not get maps data
            return gps.isPointInsideCircle('HelloWorldCafe', pos.coords);
        }, function(err){
            // can not get current pos
            $ionicLoading.show({
                template: '无法获得当前位置信息',
                duration: 1000
            });
        }).then(function(){
            var defer = $q.defer();
            cordova.plugins.barcodeScanner.scan(function(result) {
                if(result && result.text && (!result.cancelled)){
                    var code = result.text;
                    try{
                        var data = JSON.parse(code);
                        if (data.lng && data.lat) {
                            defer.resolve(data);
                        }else{
                            defer.reject({
                                rc:1,
                                msg: '二维码不符合“移动港湾二维码”规范.'
                            });
                        }
                    }catch(e){
                        // data is not JSON String
                        defer.reject({
                            rc:1,
                            msg: '二维码不符合“移动港湾二维码”规范.'
                        });
                    }
                }else{
                    // Wrong QR Code Image
                    // no further information provided to the user.
                    defer.reject({
                        rc: 3,
                        msg: 'wrong data'
                    });
                }
            }, function(err){
                // Camera does not get any data
                $log.error(err);
                defer.reject({
                    rc:2,
                    msg:err
                });
            });
            return defer.promise;

        }, function(err){
            switch(err.rc){
                case 1:
                    $ionicLoading.show({
                        template: err.msg,
                        duration: 1000
                    });
                    break;
                case 2:
                    $log.error(err);
                    break;
                case 3:
                    $ionicLoading.show({
                        template: err.msg,
                        duration: 1000
                    });
                    break;
                default:
                    $log.error('UNKNOW ERROR.');
                    break;
            }
        }).then(function(qr){
            $scope.data = {status: '', duration: 30 };
            // upload postition and status data
            var myStatusPopup = $ionicPopup.show({
                template: '<input id="myStatusInput" placeholder="TA什么也没说." type="text" ng-model="data.status">' +
                    '持续时间: <br/>' +
                    '<div class="range range-positive">' +
                        '<i class="icon ion-ios7-timer-outline"></i>' +
                        '<input type="range" name="status" ng-model="data.duration" min="15" max="100" value="30">' +
                        '{{data.duration}} 分钟' +
                    '</div>',
                title: '分享我的状态',
                scope: $scope,
                buttons: [
                    { text: '取消' },
                    {
                        text: '<b>确定</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            return {
                                status: $scope.data.status,
                                duration: $scope.data.duration
                            };
                        }
                    }
                ]
            });
            myStatusPopup.then(function(res) {
                // res == $scope.data.status
                if(res){
                    webq.uploadRTLSData({
                        mapId: 'HelloWorldCafe',
                        lat: qr.lat,
                        lng: qr.lng,
                        status: res.status || 'TA什么也没说.',
                        duration: res.duration * 60000,
                        timestamp: new Date()
                    });
                }
            });
        }, function(err){
            $log.debug(err);
            if(typeof err === 'object' && err.rc){
                switch(err.rc){
                    case 1:
                        $ionicLoading.show({
                            template: err.msg,
                            duration: 1000
                        });
                        break;
                    case 2:
                        $log.error(err);
                        break;
                    default:
                        $log.error(err);
                        break;
                }
            }
        });
    };

    $scope.openMapView = function(){
    };

    $scope.openPeopleView = function(){

    };
})

.controller('MapCtrl', function($scope, $log, las){
    $scope.$root.tabsHidden = 'hide-tabs';
    $scope.$on('$viewContentLoaded', function(event){
        las.start('las-map');
    });
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

.controller('NotificationsCtrl', function($scope, store) {
    $scope.$root.tabsHidden = '';
    $scope.getDateString = function(dateString) {
        var date = dateString ? new Date(dateString) : new Date();
        var yyyy = date.getFullYear();
        var mm = date.getMonth() + 1; //January is 0!
        var dd = date.getDate();
        var hh = date.getHours();
        var min = date.getMinutes();
        var sec = date.getSeconds();

        if (mm < 10) {
            mm = '0' + mm;
        }
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (hh < 10) {
            hh = '0' + hh;
        }
        if (min < 10) {
            min = '0' + min;
        }
        if (sec < 10) {
            sec = '0' + sec;
        }
        return '{0}/{1}/{2} {3}:{4}'.f(yyyy, mm, dd, hh, min);
    };
    $scope.notifications = store.getNotifications();
    $scope.notificationKeys = _.keys($scope.notifications).sort().reverse();
})

.controller('NotificationDetailCtrl', function($scope, $stateParams, $log, webq) {
    $scope.$root.tabsHidden = 'hide-tabs';
    // $log.debug('>> open message id ' + $stateParams.msgId);
    $scope.title = $stateParams.title;
    webq.getNotificationDetail($stateParams.msgId).success(function(data){
        try{
            var converter = new Showdown.converter();
            $scope.content = converter.makeHtml(data.post.body);
        }catch(e){
            $scope.content = '无法取得通知内容';
            $log.error(e);
        }
    }).error(function(err){
        $scope.content = '无法取得通知内容';
        $log.error(err);
    });
})

.controller('ProfileCtrl', function($scope, $log, store) {
    $scope.$root.tabsHidden = '';
    // show tabs
    var profile = store.getUserProfile();
    // TODO resolve the default avatar
    $scope.avatarUrl = profile._json.pictureUrl || 'http://musa-hw-cafe.qiniudn.com/avatar/local-mobay-demo@qq.com-1414464704244.png';
    $log.debug('>> get user profile ' + JSON.stringify(profile));
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

    if (profile._json.interests){
        $scope.interests = profile._json.interests;
    }
    $scope.save = function (){
        $scope.school = '12345';
        location.href='#/tab/profile';
    };

    // take photo as avatar
    $scope.updateAvatar = function(){
    };
})

.controller('ProfileEditorCtrl', function($state, $scope, $log, $stateParams, store, webq){
    $scope.$root.tabsHidden = 'hide-tabs';
    // hide tabs
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
    }
    $scope.data.value = $stateParams.value;

    $scope.save = function(){
        $log.debug('>> {0} : {1}'.f($scope.data.title, $scope.data.value));
        if($scope.data.value !== $stateParams.value){
            // TODO save that value from webq
            var profile = store.getUserProfile();
            switch($stateParams.key){
                case 'company':
                    if ($scope.data.value) {
                        profile._json.positions._total = 1;
                        profile._json.positions.values[0] = {
                            isCurrent: true,
                            company: {
                                name: $scope.data.value
                            }
                        };
                    } else {
                        profile._json.positions._total = 0;
                        profile._json.positions.values = {};
                    }
                    break;
                case 'interests':
                    if ($scope.data.value) {
                        profile._json.interests = $scope.data.value;
                    }
                    break;
                case 'school':
                    if ($scope.data.value) {
                        profile._json.educations._total = 1;
                        profile._json.educations.values[0] = {
                            schoolName: $scope.data.value
                        };
                    } else {
                        profile._json.educations._total = 0;
                        profile._json.educations.values = [];
                    }
                    break;
                default:
                    break;
            }
            webq.saveUserProfile(profile).then(function(data){
                $log.debug(data);
                store.setUserProfile(profile);
                $state.go('tab.profile');
            }, function(err){
                $log.error(err);
            });
        }
    };
})

.controller('SettingsCtrl', function ($rootScope, $state, $scope, $log, $http, cfg, store, webq, mbaas) {
    $scope.$root.tabsHidden = '';
    $scope.title = '移动港湾';
    $scope.appVersion = cfg.version;
    function mailUnAvailable(){
        $scope.title = '邮件服务不可用';
        setTimeout(function(){
            $scope.title = '移动港湾';
            // https://docs.angularjs.org/api/ng/type/$rootScope.Scope
            $rootScope.$digest();
        }, 2000);
    }
    var preSubscriptions = store.getSubTags();
    $scope.subscriptions = {
        promotion: {
            checked: _.indexOf(preSubscriptions, 'promotion') !== -1,
            text: '优惠'
        },
        itnews: {
            text: '资讯',
            checked: _.indexOf(preSubscriptions, 'itnews') !== -1,
        },
        activity: {
            text: '活动',
            checked: _.indexOf(preSubscriptions, 'activity') !== -1
        }
    };

    $scope.changeSubscriptions = function(key, value){
        $log.debug('subscribe: ', key, ', boolean ',value);
        if(value){
            mbaas.subTag(key).then(function(response){
                $log.debug(response);
                // save to localStorage by store
                preSubscriptions.push(key);
                store.setSubTags(preSubscriptions);
            }, function(err){
                $log.debug(err);
                $scope.subscriptions[key].checked = false;
            });
        }else{
            mbaas.unSubTag(key).then(function(response){
                $log.debug(response);
                preSubscriptions = store.removeSubTag(key);
            }, function(err){
                $log.debug(err);
                $scope.subscriptions[key].checked = true;
            });
        }
    };

    $scope.logout = function(){
        webq.logout();
        $state.go('login.form');
    };

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
            $log.debug('no mail plugins');
        }
    };
})

.controller('TermsCtrl', function ($scope, $log, webq, cfg) {
    $scope.$root.tabsHidden = 'hide-tabs';
    webq.getUserServiceAgreements().then(function(data){
        $scope.terms = data;
    });
});