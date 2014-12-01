'use strict';
/*
 * Licensed Materials - Property of Hai Liang Wang
 * All Rights Reserved.
 */
angular.module('mobay.controllers', [])

.controller('LoginCtrl', function($scope, $state,  $stateParams, $http, $log,
    $ionicLoading, store, cfg, webq, mbaas, sse, activeSlideIndex) {
    var emailRegex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
        passwordRegex = /\S{6,20}/;
    // msg and email can be passed after register account successfully
    $scope.errMessage = $stateParams.msg;
    $scope.activeSlideIndex = activeSlideIndex;
    $scope.enableLoginBtn = false;

    if($stateParams.activeSlideIndex){
        $scope.activeSlideIndex = $stateParams.activeSlideIndex;
    }

    $scope.loginData = {
        email: $stateParams.email||''
    };
    
    if (window.StatusBar) {
        StatusBar.hide();
    }

    $scope.validateLoginData = function () {
        var email = $scope.loginData.email || '',
            password = $scope.loginData.password || '';

        if(!emailRegex.test(email)) {
            $scope.enableLoginBtn = false;
            return false;
        }

        if(!passwordRegex.test(password)) {
            $scope.enableLoginBtn = false;
            return false;
        }

        $scope.enableLoginBtn = true;
    };

    $scope.doLogin = function(){
        // empty te errMessage
        $scope.errMessage = '';
        if($scope.loginData.email &&
            $scope.loginData.password){
            $ionicLoading.show({template: '登录中 ...'});
            webq.loginLocalPassport($scope.loginData.email,
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
                        sse.start();
                    });
                    $state.go('tab.dash');
                });
            }, function(err){
                // TODO show an error message
                /*
                 * Possible Cause for login error 
                 * (1) wrong email and password
                 * (2) no network
                 */
                if(err.rc){
                    switch(err.rc){
                    case 2:
                        $scope.errMessage = '不存在该用户';
                        break;
                    case 3:
                        $scope.errMessage = '密码错误';
                        $scope.loginData.password = '';
                        $scope.enableLoginBtn = false;
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

.controller('SignupCtrl', function($state, $scope, $log, $ionicModal, $ionicPopup, $timeout, webq){
    var emailRegex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
        usernameRegex = /\w{6,20}/,
        passwordRegex = /\S{6,20}/;

    $scope.enableSignupBtn = false;

    $scope.data = {
        username: '',
        password: '',
        email: '',
        verifyCode: ''
    };

    $scope.validateSignupData = function () {
        var email = $scope.data.email || '',
            username = $scope.data.username || '',
            password = $scope.data.password || '';

        if(!emailRegex.test(email)) {
            $scope.enableSignupBtn = false;
            return false;
        }

        if(!usernameRegex.test(username)) {
            $scope.enableSignupBtn = false;
            return false;
        }

        if(!passwordRegex.test(password)) {
            $scope.enableSignupBtn = false;
            return false;
        }

        $scope.enableSignupBtn = true;
    };

    // post request for creating accout
    $scope.doReg = function(){
        $scope.errMessage = '';
        // TODO validate properties
        if($scope.data.username && $scope.data.password && $scope.data.email){
            webq.signup($scope.data).then(function(res){
                _verify();
            }, function(err){
                if(err && err.rc){
                    switch(err.rc){
                    case 3:
                        $scope.data.email = '';
                        $scope.enableSignupBtn = false;
                        $scope.errMessage = '该邮箱已经被注册。';
                        break;
                    default:
                        $scope.errMessage = '请求错误, 请稍候再试。';
                        break;
                    }
                }else{
                    // unknown error
                    $log.error(err);
                    $scope.data = {};
                    $scope.errMessage = '网络错误, 请稍候再试。';
                }
            });
        } else {
            $scope.errMessage = '用户名/密码/邮箱 不能为空';
        }
    };

    // verify code for signup request
    function _verify(){
        // popup a dialog for input verify code
        var verifyCodeDialog = $ionicPopup.show({
            template: '<input type="text" ng-model="data.verifyCode" placeholder="{{data.verifyCodePlsHolder}}" autocapitalize="off" maxlength="4" autocorrect="off" autocomplete="off">',
            title: '验证码',
            subTitle: '验证码已经发送到您的邮箱({0})，请注意查收。'.f($scope.data.email),
            scope: $scope,
            buttons: [
                { text: '取消' },
                {
                    text: '<b>确定</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        //don't allow the user to close unless he enters wifi password
                        if ($scope.data.verifyCode) {
                            webq.localPassportVerify($scope.data.verifyCode, $scope.data.email).then(function(data){
                                // reset password successfully
                                // go to login page
                                verifyCodeDialog.close();
                                $state.go('login-form', {
                                    msg: '账号注册成功',
                                    email: $scope.data.email,
                                    activeSlideIndex: 2
                                });
                            }, function(err){
                                // rc = 2 wrong code
                                // rc = 3 too many attempt
                                switch(err.rc){
                                case 2:
                                    $scope.data.verifyCode = '';
                                    $scope.data.verifyCodePlsHolder = '验证码错误 请重新输入';
                                    break;
                                case 3:
                                    $scope.data.verifyCode = '';
                                    $scope.data.verifyCodePlsHolder = '验证次数超过限制';
                                    $timeout(function(){
                                        try{
                                            verifyCodeDialog.close();
                                            $scope.data = {};
                                        }catch(error){
                                            alert(error);
                                        }
                                    }, 3000);
                                    // close this dialog
                                    break;
                                default:
                                    break;
                                }
                            });
                        }
                        e.preventDefault();
                    }
                }
            ]
        });
    }

    $ionicModal.fromTemplateUrl('templates/login-terms.html', {
        scope: $scope,
        animation: 'fade-in'
    }).then(function(modal) {
        $scope.userTermsModal = modal;
    });

    // show a modal for user service level agreements
    $scope.showUserTermsModal = function(){
        $scope.userTermsModal.show();
        webq.getUserServiceAgreements().then(function(data){
            $scope.terms = data;
        }, function(err){
            $scope.terms = '<div class="item text-center" style="border: 0;">{0}</div>'.f('网络错误，请稍后重试。');
        });
    };

    $scope.hideUserTermsModal = function(){
        $scope.userTermsModal.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        try{
            $scope.userTermsModal.remove();
        }catch(e){
            $log.error(e);
        }
    });

})

.controller('ForgetPwdCtrl', function($scope, $state, $ionicPopup, webq, store){
    $scope.data = {
        email: store.getUserId()||''
    };

    // check the new password
    $scope.enableSubmitBtn = false;
    var emailRegex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    var passwordRegex = /\S{6,20}/;
    $scope.validate = function(){

        if(!emailRegex.test($scope.data.email)) {
            $scope.enableSignupBtn = false;
            return false;
        }

        if(!passwordRegex.test($scope.data.password)) {
            $scope.enableSubmitBtn = false;
            return false;
        }

        $scope.enableSubmitBtn = true;
    }

    // forget password
    $scope.doResetPwd = function(){
        if($scope.data.email && $scope.data.password){
            webq.forgetPwd($scope.data.email, $scope.data.password)
            .then(function(){
                // verify code dialog
                _verify();
            }, function(err){
                $scope.data = {};
                if(typeof err == 'object' && err.rc){
                    switch(err.rc){
                    case 3:
                        $scope.errMessage= '不存在该用户。';
                        break;
                    default:
                        $scope.errMessage= '服务错误，请稍后重试。';
                        break;
                    }
                } else {
                    $scope.errMessage= '网络错误，请稍后重试。';
                }
            });
        } else {
            $scope.errMessage = '邮箱/密码 不能为空';
        }
    };

    // verify code for signup request
    function _verify(){
        // popup a dialog for input verify code
        var verifyCodeDialog = $ionicPopup.show({
            template: '<input type="text" ng-model="data.verifyCode" placeholder="{{data.verifyCodePlsHolder}}" autocapitalize="off" maxlength="4" autocorrect="off" autocomplete="off">',
            title: '验证码',
            subTitle: '验证码已经发送到您的邮箱({0})，请注意查收。'.f($scope.data.email),
            scope: $scope,
            buttons: [
                { text: '取消' },
                {
                    text: '<b>确定</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        //don't allow the user to close unless he enters wifi password
                        if ($scope.data.verifyCode) {
                            webq.localPassportVerify($scope.data.verifyCode, $scope.data.email).then(function(data){
                                // reset password successfully
                                // go to login page
                                verifyCodeDialog.close();
                                $state.go('login-form', {
                                    msg: '密码更新成功',
                                    email: $scope.data.email,
                                    activeSlideIndex: 2
                                });
                            }, function(err){
                                // rc = 2 wrong code
                                // rc = 3 too many attempt
                                switch(err.rc){
                                case 2:
                                    $scope.data.verifyCode = '';
                                    $scope.data.verifyCodePlsHolder = '验证码错误 请重新输入';
                                    break;
                                case 3:
                                    $scope.data.verifyCode = '';
                                    $scope.data.verifyCodePlsHolder = '验证次数超过限制';
                                    $timeout(function(){
                                        try{
                                            verifyCodeDialog.close();
                                            $scope.data = {};
                                        }catch(error){
                                            alert(error);
                                        }
                                    }, 3000);
                                    // close this dialog
                                    break;
                                default:
                                    break;
                                }
                            });
                        }
                        e.preventDefault();
                    }
                }
            ]
        });
    }
})

.controller('DashCtrl', function($scope, $ionicPopup, $ionicLoading,
    $state, $log, store, $q, webq, gps) {

    if (window.StatusBar) {
        StatusBar.show();
    }

    $scope.$root.tabsHidden = '';
    $scope.$root.subMenuShown = false;
    $scope.dashHeaderLeftBtn = false;
    $scope.dashHeaderRightBtn = false;

    // check if user is online
    webq.checkUserOnlineByMapId('HelloWorldCafe').then(function(data){
        // user is online
        // trick point - handle sub menu
        store.setUserOnlineData(data);
        $scope.dashHeaderRightBtn = true;
        // $apply and $digest 
        // http://www.sitepoint.com/understanding-angulars-apply-digest/
        $scope.$apply();
    }, function(err){
        // user is not online or can not get data
        if(err && err.rc == 3){
            $log.debug('user is not online');
        }
    });

    $scope.stopSharingLocationDialog = function(){
        var rtlsConfirmPopup = $ionicPopup.confirm({
            title: '位置服务',
            template: '您当前分享了位置信息，停止该分享?',
            okText: '确定',
            cancelText:'取消'
        });
        rtlsConfirmPopup.then(function(res) {
            if(res) {
                // TODO post request to delete sharings
                var d = store.getUserOnlineData();
                if(d){
                    webq.stopSharingLocation('HelloWorldCafe', d.lat, d.lng, d.timestamp).then(function(data){
                        if(data && data.rc == 0){
                            $scope.dashHeaderRightBtn = false;
                        }else{
                            $log.error(data);
                        }
                    }, function(err){
                            $log.error(err);
                    });
                }else{
                    $log.error('user is not online.')
                }
            }
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
                    var d = {
                        mapId: 'HelloWorldCafe',
                        lat: qr.lat,
                        lng: qr.lng,
                        status: res.status || 'TA什么也没说.',
                        duration: res.duration * 60000,
                        timestamp: new Date()
                    }
                    webq.uploadRTLSData(d).then(function(){
                        store.setUserOnlineData(JSON.stringify(d));
                        $scope.dashHeaderRightBtn = true;
                    }, function(){
                        $scope.dashHeaderRightBtn = false;
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

})

.controller('MapCtrl', function($rootScope, $scope, $ionicModal,
    $ionicPopup, $log, $timeout, store, webq){
    var self = this;
    $scope.$root.tabsHidden = 'hide-tabs';
    var mapId = 'HelloWorldCafe';
    $scope.markers = {};

    // trick point - handle sub menu 
    $scope.$root.subMenuIcon = 'ion-ios7-people-outline';
    $scope.$root.subMenuShown = true;


    // display a specific user profile in a card
    $ionicModal.fromTemplateUrl('templates/dash-people-detail.html', {
        scope: $scope,
        animation: 'fade-in'
    }).then(function(modal) {
        $scope.peopleDetail = modal;
    });

    $scope.$root.subMenu = function(){
        // display online people list
        $ionicModal.fromTemplateUrl('templates/dash-people.html', {
            scope: $scope,
            animation: 'fade-in'
        }).then(function(modal) {
            $scope.peopleList = modal;
            $scope.peopleList.show();
        });
    };

    $scope.closePeopleListModal = function(){
        if($scope.peopleList && $scope.peopleList.isShown()){
            $scope.peopleList.hide();
        }
    };

    $scope.closePeopleDetailModal = function(){
        if($scope.peopleDetail && $scope.peopleDetail.isShown()){
            $scope.peopleDetail.hide();
        }
    };

    $scope.search = {
        value: ''
    };

    $scope.doSearch = function () {
        var keyword = $scope.search.value.toLowerCase(),
            displayName,
            results = {};

        // better use _.pick instead, will be fixed in underscore 1.7.0
        // $scope.results = _.pick($scope.markers, function (value, key, object) {

        //     if(keyword.length === 0) {
        //         return true;
        //     }

        //     return value.displayName.toLowerCase().indexOf(keyword) > -1;
        // });
        
        for(var attr in $scope.markers) {
            displayName = $scope.markers[attr].displayName.toLowerCase();
            if(keyword.length === 0 || displayName.indexOf(keyword) > -1 ) {
                results[attr] = $scope.markers[attr];
            }
        }

        $scope.results = results;
    };

    $scope.clearSearch = function () {
        $scope.search.value ='';
        $scope.doSearch();
    };

    // bind users that already online
    function _loadMarkers(){
        $scope.markers = {};
        webq.getRTLSDataByMapId(mapId).then(function(data){
            _.each(data, function(val, key, list){
                try{
                    $rootScope.$broadcast('sse:rtls', JSON.parse(val));
                }catch(e){
                    $log.error(e);
                }
            });
        });
    }

    function _createMapView(){
        // delete old map and its markers
        if(self.map){
            self.map.remove();
            delete self.map;
        }

        var mb = store.getMaps()[mapId].mapbox;
        L.mapbox.accessToken = mb.accessToken;
        var southWest = L.latLng(mb.southWest.lat, mb.southWest.lng),
            northEast = L.latLng(mb.northEast.lat, mb.northEast.lng),
            bounds = L.latLngBounds(southWest, northEast);

        self.map = L.mapbox.map('las-map',
            mb.id, {
                minZoom: mb.minZoom,
                maxZoom: mb.maxZoom,
                maxBounds: bounds,
                // Set it to false if you don't want the map to zoom 
                // beyond min/max zoom and then bounce back when pinch-zooming.
                // TODO it does not work.
                // https://github.com/arrking/musa-hw-mobile/issues/101
                bounceAtZoomLimits: false
            }).setView([mb.centerLat, mb.centerLng ], mb.defaultZoom);
        // https://www.mapbox.com/mapbox.js/api/v1.6.1/l-control-attribution/
        var credits = L.control.attribution({prefix: false}).addTo(self.map);
        credits.addAttribution('© 北京金矢科技有限公司');

        _loadMarkers();
    }

    $scope.$on('$viewContentLoaded', function(event){
        _createMapView();
    });

    window.MOBAY_DISPLAY = function(name){
        if($scope.markers[name]){
            // set candidate personal information
            var profile = $scope.markers[name].profile;
            var edu = profile.educations._total > 0 ? profile.educations.values[0].schoolName:'';
            var company = profile.positions._total >0 ? profile.positions.values[0].company.name:'';
            var interests = profile.interests;
            $scope.candidate = {
                edu: edu,
                company: company,
                interests: interests,
                picture: profile.pictureUrl,
                displayName: $scope.markers[name].displayName,
                status: $scope.markers[name].status
            };
            if(!$scope.peopleDetail.isShown()){
                $scope.peopleDetail.show();
            }
        }
    };
    // display a user in map centrically
    $scope.locate = function(username){
        if($scope.peopleList && $scope.peopleList.isShown()){
            $scope.peopleList.hide();
        }
        setTimeout(function() {
            try{
                self.map.panTo($scope.markers[username].marker.getLatLng());
                $scope.markers[username].marker
                    .closePopup()
                    .openPopup();
            }catch(e){
                $log.error(e);
            }
        }, 1000);
    };

    $scope.doRefresh = function() {
        $timeout( function() {
            //simulate async response
            // $scope.items.push('New Item ' + Math.floor(Math.random() * 1000) + 4);

            // //Stop the ion-refresher from spinning
            $scope.doSearch();
            $scope.$broadcast('scroll.refreshComplete');
        }, 1000);
    };

    $scope.$on('ntm', function(event, type){
        switch(type){
        case 'online2offline':
            // alert the user
            $ionicPopup.alert({
                title: '无网络连接，无法更新地图。', // String (optional). The sub-title of the popup.
                okText: '关闭' // String (default: 'OK'). The text of the OK button.
            });
            break;
        case 'offline2online':
            _createMapView();
            break;
        default:
            break;
        }
    });

    $scope.$on('sse:rtls', function(event, data){
        try{
            // alert(JSON.stringify(data));
            // alert(data.mapId + data.username);
            if(data.mapId === mapId){
                var markerKeys = _.keys($scope.markers);
                switch(data.type){
                case 'locin':
                    if(_.indexOf(markerKeys, data.username) == -1){
                        // check if it is loc shift event
                        // a loc shift event means two user happens to scan the same seat in a period
                        // this may happens when a user leaves his seat without stop loc sharing
                        // so, the pre user should be deleted at this timie
                        if(data.preUser){
                            // delete preUser at first
                            if($scope.markers[data.preUser]){
                                self.map.removeLayer($scope.markers[data.preUser].marker);
                                delete $scope.markers[data.preUser];
                            }
                        }

                        var m = L.marker([data.lat,data.lng])
                            .addTo(self.map)
                            .bindPopup('<img width="50px" height="50px" ' +
                                'src="{0}" onclick="javascript:MOBAY_DISPLAY(\'{1}\')"></img>'.f(data.profile.pictureUrl, data.username))
                            .openPopup();
                        $scope.markers[data.username] = {
                            picture: data.profile.pictureUrl,
                            displayName: data.displayName,
                            status: data.status,
                            marker: m,
                            profile: data.profile,
                            passport: data.passport
                        };
                    }else{
                        $scope.markers[data.username].marker.setLatLng([data.lat,data.lng]);
                        $scope.markers[data.username].marker.update();
                        $scope.markers[data.username].marker.bindPopup('<img width="50px" height="50px" ' +
                                'src="{0}" onclick="javascript:MOBAY_DISPLAY(\'{1}\')"></img>'.f(data.profile.pictureUrl, data.username))
                                .openPopup();
                        $scope.markers[data.username].picture = data.profile.pictureUrl;
                        $scope.markers[data.username].status = data.status;
                        $scope.markers[data.username].displayName= data.displayName;
                        $scope.markers[data.username].profile= data.profile;
                        $scope.markers[data.username].passport= data.passport;
                    }
                    break;
                case 'locout':
                    if($scope.markers[data.username]){
                        self.map.removeLayer($scope.markers[data.username].marker);
                        delete $scope.markers[data.username];
                    }
                    break;
                default:
                    break;
                }
            }else{
                $log.debug('>> get event for {0} .'.f(data.mapId));
            }
        }catch(e){
            alert(e);
        }
    });

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        try{
            $scope.peopleDetail.remove();
            if($scope.peopleList){
                $scope.peopleList.remove();
            }
            delete window.MOBAY_DISPLAY;
        }catch(e){
            $log.error(e);
        }
    });

})

.controller('NotificationsCtrl', function($scope, store) {
    $scope.$root.tabsHidden = '';
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

.controller('ProfileCtrl', function($scope, $ionicActionSheet, $ionicLoading, $timeout, $log, store, camera, webq) {
    $scope.$root.tabsHidden = '';
    $scope.title = '个人信息';
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

    function _processAvatarData(img){
        $ionicLoading.show({
            template: '<i class="icon ion-loading-a positive"></i>'
        });
        webq.uploadUserAvatar(img).then(function(url){
            $scope.avatarUrl = url;
            $scope.$apply();
        }, function(err){
            
            $scope.title = '上传失败，请稍候重试。';
            $scope.$apply();

            $timeout(function(){
                $scope.title = '个人信息';
                $scope.$apply();
            }, 3000);
        }).finally(function(){
            $ionicLoading.hide();
        });
    }

    $scope.takePhotoActionSheet = function(){
        // Show the action sheet
        $ionicActionSheet.show({
            buttons: [
                { text: '拍照' }, // index 0
                { text: '相册' }  // index 1
            ],
            titleText: '更新头像',
            cancelText: '取消',
            cancel: function() {
                  // add cancel code..
            },
            buttonClicked: function(index) {
                switch(index){
                case 0:
                    camera.takePhotoByCamera(function(imageData){
                        _processAvatarData(imageData);
                    });
                    break;
                case 1:
                    camera.takePhotoByLibrary(function(imageData){
                        _processAvatarData(imageData);
                    });
                    break;
                default:
                    break;
                }
                return true;
            }
        });
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

.controller('SettingsCtrl', function ($rootScope, $state, $scope, $ionicModal, $log, $http, cfg, store, webq, mbaas) {
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
        $state.go('login-form');
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

    $ionicModal.fromTemplateUrl('templates/settings-terms.html', {
        scope: $scope,
        animation: 'fade-in'
    }).then(function(modal) {
        $scope.userTermsModal = modal;
    });

    // show a modal for user service level agreements
    $scope.showUserTermsModal = function(){
        $scope.userTermsModal.show();
        webq.getUserServiceAgreements().then(function(data){
            $scope.terms = data;
        }, function(err){
            $scope.terms = '<div class="item text-center" style="border: 0;">{0}</div>'.f('网络错误，请稍后重试。');
        });
    };

    $scope.hideUserTermsModal = function(){
        $scope.userTermsModal.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        try{
            $scope.userTermsModal.remove();
        }catch(e){
            $log.error(e);
        }
    });
})

.controller('ResetPwdCtrl', function($state, $scope, $log, $ionicPopup, $timeout, webq, cfg, store){
    $scope.$root.tabsHidden = 'hide-tabs';
    $scope.title = '重置密码';
    $scope.enableSubmitBtn = false;
    $scope.data = {
        newPwd: '',
        verifyCode: '',
        verifyCodePlsHolder:''
    };

    function _toast(msg){
        $scope.title = msg;
        $timeout(function(){
            $scope.title = '重置密码';
            $scope.$apply();
        }, 2000);
    }

    // check the new password
    var passwordRegex = /\S{6,20}/;
    $scope.validate = function(){
        if(!passwordRegex.test($scope.data.newPwd)) {
            $scope.enableSubmitBtn = false;
            return false;
        }
        $scope.enableSubmitBtn = true;
    }

    $scope.postNewPassword = function(){
        // TODO validate password 
        if($scope.data.newPwd){
            webq.resetPwd($scope.data.newPwd).then(function(){
                // popup a dialog for input verify code
                var verifyCodeDialog = $ionicPopup.show({
                    template: '<input type="text" ng-model="data.verifyCode" placeholder="{{data.verifyCodePlsHolder}}" autocapitalize="off" maxlength="4" autocorrect="off" autocomplete="off">',
                    title: '验证码',
                    subTitle: '验证码已经发送到您的邮箱({0})，请注意查收。'.f(store.getUserId()),
                    scope: $scope,
                    buttons: [
                        { text: '取消' },
                        {
                            text: '<b>确定</b>',
                            type: 'button-positive',
                            onTap: function(e) {
                                //don't allow the user to close unless he enters wifi password
                                if ($scope.data.verifyCode) {
                                    webq.localPassportVerify($scope.data.verifyCode).then(function(data){
                                        // reset password successfully
                                        // go to login page
                                        verifyCodeDialog.close();
                                        webq.logout();
                                        $state.go('login-form', {
                                            msg: '密码更新成功',
                                            email: store.getUserId(),
                                            activeSlideIndex: 2
                                        });
                                    }, function(err){
                                        // rc = 2 wrong code
                                        // rc = 3 too many attempt
                                        switch(err.rc){
                                        case 2:
                                            $scope.data.verifyCode = '';
                                            $scope.data.verifyCodePlsHolder = '验证码错误 请重新输入';
                                            break;
                                        case 3:
                                            $scope.data.verifyCode = '';
                                            $scope.data.verifyCodePlsHolder = '验证次数超过限制';
                                            $scope.data.newPwd = '';
                                            $timeout(function(){
                                                try{
                                                    verifyCodeDialog.close();
                                                }catch(error){
                                                    alert(error);
                                                }
                                            }, 3000);
                                            // close this dialog
                                            break;
                                        default:
                                            break;
                                        }
                                    });
                                }
                                e.preventDefault();
                            }
                        }
                    ]
                });
            }, function(err){
                // alert(JSON.stringify(err));
                if(typeof err == 'object' &&
                    err.rc == 3){
                    _toast('该用户不存在');
                }else if(typeof err == 'object' &&
                    err.rc == 4){
                    $log.error('>> API RESPONSE {0} , LEAK PARAMETERS ?'.f(JSON.stringify(err)));
                }else{
                    $ionicPopup.alert({
                        title: '未知错误',
                        template: '通过(设置－用户反馈) 联系我们。'
                    });
                }
            });
        }else{
            _toast('密码不能为空');
        }
    };
})
;