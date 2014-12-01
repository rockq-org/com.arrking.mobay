'use strict';
angular.module('mobay.services', ['config'])

/**
 * A simple relative timestamp filter
 * http://codepen.io/Samurais/pen/PwwLPK
 * https://gist.github.com/Samurais/0c9e81eb18c3d60db46c
 */
.filter('relativets', function() {

    // ms units
    var second = 1000;
    var minute = 60000;
    var hour = 3600000;
    var day = 86400000;
    var year =  31536000000;
    var month = 2592000000;

    function _formatDateString(val){
        var date = new Date(val);
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

    return function(value) {
        var diff = new Date() - new Date(value);
        var unit = day;
        var unitStr = '分钟前';
        if(diff > year || diff > month || diff > day) {
            // big gap, just return the absolute time
            return _formatDateString(value);
        } else if(diff > hour) {
          unit = hour;
          unitStr = '小时前';
        } else if(diff > minute) {
          unit = minute;
          unitStr = '分钟前';
        } else {
          unit = second;
          unitStr = '秒前';
        }
 
        var amt = Math.ceil(diff / unit);
        return amt + '' + unitStr;
    }
})

/** 
 * Persistence Object Manager
 * depends on understore
 */
.service('store', function($log) {

    this.getAppVersion = function() {
        return window.localStorage.getItem('MUSA_SNOWBALL_VERSION');
    };

    this.setAppVersion = function(appVersion) {
        window.localStorage.setItem('MUSA_SNOWBALL_VERSION', appVersion);
    };

    this.saveUserAvatar = function(data) {
        var profile = this.getUserProfile();
        profile._json.pictureUrl = data;
        this.setUserProfile(profile);
    };

    this.setMaps = function(data) {
        window.localStorage.setItem('{0}-MUSA_MAPS'.f(this.getUserId()), JSON.stringify(data));
    };

    this.getMaps = function() {
        var value = window.localStorage.getItem('{0}-MUSA_MAPS'.f(this.getUserId()));
        if (value) {
            return JSON.parse(value);
        } else {
            return {};
        }
    };

    this.setCurrentMapId = function(mapId) {
        window.localStorage.setItem('{0}-MUSA_CUR_MAP'.f(this.getUserId()), mapId);
    };

    this.getCurrentMapId = function() {
        return window.localStorage.getItem('{0}-MUSA_CUR_MAP'.f(this.getUserId()));
    };

    // email address
    this.setUserId = function(id) {
        window.localStorage.setItem('MUSA_USER_ID', id);
    };

    this.getUserId = function() {
        return window.localStorage.getItem('MUSA_USER_ID');
    };

    this.getSubTags = function() {
        return JSON.parse(window.localStorage.getItem('{0}-SUBTAGS'.f(this.getUserId())) || '[]');
    };

    this.setSubTags = function(data) {
        window.localStorage.setItem('{0}-SUBTAGS'.f(this.getUserId()), JSON.stringify(data));
    };

    this.removeSubTag = function(tagName) {
        if (_.indexOf(this.getSubTags(), tagName) !== -1) {
            var tmp = _.without(this.getSubTags(), tagName);
            this.setSubTags(tmp);
            return tmp;
        } else {
            return this.getSubTags();
        }
    };

    this.saveNotifications = function(data) {
        var key = '{0}-NOTIFICATIONS'.f(this.getUserId());
        var blob = window.localStorage.getItem(key);
        var json = {};
        if (blob) {
            json = JSON.parse(blob);
        }
        // #TODO for data has Chinese, the text has encoded as Unicode,
        // but here does not handle it, so now we get messy code.
        // need to fix it for Beta
        json[data.id] = {
            server: data.server,
            title: data.title,
            date: data.date,
            tags: data.tags,
            isRead: data.isRead || false,
            category: data.category,
            description: data.description || ''
        };
        $log.debug('[DEBUG] save notifications ... ' + JSON.stringify(json));
        window.localStorage.setItem(key, JSON.stringify(json));
    };

    this.getNotifications = function() {
        var json = {};
        var blob = window.localStorage.getItem('{0}-NOTIFICATIONS'.f(this.getUserId()));
        if (blob) {
            json = JSON.parse(blob);
        }
        return json;
    };

    // data is in json format
    this.setUserProfile = function(data) {
        window.localStorage.setItem('{0}-MUSA_USER_PROFILE'.f(this.getUserId()), JSON.stringify(data));
    };

    this.getUserProfile = function() {
        return JSON.parse(window.localStorage.getItem('{0}-MUSA_USER_PROFILE'.f(this.getUserId())));
    };

    this.setUserOnlineData = function(data){
        window.sessionStorage.setItem('{0}-RTLS_ONLINE_DATA'.f(this.getUserId()), data);
    }

    this.getUserOnlineData = function(){
        var data = window.sessionStorage.getItem('{0}-RTLS_ONLINE_DATA'.f(this.getUserId()));
        if(data){
            try{
                return JSON.parse(data);
            }catch(e){
                return false;
            }
        }else{
            return false;
        }
    }

    this.setNotificationAsRead = function(id) {
        var json = this.getNotifications()[id];
        json.isRead = true;
        json.id = id;
        this.saveNotifications(json);
    };

    this.setProfileEditorProperty = function(property) {
        window.sessionStorage.setItem('MUSA_USER_PROFILE_EDITOR_PROPERTY', property);
    };

    this.getProfileEditorProperty = function() {
        return window.sessionStorage.getItem('MUSA_USER_PROFILE_EDITOR_PROPERTY');
    };

    this.setAccessToken = function(data) {
        window.localStorage.setItem('MUSA_ACCESS_TOKEN', JSON.stringify(data));
    };

    this.getAccessToken = function() {
        var token = window.localStorage.getItem('MUSA_ACCESS_TOKEN');
        if (token) {
            return JSON.parse(token);
        } else {
            return {};
        }
    };

    this.deleteAccessToken = function() {
        window.localStorage.removeItem('MUSA_ACCESS_TOKEN');
    };

})

//https://docs.angularjs.org/api/ng/service/$http#interceptors
.service('accessTokenHttpInterceptor', function($q, $log, store){
    var noAccessTokenUrls = ['/public/md/user-service-agreements.md',
        '/auth/local'];
    return {
        request: function(cfg){
            // add exceptions for Authorization header
            if(cfg.url.startsWith('templates')){
                // load load local templates
                // do nothing
            } else if(_.find(noAccessTokenUrls, function(x){
                return cfg.url.endsWith(x);
            })){
                // a list of urls that post no 
                // Authorization Token
            }else if(store.getAccessToken().access_token){
                if(cfg.headers){
                    cfg.headers.Authorization =  'Bearer {0}'.f(store.getAccessToken().access_token);
                }else{
                    cfg.headers = {
                        'Authorization': 'Bearer {0}'.f(store.getAccessToken().access_token)
                    };
                }
            }
            return cfg;
        }
    };
})

// web request utility
.service('webq', function($http, $q, $log, cfg, store) {

    // retrieve user profile information
    this.getUserProfile = function() {
        var defer = $q.defer();
        $http.get('http://{0}/user/me'.f(cfg.host),{
            headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .success(function(data) {
            $log.debug(data);
            defer.resolve(data);
        })
        .error(function(err) {
            // keep at the login page
            $log.error(err);
            defer.reject(err);
        });

        return defer.promise;
    };

    // login user
    this.loginLocalPassport = function(username, password) {
        var defer = $q.defer();

        $http.post('http://{0}/auth/local'.f(cfg.host), {
            email: username,
            password: password
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            responseType: 'json'
        }).
        success(function(data, status, headers) {
            $log.debug('login api response: ' + JSON.stringify(data));
            if(data.access_token){
                defer.resolve(data);
            }else{
                defer.reject(data);
            }
        }).
        error(function(data, status, headers) {
            $log.debug('error ' + status);
            $log.debug(data);
            defer.reject(data);
        });

        return defer.promise;
    };

    // logout user
    this.logout = function(callback){
        $http.get('http://{0}/logout'.f(cfg.host)).finally(function(){
            store.deleteAccessToken();
            if(callback){
                callback();
            }
        });
    };

    // get user service agreements in markdown format
    this.getUserServiceAgreements = function(){
        var defer = $q.defer();
        $http({
            method: 'GET',
            url: 'http://' + cfg.host + '/public/md/user-service-agreements.md'
        }).success(function(data, status, headers, config) {
            try{
                $log.debug(data);
                var converter = new Showdown.converter();
                defer.resolve(converter.makeHtml(data));
            }catch(e){
                $log.error(e);
                defer.reject(e);
            }
        }).error(function(err, status){
            $log.error('Can not get /public/md/user-service-agreements.md from server.');
            defer.reject(err);
        });
        return defer.promise;
    };

    // save user profile properties
    this.saveUserProfile = function(profile){
        var defer = $q.defer();
        $http.put('http://{0}/user/me'.f(cfg.host) , {
            profile: profile
        },
        {
            headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            responseType: 'json'
        }).success(function(data, status){
            defer.resolve(data);
        }).error(function(data, status){
            defer.reject(data);
        });
        return defer.promise;
    };

    // get notifications from remote server
    this.getNotifications = function(){
        var defer = $q.defer();
        $http.get('http://{0}/user/notifications'.f(cfg.host), {
            headers: {
                accept: 'application/json'
            }
        }).success(function(data){
            defer.resolve(data);
        }).
        error(function(err){
            defer.reject(err);
        });
        return defer.promise;
    };

    // get notification detail
    this.getNotificationDetail = function(msgId){
        return $http.get('http://{0}/cms/post/{1}'.f(cfg.host, msgId), {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                responseType: 'json'
            });
    };

    // get maps data from CafeServer
    this.getMapdata = function(){
        var defer = $q.defer();
        $http.get('http://{0}/rtls/maps'.f(cfg.host), {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            responseType: 'json'
        }).success(function(data, status){
            defer.resolve(data);
        }).error(function(data, status){
            defer.reject(data);
        });
        return defer.promise;
    };

    // this upload 
    this.uploadRTLSData = function(data){
        var defer = $q.defer();
        $http.post('http://{0}/rtls/locin'.f(cfg.host), data, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            responseType: 'json'
        })
        .success(function(res, status){
            // {rc: 0, msg: visible event is published.}
            if(res && res.rc == 0){
                defer.resolve();
            }else{
                $log.error(res);
                defer.reject();
            }
        })
        .error(function(err, status){
            $log.error(err);
            defer.reject();
        });
        return defer.promise;
    };

    // upload Avatar 
    this.uploadUserAvatar = function(data){
        var defer = $q.defer();
        $http.post('http://{0}/user/avatar'.f(cfg.host), {
            base64: data
        },{
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            responseType: 'json'
        })
        .success(function(data){
            if(data && data.rc == 3){
                store.saveUserAvatar(data.url);
                defer.resolve(data.url);
            }else{
                defer.reject();
            }
        })
        .error(function(err){
            defer.reject(err);
        });
        return defer.promise;
    };

    // get online people for a specific mapId
    this.getRTLSDataByMapId = function(mapId){
        var defer = $q.defer();
        $http.get('http://{0}/rtls/{1}'.f(cfg.host, mapId), {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            responseType: 'json'
        }).success(function(data){
            defer.resolve(data);
        }).error(function(err, status){
            defer.reject({
                error: err,
                status: status
            });
        });
        return defer.promise;
    }

    // check whether the logged-in user is online by mapId
    this.checkUserOnlineByMapId = function(mapId){
        var defer = $q.defer();
        // TODO hardcode the mapId with short name
        $http.get( 'http://{0}/rtls/{1}/{2}'.f(cfg.host, 'hw', store.getUserId()), {
            headers:{
                'Accept': 'application/json'
            },
            responseType: 'json'
        }).success(function(data){
            if(data.rc && data.rc == 2){
                defer.resolve(data.msg);
            }else{
                defer.reject(data);
            }
        }).error(function(err){
            defer.reject(err);
        });
        return defer.promise;
    };

    // stop sharing location
    this.stopSharingLocation = function(mapId, lat, lng, timestamp){
        var defer = $q.defer();
        // TODO this API is not securer as any user can post data with
        // another user's email, a better choice is getting the 
        // userId from server side, as the user is saved in req.user.
        $http.post('http://{0}/rtls/locout'.f(cfg.host),{
            // TODO hardcode mapId
            mapId: 'HelloWorldCafe',
            username: store.getUserId(),
            lat: lat,
            lng: lng,
            timestamp: timestamp
        },
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).success(function(data){
            defer.resolve(data);
        }).error(function(err){
            defer.reject(err);
        });
        return defer.promise;
    };

    // reset password from settings page
    this.resetPwd = function(newPwd){
        var defer = $q.defer();
        $http.post('http://{0}/auth/local/reset'.f(cfg.host), {
            password: newPwd
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            responseType: 'json'
        }).success(function(data){
            if(data && data.rc == 1){
                // verify code is sent out
                defer.resolve();
            }else{
                defer.reject(data);
            }
        }).error(function(err){
            defer.reject(err);
        });

        return defer.promise;
    };

    // forget password
    this.forgetPwd = function(email, newPwd){
        var defer = $q.defer();
        $http.put('http://{0}/auth/local/signup'.f(cfg.host), {
            email: email,
            password: newPwd
        }, {
            headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            responseType: 'json'
        }).success(function(data){
            // data.rc = 1 succ
            // data.rc = 3 user does not exist
            // data.rc = 4 not proper parameters
            if(data && data.rc == 1){
                defer.resolve();
            } else {
                defer.reject(data);
            }
        }).error(function(err){
            defer.reject(err);
        });

        return defer.promise;
    };

    // verify code to reset pwd
    this.localPassportVerify = function(code, email){
        var defer = $q.defer();
        $http.post('http://{0}/auth/local/verify'.f(cfg.host), {
            code: code,
            email: email||store.getUserId()
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            responseType: 'json'            
        }).success(function(data){
            // data.rc = 6 succ for reset/(forget?) password
            // data.rc = 2 wrong
            // data.rc = 3 wrong and reach max attempt
            // data.rc = 9 succ for sign up
            if(data && data.rc == 6){
                defer.resolve(data);
            } else if( data && data.rc == 9){
                defer.resolve(data);
            } else {
                defer.reject(data);
            }
        }).error(function(err){
            defer.reject(err);
        });
        return defer.promise;
    };


    // sign up new account
    // parms {username, password, email}
    this.signup = function(parms){
        var defer = $q.defer();
        $http.post('http://{0}/auth/local/signup'.f(cfg.host), parms, {
            headers: {
                'Content-Type' : 'application/json',
                'Accept': 'application/json'
            },
            responseType: 'json'
        }).success(function(res){
            if(res && res.rc == '1'){
                defer.resolve();
            }else{
                defer.reject(res);
            }
        }).error(function(err){
            defer.reject(err);
        });
        return defer.promise;
    };

})

.service('mbaas', function($q, $log, cfg, store, webq){
    var _push;

    function _registerDevice(username){
        _push.registerDevice(device.uuid, username, '(function(msg){setTimeout(window.handleApplePushNotificationArrival(msg),5000);})').then(
            function(response) {
                $log.debug('bluemix push registered device ' + JSON.stringify(response));
                _push.getSubscriptions().done(function(response) {
                    $log.debug('get subscriptions in mbaas ' + JSON.stringify(response.subscriptions));
                    store.setSubTags(response.subscriptions);
                }, function(err) {
                    $log.error(err);
                });
            },
            function(error) {
                $log.error('bluemix push error registering device ' + error);
            }
        );
    }

    this.start = function(username) {
        $log.debug('>> start mbaas service .');
        /**
         * this code is ugly, but still not found better ways to make handleBlueMixNotification globally.
         * because it has to be global to support callback from IBMPush iOS Native Code.
         * use a timeout function can make backgroud-foreground works.
         * but close-foreground still does not work.
         * the message arrives, but when the app wake up, the cordova method does not called.
         */
        if(!window.handleApplePushNotificationArrival){
            window.handleApplePushNotificationArrival = function(msg){
                // msg = { alert, payload:{}}
                webq.getNotifications().then(function(data) {
                    if (_.isObject(data.notifications)) {
                        var tags = store.getSubTags();
                        var keys = _.keys(data.notifications);
                        keys.forEach(function(key) {
                            try {
                                var notification = JSON.parse(data.notifications[key]);
                                // check if the notification is subscribed by this user
                                if (_.indexOf(tags, notification.category) !== -1) {
                                    $log.debug('save notification into localStorage - ' + JSON.stringify(notification));
                                    store.saveNotifications(notification);
                                }
                            } catch (e) {
                                $log.debug(e);
                            }
                        });
                    }
                }, function(err) {
                    $log.debug(err);
                });
            };
        }

        // initialize IBM Bluemix Mobile SDK
        if(window.IBMBluemix){
            IBMBluemix.hybrid.initialize({
                applicationId: cfg.pushAppId,
                applicationRoute: cfg.pushAppRoute,
                applicationSecret: cfg.pushAppSecret
            }).then(function() {
                IBMPush.hybrid.initializeService().then(
                    function(pushService) {
                        $log.debug('Initialized push successfully');
                        // set _push
                        _push = pushService;
                        _registerDevice(username);
                    },
                    function(err) {
                        $log.error('Error initializing the Push SDK');
                    });
            });
        }else{
            $log.error('>> can not start mbaas due to IBMBluemix.hybrid unavailable.');
        }
    };

    // check the mbaas service is running
    this.isRunning = function(){
        return _push?true:false;
    };

    // sub a tag
    this.subTag = function(tagName){
        var defer = $q.defer();
        if (_push) {
            _push.subscribeTag(tagName).done(function(response) {
                // Successfully subscribed to tag
                defer.resolve(response);
            }, function(err) {
                // Handle errors
                defer.reject({
                    rc: 1,
                    msg: err
                });
            });
        } else {
            defer.reject({
                rc: 2,
                msg: 'mbass is not initialized.'
            });
        }
        return defer.promise;
    };

    // unsub a tag
    this.unSubTag = function(tagName){
        var defer = $q.defer();
        if (_push) {
            _push.unsubscribeTag(tagName).done(function(response) {
                // Successfully subscribed to tag
                defer.resolve(response);
            }, function(err) {
                // Handle errors
                defer.reject({
                    rc: 1,
                    msg: err
                });
            });
        } else {
            defer.reject({
                rc: 2,
                msg: 'mbass is not initialized.'
            });
        }
        return defer.promise;
    };
})

.service('gps', function($q, $log, store){
    // get current position by gps plugin
    this.getCurrentPosition = function() {
        var defer = $q.defer();
        navigator.geolocation.getCurrentPosition(function(position) {
                // onSuccess Callback
                // This method accepts a Position object, which contains the
                // current GPS coordinates
                //
                // alert('Latitude: '          + position.coords.latitude          + '\n' +
                //       'Longitude: '         + position.coords.longitude         + '\n' +
                //       'Altitude: '          + position.coords.altitude          + '\n' +
                //       'Accuracy: '          + position.coords.accuracy          + '\n' +
                //       'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
                //       'Heading: '           + position.coords.heading           + '\n' +
                //       'Speed: '             + position.coords.speed             + '\n' +
                //       'Timestamp: '         + position.timestamp                + '\n');
                defer.resolve(position);
            },
            // onError Callback receives a PositionError object
            //
            function(err) {
                $log.error(err);
                defer.reject(err);
            });
        return defer.promise;
    };

    // is point inside circle
    this.isPointInsideCircle = function(premise, point) {
        var defer = $q.defer();
        var mapData = store.getMaps();
        if (mapData) {
            $log.debug('center ' + JSON.stringify(mapData[premise].circle));
            $log.debug('point ' + JSON.stringify(point));
            try{
                if(geolib.isPointInCircle(point, mapData[premise].circle.center, mapData[premise].circle.radius)){
                    defer.resolve();
                }else{
                    defer.reject({
                        rc: 1,
                        msg: '您当前不在{0} '.f(mapData[premise].name)
                    });
                }
            }catch(e){
                $log.error(e);
                defer.reject({
                    rc: 2,
                    msg: 'UNKNOW ERROR, get log for detail.'
                });
            }
        } else {
            $log.error('NO MAP DATA.');
            defer.reject({
                rc: 3,
                msg: '无法得到地图信息'
            });
        }
        return defer.promise;
    };

})

.service('sse', function($rootScope, $log, cfg){

    this.start = function(){
        var source = new EventSource('http://{0}/sse/out/activity'.f(cfg.ssehost));
        source.addEventListener('message', function(e) {
            // emit event
            try{
                // alert(typeof e.data);
                // alert(JSON.stringify(JSON.parse(e.data)));
                $rootScope.$broadcast('sse:rtls', JSON.parse(e.data));
            }catch(err){
                $log.error(err);
            }
        }, false);
    };
})

.service('camera', function(){
    var cameraOptions = {
      quality: 75,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 180,
      targetHeight: 180,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    };

    this.takePhotoByCamera = function(succ, error){
        cameraOptions.sourceType = Camera.PictureSourceType.CAMERA;
        navigator.camera.getPicture(succ, error, cameraOptions);

    };

    this.takePhotoByLibrary = function(succ, error){
        cameraOptions.sourceType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
        navigator.camera.getPicture(succ, error, cameraOptions);
    };

})

/*
 * network manager is only available after cordova plugins are loaded.
 * if not, will get an error that says 'TypeError: undefined is not an object'
 * https://github.com/apache/cordova-plugin-network-information/blob/master/doc/index.md
 * iOS Quirks to support iPhone 5S, 
 * iOS does not have specific info like WIFI, 3G ... just cellular or not
 * Network Status Array
 *   states[Connection.UNKNOWN] = 'Unknown connection';
 *   states[Connection.ETHERNET] = 'Ethernet connection';
 *   states[Connection.WIFI] = 'WiFi connection';
 *   states[Connection.CELL_2G] = 'Cell 2G connection';
 *   states[Connection.CELL_3G] = 'Cell 3G connection';
 *   states[Connection.CELL_4G] = 'Cell 4G connection';
 *   states[Connection.CELL] = 'Cell generic connection';
 *   states[Connection.NONE] = 'No network connection';
 */
.service('ntm', function($rootScope, $log){

    var self = this;
    // start a agent process to run intervally
    // monitor the network switch event, make sure to call this interface
    // after cordova device ready event is fired.
    this.start = function(){
        var hasNetwork;
        setInterval(function(){
            try {
                // $rootScope.$broadcast('ntm:', JSON.parse(e.data));
                switch(self.getNetwork()){
                    case -1:
                        $log.debug('network manager is only available after cordova plugins are loaded.');
                        break;
                    case 0:
                        if(typeof hasNetwork === 'undefined' ){
                            hasNetwork = false;
                        } else if(hasNetwork){
                            hasNetwork = false;
                            $rootScope.$broadcast('ntm', 'online2offline');
                        } 
                        break;
                    case 1:
                        if(typeof hasNetwork === 'undefined'){
                            hasNetwork = true;
                        }else if(!hasNetwork){
                            hasNetwork = true;
                            $rootScope.$broadcast('ntm', 'offline2online');
                        }
                        break;
                    default:
                        $log.error('UNKNOWN Network Status Type.');
                        break;
                }
            } catch(e) {
                alert(e);
                $log.error(e);
            }
        }, 5000);
    };

    // current this method only supports iOS
    // 1 - online
    // 0 - offline
    // -1 - plugin is not loaded
    this.getNetwork = function(){
        if(navigator.connection && navigator.connection.type){
            if(_.indexOf([Connection.WIFI, Connection.CELL], navigator.connection.type) != -1){
                // network is available
                return 1;
            } else {
                // device is offline
                return 0;
            }
        }else{
            return -1;
        }
    };
})

;