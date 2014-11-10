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

    this.getUserSID = function() {
        return window.localStorage.getItem('MUSA_USER_SID'.f(this.getUserId()));
    };

    this.setUserSID = function(sid) {
        window.localStorage.setItem('MUSA_USER_SID'.f(this.getUserId()), sid);
    };

    this.deleteUserSID = function() {
        window.localStorage.removeItem('MUSA_USER_SID'.f(this.getUserId()));
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
// web request utility
.service('webq', function($http, $q, cfg, store) {

    // retrieve user profile information
    this.getUserProfile = function() {
        var defer = $q.defer();
        // $http.get('http://{0}/user/me'.f(cfg.host), {
        //     headers: {
        //       'Accept': 'application/json'
        //     },
        //     responseType: 'json'
        // }).
        // success(function(data, status){
        //   alert('sc')
        //   defer.resolve(data);
        // }).
        // error(function(data, status){
        //   alert('fa')
        //   defer.reject(data);
        // });

        $http.get('http://{0}/secret'.f(cfg.host), {
            headers: {
                'Authorization': 'Bearer {0}'.f(store.getAccessToken()['access_token'])
            }
        }).
        success(function(data) {
            defer.resolve(data);
        }).
        error(function(err) {
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
            console.debug('login data ' + JSON.stringify(data));
            defer.resolve(data);
        }).
        error(function(data, status, headers) {
            console.debug('error ' + status);
            console.debug(data);
            defer.reject(data);
        });

        return defer.promise;
    };

    // logout user
    this.logout = function(){
        var token = store.getAccessToken()['access_token'];
        if(token){
            $http.get('http://{0}/logout'.f(cfg.host), {
                headers:{
                    'Authorization': 'Bearer {0}'.f(token)
                }   
            });
        }
    }

})

;