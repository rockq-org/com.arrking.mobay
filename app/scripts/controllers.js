/*
 * Licensed Materials - Property of Hai Liang Wang
 * All Rights Reserved.
 */
angular.module('mobay.controllers', [])

.controller('LoginCtrl', function($scope, $state, $http, $log, store, cfg, webq) {
	// check out the sid value and decide which page should be
    // navigator.splashscreen.hide();
    try{
    	var sid = store.getUserSID();
    	alert(sid);
    	if(sid){
    		webq.getUserProfile()
			.success(function(data, status, headers) {
				// this callback will be called asynchronously
				// when the response is available
				$state.go('tab.dash');
			}).
			error(function(data, status, headers) {
				// error occured, maybe the session is expired
				// so, keep the user at login page
			});
    	}
    }catch(e){
    	$log.error(e);
    }
	// Form data for the login modal
	$scope.loginData = {};
	$scope.doLogin = function(){
		webq.loginLocalPassport($scope.loginData.username, 
			$scope.loginData.password).
		then(function(data){
			// set sid into storage
            cordova.plugins.musa.setCookieByDomain('http://{0}/,http://{1}/'.f(cfg.host, cfg.ssehost), data.sid, function() {
				webq.getUserProfile()
				.success(function(data, status, headers) {
					$log.debug(data);
					$state.go('tab.dash');
				})
				.error(function(data, status){
					$log.error('can not get user profile.')
					$log.error(data);
				})
            });
		}, function(error){
			// TODO show an error message
			/*
			 * Possible Cause for login error 
			 * (1) wrong username and password
			 * (2) no network
			 */
			$log.error(error);
			$scope.loginData = {};
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
