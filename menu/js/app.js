(function() {
    'use strict';

    angular.module('youproductiveApp', ['ionic', 'restangular', 'ngResource', 'satellizer', 'ngCookies', 'ngStorage', 'ionic-toast',
            'angular-jwt'
        ])
        .run(run)
        .config(config)
        .constant('CONFIG', {
            DebugMode: true,
            APIHost: 'http://api.youprodev.com/v1/',
            Local: 'http://localhost:8080/#/public/',
            Staging: 'http://youprodev.com/#/public/'
        })
        .constant('_', window._)
        .value('dt', {
            options: {
                priority: [
                    { name: 'High', theme: 'priority-high' },
                    { name: 'Normal', theme: 'priority-normal' },
                    { name: 'Low', theme: 'priority-low' }
                ]
            },
            task: [
                { name: 'Inbox', proper: 'inbox', active: true, icon: 'ion-folder' },
                { name: 'Starred', proper: 'starred', active: false, icon: 'ion-star' },
                { name: 'Priorities', proper: 'priorities', active: false, icon: 'ion-ios-information-outline' },
                { name: 'Due Date', proper: 'duedate', active: false, icon: 'ion-android-calendar' },
                { name: 'Recently Added', proper: 'recentlyadded', active: false, icon: 'ion-calendar' },
                { name: 'Completed', proper: 'completed', active: false, icon: 'ion-checkmark' }
            ],
            repeat: [
                'No repeat',
                'Every day',
                'Every week',
                'Every 2 weeks',
                'Every month',
                'Every 2 months',
                'Every 3 months',
                'Every 6 months',
                'Every year'
            ],
            repeat_from: [
                'Completion date',
                'Due date',
                'No repeat'
            ]
        });

    run.$inject = ['$ionicPlatform', 'UserService', 'TokenService', '$rootScope', '$state'];

    function run($ionicPlatform, UserService, TokenService, $rootScope, $state) {
        $ionicPlatform.ready(function() {
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });

        if (typeof module === "object" && typeof module.exports === "object") {
            require('electron').ipcRenderer.on('save-trey-sesson', function(event, arg) {
                console.log('save-trey-sesson: ', arg)
                UserService.setCurrentUser(arg.user_data);
                TokenService.setToken(arg.userToken);
                if (arg.isSkipApp) {
                    TokenService.setSkipApp();
                } else {
                    TokenService.unsetSkipApp();
                }
            });
        }

        $rootScope.$state = $state;
    }

    config.$inject = ['$stateProvider', '$urlRouterProvider', '$httpProvider'];

    function config($stateProvider, $urlRouterProvider, $httpProvider) {

        $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
        $httpProvider.interceptors.push('AuthInterceptor');

        $stateProvider
            // .state('main', {
            //     url: '/main',
            //     templateUrl: 'menu/templates/main.html',
            //     controller: 'mainCtrl'
            // })
            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'menu/templates/menu.html',
                'controller': 'appCtrl'
            })
            .state('app.tasks', {
                url: '/tasks',
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: 'menu/templates/tasks/tasks.html',
                        controller: 'tasksCtrl'
                    }
                }
            })
            .state('app.projects', {
                url: '/projects',
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: 'menu/templates/projects/projects.html',
                        controller: 'projectsCtrl'
                    }
                }
            })
            .state('app.profile', {
                url: '/profile',
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: 'menu/templates/profile.html',
                        controller: 'profileCtrl'
                    }
                }
            });
        $urlRouterProvider.otherwise('/app/tasks');
    }

})();
