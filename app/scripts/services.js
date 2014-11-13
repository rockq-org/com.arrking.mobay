'use strict';
angular.module('mobay.services', ['config'])

/**
 * A simple example service that returns some data.
 */
.factory('Friends', function() {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var friends = [{
        id: 0,
        name: 'Scruff McGruff'
    }, {
        id: 1,
        name: 'G.I. Joe'
    }, {
        id: 2,
        name: 'Miss Frizzle'
    }, {
        id: 3,
        name: 'Ash Ketchum'
    }];

    return {
        all: function() {
            return friends;
        },
        get: function(friendId) {
            // Simple index lookup
            return friends[friendId];
        }
    };
})

/** 
 * Persistence Object Manager
 * depends on understore
 */
.service('store', function() {

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
        console.log('[DEBUG] save notifications ... ' + JSON.stringify(json));
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
        '/auth/local']
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
            }else if(store.getAccessToken()['access_token']){
                if(cfg.headers){
                    cfg.headers['Authorization'] =  'Bearer {0}'.f(store.getAccessToken()['access_token']);
                }else{
                    cfg['headers'] = {
                        'Authorization': 'Bearer {0}'.f(store.getAccessToken()['access_token'])
                    }
                }
            }
            return cfg;
        }
    }
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
            $log.debug(data)
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
            if(data['access_token']){
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
            callback();
        });
    }

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
    }

    // save user profile properties
    this.saveUserProfile = function(profile){
        var defer = $q.defer();
        $http.put("http://{0}/user/me".f(cfg.host) , {
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
    }

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
            defer.reject(err)
        });
        return defer.promise;
    }

    // get notification detail
    this.getNotificationDetail = function(msgId){
        return $http.get('http://{0}/cms/post/{1}'.f(cfg.host, msgId), {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                responseType: 'json'
            });
    }
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
                    $log.error(err)
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
                            if (_.indexOf(tags, notification.category) != -1) {
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
            }
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
                        $log.debug("Initialized push successfully");
                        // set _push
                        _push = pushService;
                        _registerDevice(username);
                    },
                    function(err) {
                        $log.error("Error initializing the Push SDK");
                    });
            });
        }else{
            $log.error('>> can not start mbaas due to IBMBluemix.hybrid unavailable.')
        }
    }

    // check the mbaas service is running
    this.isRunning = function(){
        return _push?true:false;
    }

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
                msg: "mbass is not initialized."
            })
        }
        return defer.promise;
    }

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
                msg: "mbass is not initialized."
            })
        }
        return defer.promise;
    }
})

// location awareness service
.service('las', function($http ,$log, webq){
    var _map;

    this.start = function(mapDiv){
        if(!this._map){
            L.mapbox.accessToken = "pk.eyJ1IjoiaGFpbiIsImEiOiJFQUVqelIwIn0.397XBIShpknPNDl6e95mow";
            var southWest = L.latLng(-85.051, -86.528),
                northEast = L.latLng(85.051, 99.053),
                bounds = L.latLngBounds(southWest, northEast);

            _map = L.mapbox.map(mapDiv,
                "hain.ja31ci75", {
                    minZoom: 1,
                    maxZoom: 3,
                    maxBounds: bounds,
                    // Set it to false if you don't want the map to zoom 
                    // beyond min/max zoom and then bounce back when pinch-zooming.
                    // TODO it does not work.
                    // https://github.com/arrking/musa-hw-mobile/issues/101
                    bounceAtZoomLimits: false
            }).setView([45.706, 11.558 ], 1);
        }
    }

    this.isRunning = function(){
        return _map? true: false;
    }
})


;