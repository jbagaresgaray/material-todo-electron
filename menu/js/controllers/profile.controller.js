(function() {
    'use strict';

    angular.module('youproductiveApp')
        .controller('profileCtrl', profileCtrl);

    profileCtrl.$inject = ['$scope', '$rootScope', '$timeout', 'UserService'];

    function profileCtrl($scope, $rootScope, $timeout, UserService) {
        $scope.user = {};
        $scope.doRefresh = function() {
            $timeout(function() {
                $scope.$broadcast('scroll.refreshComplete');
            }, 2000);
        };

        $scope.getuserprofile = function() {
            $scope.dataLoading = true;

            UserService.GetAll()
                .then(function(response) {
                    if (response.user_details && response.user_details.length > 0) {
                        $scope.user = response.user_details[0];
                        $scope.user.user_photo_file_id = $scope.user.id;
                        $scope.user.country = '';
                        $scope.user.timezone = '';

                        console.log('vm.user1: ', $scope.user);
                        UserService.setCurrentUser($scope.user);

                        $scope.dataLoading = false;
                    }
                });
        }
    }
})();
