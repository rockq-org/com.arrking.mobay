/*
 * Licensed Materials - Property of Hai Liang Wang
 * All Rights Reserved.
 */
angular.module('mobay.controllers', [])

.controller('LoginCtrl', function($scope, $state, store, cfg) {
	// check out the sid value and decide which page should be
    // navigator.splashscreen.hide();
    var sid = store.getUserSID();
	if(sid){
		// validate the session is available
		// get user profile
		alert(sid);
	}else{
		// show login page, hide splash screen
		alert('no sid');
	}
	// $state.go("tab.dash");
	// alert(MOBAYCFG.console)

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
