/*
 * Licensed Materials - Property of Hai Liang Wang
 * All Rights Reserved.
 */
angular.module('mobay.controllers', [])

.controller('LoginCtrl', function($scope, $state, $http, store, cfg, webq) {
	// check out the sid value and decide which page should be
    // navigator.splashscreen.hide();
    try{
    	var sid = store.getUserSID();
    	if(sid){
    		webq.getUserProfile()
			.success(function(data, status, headers) {
				// this callback will be called asynchronously
				// when the response is available
				console.debug('>> get user profile status ' + status)
				console.debug('>> get user profile data ' + JSON.stringify(data))
				$state.go('tab.dash');
			}).
			error(function(data, status, headers) {
				console.debug('>> get user profile status' + status)
				// called asynchronously if an error occurs
				// or server returns response with an error status.
			});
    	}else{
    		// no sid, keep user at login page
    	}
    }catch(e){
    	console.error(e);
    }
	// Form data for the login modal
	$scope.loginData = {};
	$scope.doLogin = function(){
		webq.loginLocalPassport($scope.loginData.username, 
			$scope.loginData.password).
		then(function(data){
			console.debug('Im in.')
		}, function(error){
			console.debug('ops ..')
		})
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
