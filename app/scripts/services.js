angular.module('mobay.services', [])

/**
 * A simple example service that returns some data.
 */
.factory('Friends', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var friends = [
    { id: 0, name: 'Scruff McGruff' },
    { id: 1, name: 'G.I. Joe' },
    { id: 2, name: 'Miss Frizzle' },
    { id: 3, name: 'Ash Ketchum' }
  ];

  return {
    all: function() {
      return friends;
    },
    get: function(friendId) {
      // Simple index lookup
      return friends[friendId];
    }
  }
})

/** 
 * Persistence Object Manager
 * depends on understore
 */
.factory('store', function(){

    function _getAppVersion() {
    return window.localStorage.getItem('MUSA_SNOWBALL_VERSION');
  }

  function _setAppVersion(appVersion) {
    window.localStorage.setItem('MUSA_SNOWBALL_VERSION', appVersion);
  }

  function _saveUserAvatar(data) {
    var profile = _getUserProfile();
    profile._json.pictureUrl = data;
    _setUserProfile(profile);
  }

  function _setMaps(data) {
    window.localStorage.setItem('{0}-MUSA_MAPS'.f(_getUserId()), JSON.stringify(data));
  }

  function _getMaps() {
    var value = window.localStorage.getItem('{0}-MUSA_MAPS'.f(_getUserId()));
    if (value) {
      return JSON.parse(value);
    } else {
      return {};
    }
  }

  function _setCurrentMapId(mapId) {
    window.localStorage.setItem('{0}-MUSA_CUR_MAP'.f(_getUserId()), mapId);
  }

  function _getCurrentMapId() {
    return window.localStorage.getItem('{0}-MUSA_CUR_MAP'.f(_getUserId()));
  }

  // email address
  function _setUserId(id) {
    window.localStorage.setItem('MUSA_USER_ID', id);
  }

  function _getUserId() {
    return window.localStorage.getItem('MUSA_USER_ID');
  }

  function _getSubTags() {
    return JSON.parse(window.localStorage.getItem('{0}-SUBTAGS'.f(_getUserId())) || '[]');
  }

  function _setSubTags(data) {
    window.localStorage.setItem('{0}-SUBTAGS'.f(_getUserId()), JSON.stringify(data));
  }

  function _removeSubTag(tagName) {
    if (_.indexOf(_getSubTags(), tagName) != -1) {
      var tmp = _.without(_getSubTags(), tagName);
      _setSubTags(tmp);
      return tmp;
    } else {
      return _getSubTags();
    }
  }

  function _saveNotifications(data) {
    var key = '{0}-NOTIFICATIONS'.f(_getUserId());
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
  }

  function _getNotifications() {
    var json = {};
    var blob = window.localStorage.getItem('{0}-NOTIFICATIONS'.f(_getUserId()));
    if (blob) {
      json = JSON.parse(blob);
    }
    return json;
  }

  // data is in json format
  function _setUserProfile(data) {
    window.localStorage.setItem('{0}-MUSA_USER_PROFILE'.f(_getUserId()), JSON.stringify(data));
  }

  function _getUserProfile() {
    return JSON.parse(window.localStorage.getItem('{0}-MUSA_USER_PROFILE'.f(_getUserId())));
  }

  function _getUserSID() {
    return window.localStorage.getItem('MUSA_USER_SID'.f(_getUserId()));
  }

  function _setUserSID(sid) {
    window.localStorage.setItem('MUSA_USER_SID'.f(_getUserId()), sid);
  }

  function _deleteUserSID() {
    window.localStorage.removeItem('MUSA_USER_SID'.f(_getUserId()));
  }

  function _setNotificationAsRead(id) {
    var json = _getNotifications()[id];
    console.log('get json ' + JSON.stringify(json));
    json.isRead = true;
    json.id = id;
    _saveNotifications(json);
  }

  function _setProfileEditorProperty(property) {
    window.sessionStorage.setItem('MUSA_USER_PROFILE_EDITOR_PROPERTY', property);
  }

  function _getProfileEditorProperty() {
    return window.sessionStorage.getItem('MUSA_USER_PROFILE_EDITOR_PROPERTY');
  }

  return {
    saveNotifications: _saveNotifications,
    getNotifications: _getNotifications,
    setUserProfile: _setUserProfile,
    getUserProfile: _getUserProfile,
    setUserSID: _setUserSID,
    getUserSID: _getUserSID,
    deleteUserSID: _deleteUserSID,
    setAppVersion: _setAppVersion,
    getAppVersion: _getAppVersion,
    setUserId: _setUserId,
    getUserId: _getUserId,
    setNotificationAsRead: _setNotificationAsRead,
    getSubTags: _getSubTags,
    setSubTags: _setSubTags,
    removeSubTag: _removeSubTag,
    saveUserAvatar: _saveUserAvatar,
    getMaps: _getMaps,
    setMaps: _setMaps,
    setCurrentMapId: _setCurrentMapId,
    getCurrentMapId: _getCurrentMapId,
    setProfileEditorProperty: _setProfileEditorProperty,
    getProfileEditorProperty: _getProfileEditorProperty
  }
});