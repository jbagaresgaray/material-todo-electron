(function() {
    'use strict';

    angular
        .module('youproductiveApp')
        .factory('FoldersOfflineService', FoldersOfflineService);

    FoldersOfflineService.$inject = ['_', '$q', '$rootScope', 'SQliteDB', 'TokenService', '$filter'];

    function FoldersOfflineService(_, $q, $rootScope, SQliteDB, TokenService, $filter) {
        var _broadcastType = null;

        var service = {};

        // Restangular methods
        service.list = _list;
        service.get = _get;
        service.create = _create;
        service.update = _update;
        service.delete = _delete;
        service.checkFolderNameIfExistIfNotCreated = _checkFolderNameIfExistIfNotCreated;

        return service;


        function _list() {
            return SQliteDB.query('SELECT * FROM folders;').then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);
        }

        function _checkFolderNameIfExistIfNotCreated(data) {
            return SQliteDB.query('SELECT * FROM folders WHERE name = ?;', [data.name]).then(function(result) {
                if (result.rows.length === 0) {
                    var created_at = $filter('date')(Date.now(), "d MMM h:mm a");
                    return SQliteDB.query('INSERT INTO folders (name,description,organize,parent_folder_id,user_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?);', [
                        _.lowerCase(data.name), '', '', '', data.user_id, created_at, created_at
                    ]).then(function(result1) {
                        return {
                            data: result1.insertId
                        }
                    });
                } else {
                    return {
                        data: result.rows[0].id
                    };
                }
            }, errorHandler);
        }

        
        function _get(id) {
            $rootScope.$broadcast('folders.get');
            return SQliteDB.query('SELECT * FROM folders WHERE id =? LIMIT 1;', [id]).then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);
        }

        
        function _create(data) {
            data.name = data.name || '';
            data.description = data.description || '';
            data.organize = data.organize || '';
            data.parent_folder_id = data.parent_folder_id || '';
            data.user_id = data.user_id || $rootScope.globals.currentUser.user_id;
            data.created_at = data.created_at || $filter('date')(Date.now(), "dd MMM yy");
            data.updated_at = data.updated_at || data.created_at;

            _broadcastType = 'folders.create';
            return SQliteDB.query('INSERT INTO folders(name,description,organize,parent_folder_id,user_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?)', [
                    data.name, data.description, data.organize, data.parent_folder_id, data.user_id,
                    data.created_at, data.updated_at
                ])
                .then(successHandler, errorHandler);
        }


        function _update(data) {
            data.name = data.name || '';
            data.description = data.description || '';
            data.organize = data.organize || '';
            data.parent_folder_id = data.parent_folder_id || '';
            data.user_id = data.user_id || $rootScope.globals.currentUser.user_id;
            data.updated_at = data.updated_at || $filter('date')(Date.now(), "dd MMM yy");

            _broadcastType = 'folders.update';
            return SQliteDB.query('UPDATE folders SET name=?,description=?,organize=?, parent_folder_id=?,user_id=?,updated_at=? WHERE id=?', [
                    data.name, data.description, data.organize, data.parent_folder_id, data.user_id,
                    data.updated_at, data.id
                ])
                .then(successHandler, errorHandler);
        }


        function _delete(id) {
            _broadcastType = 'folders.delete';
            return SQliteDB.query('DELETE FROM folders WHERE id=?', [id], function(result) {
                return result.rowsAffected;
            }, errorHandler);
        }


        function successHandler(response) {
            var data;
            if (_broadcastType == 'folders.create') {
                data = response.insertId;
            } else if (_broadcastType == 'folders.update' || _broadcastType == 'folders.delete') {
                data = 'success';
            }
            $rootScope.$broadcast(_broadcastType, data);
        }

        function errorHandler(error) {
            console.log(error);
            // console.log(angular.toJson(error));
            $rootScope.$broadcast('folders.error', error);
        }
    }
})();
