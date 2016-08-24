(function() {
    'use strict';

    angular.module('youproductiveApp')
        .constant('CONFIG', {
            DebugMode: true,
            APIHost: 'http://api.youprodev.com/v1/',
            Local: 'http://localhost:8080/#/public/',
            Staging: 'http://youprodev.com/#/public/'
        })
        .constant('_', window._);
})();
