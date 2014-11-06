/*
 * Licensed Materials - Property of Hai Liang Wang
 * All Rights Reserved.
 */
define(['ionic'], function() {

angular.module('mobay.controllers', [])

.controller('LoginCtrl', function($scope) {
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


});

