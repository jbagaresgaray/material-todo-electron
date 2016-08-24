(function() {
    'use strict';

    angular.module('youproductiveApp')
        .controller('appCtrl', appCtrl);

    appCtrl.$inject = ['$scope', '$state', '$ionicPopover', '$ionicViewSwitcher', '$ionicHistory', 'TokenService', 'UserService', '$timeout'];

    function appCtrl($scope, $state, $ionicPopover, $ionicViewSwitcher, $ionicHistory, TokenService, UserService, $timeout) {


        $scope.openPopover = function($event) {
            $ionicPopover.fromTemplateUrl('menu/templates/popover.html', {
                scope: $scope
            }).then(function(popover) {
                $scope.popover = popover;
                $scope.popover.show($event);
            });
        };

        $scope.openPopoverSettings = function($event) {
            $ionicPopover.fromTemplateUrl('menu/templates/popover.settings.html', {
                scope: $scope
            }).then(function(popover) {
                $scope.popoversettings = popover;
                $scope.popoversettings.show($event);
            });
        };

        $scope.gotoProjects = function() {
            $scope.popoversettings.hide();

            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $ionicViewSwitcher.nextDirection('forward');
            $state.go('app.projects');
        };

        $scope.gotoTasks = function() {
            $scope.popoversettings.hide();

            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $ionicViewSwitcher.nextDirection('back');
            $state.go('app.tasks');
        };

        $scope.gotoProfile = function() {
            $scope.popover.hide();

            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $ionicViewSwitcher.nextDirection('forward');
            $state.go('app.profile');
        };

        $scope.logout = function() {
            console.log('logout');
            $scope.popover.hide();

            TokenService.removeToken();
            UserService.setCurrentUser(null);

            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('logout');
                require('electron').ipcRenderer.send('tray-logout');
            }
        };

        $scope.quitApp = function(){
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('tray-quit-app');
            }
        };

        $scope.openApp = function(state) {
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('tray-open-app',state.current.name);
            }
        };

        $scope.$on('$destroy', function() {
            $scope.popover.remove();
            scope.popoversettings.remove();
        });
    }

})();
