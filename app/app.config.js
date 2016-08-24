(function() {
    'use strict';
    var app = angular.module('youproductiveApp');

    app.config(config);
    config.$inject = ['$httpProvider', '$stateProvider', '$urlRouterProvider', '$authProvider', '$sceDelegateProvider', 'toastrConfig'];

    function config($httpProvider, $stateProvider, $urlRouterProvider, $authProvider, $sceDelegateProvider, toastrConfig) {

        $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
        $sceDelegateProvider.resourceUrlWhitelist(['**']);
        $httpProvider.interceptors.push('AuthInterceptor');

        angular.extend(toastrConfig, {
            autoDismiss: false,
            containerId: 'toast-container',
            maxOpened: 0,
            newestOnTop: true,
            positionClass: 'toast-top-right',
            preventDuplicates: false,
            preventOpenDuplicates: false,
            target: 'body'
        });

        $authProvider.facebook({
            clientId: '1694074444209456',
            authorizationEndpoint: 'https://www.facebook.com/v2.5/dialog/oauth',
            redirectUri: window.location.origin + '/',
            requiredUrlParams: ['display', 'scope'],
            scope: ['email'],
            scopeDelimiter: ',',
            display: 'popup',
            type: '2.0',
            popupOptions: {
                width: 580,
                height: 400
            }
        });

        $authProvider.twitter({
            clientId: 'miIB7trTOArT2qcKg89ldf8hy',
            authorizationEndpoint: 'https://api.twitter.com/oauth/authenticate',
            redirectUri: window.location.origin,
            type: '1.0',
            popupOptions: {
                width: 495,
                height: 645
            }
        });

        $stateProvider
            .state('masterpage', {
                abstract: true,
                views: {
                    layout: {
                        templateUrl: 'app/components/layouts/masterpage.view.html',
                        controller: 'HomeController'
                    }
                }
            })
            .state('fullpage', {
                abstract: true,
                views: {
                    layout: {
                        templateUrl: 'app/components/layouts/fullpage.view.html',
                        controller: 'HomeController'
                    }
                }
            })
            .state('publicpage', {
                abstract: true,
                views: {
                    layout: {
                        templateUrl: 'app/components/layouts/publicpage.view.html',
                        controller: 'HomeController'
                    }
                }
            })
            .state('home', {
                url: '/',
                templateUrl: 'app/components/home/home.view.html',
                controller: 'HomeController',
                controllerAs: 'vm',
                parent: 'masterpage',
                data: {
                    authorization: true,
                    redirectTo: 'login',
                    appTitle: 'Overview'
                }
            })
            .state('task/:id', {
                url: '/task/:id',
                templateUrl: 'app/components/tasks/task/task.view.html',
                controller: 'TaskController',
                controllerAs: 'vm',
                parent: 'masterpage',
                data: {
                    authorization: true,
                    redirectTo: 'login',
                    appTitle: 'Task'
                }
            })
            .state('tasks', {
                url: '/tasks',
                templateUrl: 'app/components/tasks/tasks.view.html',
                controller: 'TasksController',
                controllerAs: 'vm',
                parent: 'masterpage',
                data: {
                    authorization: true,
                    redirectTo: 'login',
                    appTitle: 'Tasks'
                }
            })
            .state('public', {
                url: '/public/:link',
                templateUrl: 'app/components/tasks/public/tasks.public.view.html',
                controller: 'PublicController',
                controllerAs: 'vm',
                parent: 'publicpage'
            })
            .state('projects', {
                url: '/projects',
                templateUrl: 'app/components/project/project.view.html',
                controller: 'ProjectsController',
                controllerAs: 'vm',
                parent: 'masterpage',
                data: {
                    authorization: true,
                    redirectTo: 'login',
                    appTitle: 'Projects'
                }
            })
            .state('folders', {
                url: '/folders',
                templateUrl: 'app/components/folder/folder.view.html',
                controller: 'FoldersController',
                controllerAs: 'vm',
                parent: 'masterpage',
                data: {
                    authorization: true,
                    redirectTo: 'login'
                }
            })
            .state('tags', {
                url: '/tags',
                templateUrl: 'app/components/tag/tag.view.html',
                controller: 'TagsController',
                controllerAs: 'vm',
                parent: 'masterpage',
                data: {
                    authorization: true,
                    redirectTo: 'login'
                }
            })
            .state('logs', {
                url: '/logs',
                templateUrl: 'app/components/log/log.view.html',
                controller: 'LogsController',
                controllerAs: 'vm',
                parent: 'masterpage',
                data: {
                    authorization: true,
                    redirectTo: 'login'
                }
            })
            .state('notifications', {
                url: '/notifications',
                templateUrl: 'app/components/notification/notification.view.html',
                controller: 'NotificationsController',
                controllerAs: 'vm',
                parent: 'masterpage',
                data: {
                    authorization: true,
                    redirectTo: 'login'
                }
            })
            .state('organizations', {
                url: '/organizations',
                templateUrl: 'app/components/organization/organization.view.html',
                controller: 'OrganizationsController',
                controllerAs: 'vm',
                parent: 'masterpage',
                data: {
                    authorization: true,
                    redirectTo: 'login'
                }
            })
            .state('register', {
                url: '/register',
                templateUrl: 'app/components/register/register.view.html',
                controller: 'RegisterController',
                controllerAs: 'vm',
                parent: 'fullpage'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'app/components/login/login.view.html',
                controller: 'LoginController',
                controllerAs: 'vm',
                parent: 'fullpage'
            })
            .state('logout', {
                url: '/logout',
                templateUrl: 'app/components/logout/logout.view.html',
                controller: 'LogoutController',
                controllerAs: 'vm',
                parent: 'fullpage',
                data: {
                    authorization: true,
                    redirectTo: 'login',
                    memory: true
                }
            })
            .state('userverify', {
                url: '/userverify/:evc',
                templateUrl: 'app/components/userverify/userverify.view.html',
                controller: 'UserVerifyController',
                controllerAs: 'vm',
                parent: 'fullpage'
            })
            .state('verifypassword', {
                url: '/verifypassword/:evc',
                templateUrl: 'app/components/verifypassword/verifypassword.view.html',
                controller: 'VerifyPasswordController',
                controllerAs: 'vm',
                parent: 'fullpage'
            })
            .state('setpassword', {
                url: '/setpassword',
                templateUrl: 'app/components/setpassword/setpassword.view.html',
                controller: 'SetPasswordController',
                controllerAs: 'vm',
                parent: 'fullpage'
            })
            .state('updateprofile', {
                url: '/updateprofile',
                templateUrl: 'app/components/updateprofile/updateprofile.view.html',
                controller: 'UpdateProfileController',
                controllerAs: 'vm',
                parent: 'masterpage',
                data: {
                    authorization: true,
                    redirectTo: 'login',
                    appTitle: 'Account'
                }
            })
            .state('editprofile', {
                url: '/editprofile',
                templateUrl: 'app/components/editprofile/editprofile.view.html',
                controller: 'UpdateProfileController',
                controllerAs: 'vm',
                parent: 'masterpage',
                data: {
                    authorization: true,
                    redirectTo: 'login',
                    appTitle: 'Account'
                }
            })
            .state('account', {
                url: '/account',
                templateUrl: 'app/components/account/account.view.html',
                controller: 'AccountOverviewController',
                controllerAs: 'vm',
                parent: 'masterpage',
                data: {
                    authorization: true,
                    redirectTo: 'login',
                    appTitle: 'Account'
                }
            })
            .state('init', {
                url: '/init',
                templateUrl: 'app/components/init/init.view.html',
                controller: 'InitController',
                controllerAs: 'vm',
                parent: 'fullpage'
            });

        $urlRouterProvider.otherwise('/init');
    }

    app.run(run);
    run.$inject = ['SQliteDB', '$window', '$rootScope', '$state', 'AuthorizationService', 'UsersOfflineService', '$cookieStore', '$http', '$location', 'UserService', 'TokenService', 'jwtHelper', '$localStorage', '$q', 'FlashService', '$timeout','$interval'];

    function run(SQliteDB, $window, $rootScope, $state, AuthorizationService, UsersOfflineService, $cookieStore, $http, $location, UserService, TokenService, jwtHelper, $localStorage, $q, FlashService, $timeout,$interval) {
        $rootScope.globals = {};
        $rootScope.globals.currentUser = {};
        $rootScope.tasksMenuOpen = true;
        $rootScope.splashLoading = true;

        $rootScope.state = $state;


        $window.addEventListener("offline", function() {
            $rootScope.$apply(function() {
                $rootScope.globals.online = false;
                FlashService.barSlideTop('Network State: OFFLINE', 'notice');

                if (typeof module === "object" && typeof module.exports === "object") {
                    require('electron').ipcRenderer.on('offline-status');
                }
            });
        }, false);

        $window.addEventListener("online", function() {
            $rootScope.$apply(function() {
                $rootScope.globals.online = true;
                FlashService.barSlideTop('Network State: ONLINE', 'notice');

                if (typeof module === "object" && typeof module.exports === "object") {
                    require('electron').ipcRenderer.on('online-status');
                }
            });
        }, false);


        if (typeof module === "object" && typeof module.exports === "object") {
            const ipcRenderer = require('electron').ipcRenderer;

            ipcRenderer.on('tasks', function(event) {
                $state.go('tasks');
            });

            ipcRenderer.on('projects', function(event) {
                $state.go('projects');
            });

            ipcRenderer.on('accounts', function(event) {
                $state.go('account');
            });

            ipcRenderer.on('logout', function(event) {
                $rootScope.logout();
            });

            ipcRenderer.on('tray-app-logout', function(event, arg) {
                $rootScope.$emit("app-logout");
            });

            ipcRenderer.on('get-app-session', function(event, arg) {
                var user_data = {};

                if (!_.isUndefined(UserService.getCurrentUser())) {
                    user_data = JSON.parse(UserService.getCurrentUser());
                }

                ipcRenderer.send('set-tray-session', {
                    isSkipApp: TokenService.isAuthSkip(),
                    user_data: user_data,
                    userToken: TokenService.getToken()
                });
            });

            ipcRenderer.on('tray-refresh-task', function(event, arg) {
                $rootScope.$emit("reload");
            });

            ipcRenderer.on('tray-open-app', function(event, arg) {
                if (arg === 'app.tasks') {
                    $state.go('tasks', null, {
                        reload: true
                    });
                } else if (arg === 'app.projects') {
                    $state.go('projects', null, {
                        reload: true
                    });
                } else if (arg === 'app.profile') {
                    $state.go('editprofile', null, {
                        reload: true
                    });
                }
            });
        }

        // === INITIALIZE LOCAL DB === //
        SQliteDB.init();

        if (_.isUndefined($localStorage.skipApp) && _.isEmpty($localStorage.skipApp)) {
            TokenService.unsetSkipApp();
        }


        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            console.log('====================================: ');
            console.log('$stateChangeStart fromState: ' + fromState.name + ' toState: ', toState.name);
            console.log('====================================: ');

            $rootScope.globals.online = navigator.onLine;
            $rootScope.isSkipApp = TokenService.isAuthSkip();
            $rootScope.checkAuthorization = TokenService.isAuthenticated();
            $rootScope.localUser = UserService.getCurrentUser();

            if (!_.isUndefined($rootScope.localUser)) {
                $rootScope.globals.currentUser = JSON.parse($rootScope.localUser);
            } else {
                $rootScope.globals.currentUser = {};
            }

            // if ($rootScope.splashLoading && toState.name !== 'init') {
            //     console.log('event.preventDefault(); ');
            //     // event.preventDefault();
            // }

        });

        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            console.log('====================================: ');
            console.log('$stateChangeSuccess fromState: ' + fromState.name + ' toState: ', toState.name);
            console.log('====================================: ');
            /*console.log('$rootScope.isSkipApp: ', $rootScope.isSkipApp);
            console.log('$rootScope.checkAuthorization: ', $rootScope.checkAuthorization);
            console.log('$rootScope.localUser: ', $rootScope.localUser);*/

            $rootScope.showLeftColumn = 0;

            /*if (toState.name === 'tasks') {
                $interval(function() {
                    console.log('$rootScope.$emit("reload");');
                    $rootScope.$emit("reload");
                }, 10000);
            }*/

            //if (!AuthorizationService.authorized) {

            if (!$rootScope.isSkipApp && !$rootScope.checkAuthorization && ($rootScope.localUser !== 'null')) {
                console.log('1: ', toState.name);

                if (AuthorizationService.memorizedState && (!fromState.data || !fromState.data.redirectTo || toState.name !== fromState.data.redirectTo)) {
                    AuthorizationService.clear();
                }

                if (toState.data && toState.data.authorization && toState.data.redirectTo) {
                    if (toState.data.memory) {
                        AuthorizationService.memorizedState = toState.name;
                    }
                    console.log('toState.data.redirectTo: ', toState.data.redirectTo);
                    $state.go(toState.data.redirectTo);
                }

            } else if ($rootScope.isSkipApp && !$rootScope.checkAuthorization && ($rootScope.localUser !== 'null')) {

                $rootScope.navigationBlock = null;
                $rootScope.navigationBlock = 'app/components/core/navigation/login.view.html';
                $rootScope.showLeftColumn = 1;

                //left column
                $rootScope.leftColumnBlock = null;
                $rootScope.leftColumnBlock = 'app/components/core/leftcolumn/leftcolumn.view.html';

                //header and footer
                $rootScope.headerBlock = null;
                $rootScope.headerBlock = 'app/components/core/header/header.view.html';
                $rootScope.footerBlock = null;
                $rootScope.footerBlock = 'app/components/core/footer/footer.view.html';

                console.log('2: ', toState.name)
                    /*if (toState.name !== 'tasks') {
                        $state.go('tasks', null, {
                            reload: true
                        });
                    }*/
            } else if (!$rootScope.isSkipApp && !$rootScope.checkAuthorization && ($rootScope.localUser == 'null')) {
                console.log('3: ', toState.name);

                $rootScope.navigationBlock = null;
                $rootScope.navigationBlock = 'app/components/core/navigation/logout.view.html';
                $rootScope.showLeftColumn = 0;

                $rootScope.headerBlock = null;
                $rootScope.footerBlock = null;


                /*if (toState.name !== 'init') {
                    console.log("$state.go('init', null, { reload: true });");
                    $state.go('init', null, { reload: true });
                }*/
            } else {
                console.log('elseeeee: ', toState.name);

                $rootScope.navigationBlock = null;
                $rootScope.navigationBlock = 'app/components/core/navigation/login.view.html';
                $rootScope.showLeftColumn = 1;

                //left column
                $rootScope.leftColumnBlock = null;
                $rootScope.leftColumnBlock = 'app/components/core/leftcolumn/leftcolumn.view.html';

                //header and footer
                $rootScope.headerBlock = null;
                $rootScope.headerBlock = 'app/components/core/header/header.view.html';
                $rootScope.headerPublicBlock = null;
                $rootScope.headerPublicBlock = 'app/components/core/header/public/header.public.view.html';
                $rootScope.footerBlock = null;
                $rootScope.footerBlock = 'app/components/core/footer/footer.view.html';


                if (toState.name == 'init' || toState.name == 'login') {

                    if (typeof module === "object" && typeof module.exports === "object") {
                        require('electron').ipcRenderer.send('login');
                        require('electron').ipcRenderer.send('tray-show');
                    }

                    $state.go('tasks', null, {
                        reload: true
                    });
                }

                if (toState.name != 'init' || toState.name != 'login') {
                    var token = TokenService.getToken();
                    if (jwtHelper.isTokenExpired(token)) {
                        event.preventDefault();

                        TokenService.removeToken();
                        UserService.setCurrentUser(null);

                        $location.path('/login');

                        if (typeof module === "object" && typeof module.exports === "object") {
                            console.log('asdasdasd logout');
                            require('electron').ipcRenderer.send('logout');
                        }

                        $q.defer().resolve();
                    }
                }
            }

            $rootScope.isActive = function(viewLocation) {
                var active = (viewLocation === $location.path());
                return active;
            };
        });
    }

})();
