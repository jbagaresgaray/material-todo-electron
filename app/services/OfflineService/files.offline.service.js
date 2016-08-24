(function() {
    'use strict';

    angular
        .module('youproductiveApp')
        .factory('FilesOfflineService', FilesOfflineService);

    FilesOfflineService.$inject = ['$q', '$rootScope', 'SQliteDB', 'TokenService', '$filter'];

    function FilesOfflineService($q, $rootScope, SQliteDB, TokenService, $filter) {
        var _broadcastType = null;

        var service = {};

        // Restangular methods
        service.list = _list;
        service.get = _get;
        service.create = _create;
        service.update = _update;
        service.updateuserphoto = _updateuserphoto;
        service.delete = _delete;
        service.getByType = _getByType;

        return service;


        function _list() {
            return SQliteDB.query('SELECT * FROM files;').then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);
        }

        function _getByType(department, aid) {
            console.info('department: ', department);
            console.info('aid: ', aid);
            var taskSQL;
            switch (department) {
                case 'user_photo':
                    taskSQL = 'SELECT * FROM files WHERE type=\'' + department + '\' AND user_id=\'' + aid + '\';';
                    break;
                case 'tasks':
                    taskSQL = 'SELECT ft.*,fu.s3_file_uri as s3_file_uri_user_photo FROM files AS ft LEFT JOIN files AS fu ON fu.user_id = ft.user_id AND fu.type=\'user_photo\' WHERE (ft.type=\'' + department + '\' AND ft.task_id=\'' + aid + '\');';
                    break;
                default:
                    break;
            }
            console.info('taskSQL: ', taskSQL);
            return SQliteDB.query(taskSQL).then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);
        }


        function _get(id) {
            $rootScope.$broadcast('files.get');
            return SQliteDB.query('SELECT * FROM files WHERE id =? LIMIT 1;', [id]).then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);
        }


        function _create(data) {
            data.file_name = data.file_name || '';
            data.hash = data.hash || '';
            data.mime = data.mime || '';
            data.type = data.type || '';
            data.s3_file_uri = data.s3_file_uri || '';
            data.project_id = data.project_id || '';
            data.organization_id = data.organization_id || '';
            data.task_id = data.task_id || '';
            data.comment_id = data.comment_id || '';
            data.user_id = data.user_id || $rootScope.globals.currentUser.user_id;
            data.created_at = data.created_at || $filter('date')(Date.now(), "d MMM h:mm a");
            data.updated_at = data.updated_at || data.created_at;

            _broadcastType = 'files.create';
            return SQliteDB.query('INSERT INTO files(file_name,hash,mime,type,s3_file_uri,project_id,organization_id,task_id,comment_id,user_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', [
                    data.file_name, data.hash, data.mime, data.type, data.s3_file_uri, data.project_id, data.organization_id, data.task_id, data.comment_id,
                    data.user_id, data.created_at, data.updated_at
                ])
                .then(successHandler, errorHandler);
        }


        function _update(data) {
            data.file_name = data.file_name || '';
            data.hash = data.hash || '';
            data.mime = data.mime || '';
            data.type = data.type || '';
            data.s3_file_uri = data.s3_file_uri || '';
            data.project_id = data.project_id || '';
            data.organization_id = data.organization_id || '';
            data.task_id = data.task_id || '';
            data.comment_id = data.comment_id || '';
            data.user_id = data.user_id || $rootScope.globals.currentUser.user_id;
            data.updated_at = data.updated_at || $filter('date')(Date.now(), "d MMM h:mm a");

            _broadcastType = 'files.update';
            return SQliteDB.query('UPDATE files SET file_name=?,hash=?,mime=?,type=?,s3_file_uri=?,project_id=?,organization_id=?,task_id=?,comment_id=?,user_id=?,updated_at=? WHERE id=?', [
                    data.file_name, data.hash, data.mime, data.type, data.s3_file_uri, data.project_id, data.organization_id, data.task_id, data.comment_id,
                    data.user_id, data.updated_at, data.id
                ])
                .then(successHandler, errorHandler);
        }

        function _updateuserphoto(data) {
            data.file_name = data.file_name || '';
            data.hash = data.hash || '';
            data.mime = data.mime || '';
            data.type = data.type || '';
            data.s3_file_uri = data.s3_file_uri || '';
            data.project_id = data.project_id || '';
            data.organization_id = data.organization_id || '';
            data.task_id = data.task_id || '';
            data.comment_id = data.comment_id || '';
            data.user_id = data.user_id || $rootScope.globals.currentUser.user_id;
            data.updated_at = data.updated_at || $filter('date')(Date.now(), "d MMM h:mm a");

            _broadcastType = 'files.update';
            return SQliteDB.query('UPDATE files SET file_name=?,hash=?,mime=?,s3_file_uri=?,project_id=?,organization_id=?,task_id=?,comment_id=?,,updated_at=? WHERE user_id=? AND type=\'user_photo\';', [
                    data.file_name, data.hash, data.mime, data.type, data.s3_file_uri, data.project_id, data.organization_id, data.task_id, data.comment_id,
                    data.updated_at, data.user_id
                ])
                .then(successHandler, errorHandler);
        }


        function _delete(id) {
            _broadcastType = 'files.delete';
            return SQliteDB.query('DELETE FROM files WHERE id=?', [id], function(result) {
                return result.rowsAffected;
            }, errorHandler);
        }


        function successHandler(response) {
            var data;
            if (_broadcastType == 'files.create') {
                data = response.insertId;
            } else if (_broadcastType == 'files.update' || _broadcastType == 'files.delete') {
                data = 'success';
            }
            $rootScope.$broadcast(_broadcastType, data);
        }

        function errorHandler(error) {
            console.log(error);
            // console.log(angular.toJson(error));
            $rootScope.$broadcast('files.error', error);
        }
    }
})();