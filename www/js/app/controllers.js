angular.module('mobay.controllers', [])

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

