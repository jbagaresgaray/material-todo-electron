(function() {
    'use strict';

    angular.module('youproductiveApp')
        .controller('projectsCtrl', projectsCtrl);

    projectsCtrl.$inject = ['$scope', '$timeout'];

    function projectsCtrl($scope, $timeout) {
        $scope.doRefresh = function() {
            $timeout(function() {
                $scope.$broadcast('scroll.refreshComplete');
            }, 2000);
        };
    }
})();
