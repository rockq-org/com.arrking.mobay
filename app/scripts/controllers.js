/*
 * Licensed Materials - Property of Hai Liang Wang
 * All Rights Reserved.
 */
angular.module('mobay.controllers', [])

.controller('LoginCtrl', function($scope, $state, $http, $log, store, cfg, webq) {
	// check out the sid value and decide which page should be
    // navigator.splashscreen.hide();
  //   try{
		// $state.go('tab.dash');
  //   	var sid = store.getUserSID();
  //   }catch(e){
  //   	$log.error(e);
  //   }
	// Form data for the login modal
	$scope.loginData = {};
	$scope.doLogin = function(){
		webq.loginLocalPassport($scope.loginData.username, 
			$scope.loginData.password).then(function(token){
			store.setAccessToken(token);
			$state.go('tab.dash');
		}, function(err){
			// TODO show an error message
			/*
			 * Possible Cause for login error 
			 * (1) wrong username and password
			 * (2) no network
			 */
			$log.error(err);
			$scope.loginData = {};
		})
	};
})

.controller('DashCtrl', function($scope, $state, $log, webq) {
	webq.getUserProfile().then(function(profile){
		$log.debug(profile);
	}, function(err){
		// maybe token is revoked or has no network
		// TODO add a utility for get network status
		if(true){
			// has no network
		}else{
			// token is revoked, force the user login again
			$state.go('login.form');
		}
		$log.error(err);
	})
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
