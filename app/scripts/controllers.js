/*
 * Licensed Materials - Property of Hai Liang Wang
 * All Rights Reserved.
 */
angular.module('mobay.controllers', [])

.controller('LoginCtrl', function($scope, $state, store, cfg) {
	// check out the sid value and decide which page should be
    // navigator.splashscreen.hide();
    try{
    	var sid = store.getNotifications();
    	console.debug(sid);
    }catch(e){
    	console.error(e);
    }
	// $state.go("tab.dash");
	// Form data for the login modal
	// $scope.loginData = {};
	$scope.doLogin = function(){
	};
})

.controller('DashCtrl', function($scope) {
})

.controller('NotificationsCtrl', function($scope, Friends) {
  $scope.friends = Friends.all();
})

.controller('NotificationDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})

.controller('ProfileCtrl', function($scope) {
})

.controller('SettingsCtrl', function($scope) {
});
