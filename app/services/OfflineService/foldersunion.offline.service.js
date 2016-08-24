(function() {
    'use strict';

    angular
        .module('youproductiveApp')
        .factory('FoldersUnionOfflineService', FoldersUnionOfflineService);

    FoldersUnionOfflineService.$inject = ['_', '$q', '$rootScope', 'SQliteDB', 'TokenService', '$filter'];

    function FoldersUnionOfflineService(_, $q, $rootScope, SQliteDB, TokenService, $filter) {
        var _broadcastType = null;

        var service = {};

        // Restangular methods
        service.list = _list;
        service.foldersByUser = foldersByUser;
        service.create = _create;
        service.delete = _delete;

        return service;


        function _list(department, aid) {
            return SQliteDB.query('SELECT fu.id,f.name FROM folders_union fu ' + 
                'INNER JOIN folders f ON fu.folder_id = f.id WHERE fu.associated_id=? AND fu.department=?;', [
                aid, department
            ]).then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);
        }

        function foldersByUser() {
            var uid = $rootScope.globals.currentUser.user_id;
            return SQliteDB.query('SELECT * FROM folders_union fu LEFT JOIN folders f ON fu.folder_id = f.id WHERE fu.user_id=?;', [
                uid
            ]).then(function(result) {
                return SQliteDB.fetchAll(result);
            });
        }

        
        function _create(data) {
            data.folder_id = data.folder_id || '';
            data.associated_id = data.associated_id || '';
            data.department = data.department || '';
            data.user_id = data.user_id || $rootScope.globals.currentUser.user_id;
            data.created_at = data.created_at || $filter('date')(Date.now(), "dd MMM yy");
            data.updated_at = data.updated_at || data.created_at;
            
            return SQliteDB.query('INSERT INTO folders_union(folder_id,associated_id,department,user_id,created_at,updated_at) VALUES (?,?,?,?,?,?)', [
                    data.folder_id, data.associated_id, data.department, data.user_id,
                    data.created_at, data.updated_at
                ]);
        }



        function _delete(id) {
            return SQliteDB.query('DELETE FROM folders_union WHERE folder_id=?', [id], function(result) {
                return result.rowsAffected;
            }, errorHandler);
        }

        function errorHandler(error) {
            console.log(error);
            // console.log(angular.toJson(error));
            $rootScope.$broadcast('foldersunion.error', error);
        }
    }
})();
