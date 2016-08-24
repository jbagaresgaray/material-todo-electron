(function() {
    'use strict';

    angular
        .module('youproductiveApp')
        .factory('NotesOfflineService', NotesOfflineService);

    NotesOfflineService.$inject = ['$q', '$rootScope', 'SQliteDB', 'TokenService', '$filter'];

    function NotesOfflineService($q, $rootScope, SQliteDB, TokenService, $filter) {
        var _broadcastType = null;

        var service = {};

        // Restangular methods
        service.list = _list;
        service.get = _get;
        service.create = _create;
        service.update = _update;
        service.delete = _delete;
        service.getByType = _getByType;

        return service;


        function _list() {
            return SQliteDB.query('SELECT * FROM notes;').then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);
        }

        function _getByType(department, aid) {
            var taskSQL;
            switch (department) {
                case 'tasks':
                    taskSQL = 'SELECT * FROM notes WHERE type=\'tasks\' AND associated_id=\'' + aid + '\';';
                    break;

                default:
                    break;
            }
            return SQliteDB.query(taskSQL).then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);
        }


        function _get(id) {
            $rootScope.$broadcast('notes.get');
            return SQliteDB.query('SELECT * FROM notes WHERE id =? LIMIT 1;', [id]).then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);
        }


        function _create(data) {
            data.note = data.note || '';
            data.type = data.type || '';
            data.associated_id = data.associated_id || '';
            data.user_id = data.user_id || $rootScope.globals.currentUser.user_id;
            data.created_at = data.created_at || $filter('date')(Date.now(), "dd MMM yy");
            data.updated_at = data.updated_at || data.created_at;

            _broadcastType = 'notes.create';
            return SQliteDB.query('INSERT INTO notes(note,type,associated_id,user_id,created_at,updated_at) VALUES (?,?,?,?,?,?)', [
                    data.note, data.type, data.associated_id, data.user_id,
                    data.created_at, data.updated_at
                ]);
        }


        function _update(data) {
            data.note = data.note || '';
            data.type = data.type || '';
            data.associated_id = data.associated_id || '';
            data.user_id = data.user_id || $rootScope.globals.currentUser.user_id;
            data.updated_at = data.updated_at || $filter('date')(Date.now(), "dd MMM yy");

            _broadcastType = 'notes.update';
            return SQliteDB.query('UPDATE notes SET note=?,type=?,associated_id=?,user_id=?,updated_at=? WHERE id=?', [
                data.note, data.type, data.associated_id, data.user_id,
                data.updated_at, data.id
            ]).then(function(resp) {
                return { data: resp.insertId }
            }, errorHandler);
        }


        function _delete(id) {
            _broadcastType = 'notes.delete';
            return SQliteDB.query('DELETE FROM notes WHERE id=?', [id], function(result) {
                return result.rowsAffected;
            }, errorHandler);
        }


        function successHandler(response) {
            var data;
            if (_broadcastType == 'notes.create') {
                data = response.insertId;
            } else if (_broadcastType == 'notes.update' || _broadcastType == 'notes.delete') {
                data = 'success';
            }
            $rootScope.$broadcast(_broadcastType, data);
        }

        function errorHandler(error) {
            console.log(error);
            // console.log(angular.toJson(error));
            $rootScope.$broadcast('notes.error', error);
        }
    }
})();
