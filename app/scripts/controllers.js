/*
 * Licensed Materials - Property of Hai Liang Wang
 * All Rights Reserved.
 */
angular.module('mobay.controllers', [])

.controller('LoginCtrl', function($scope) {
	// check out the sid value and decide which page should be

	// hide splash screen
	setTimeout(function() {
        navigator.splashscreen.hide();
    }, 2000);


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
