(function() {
  'use strict';

  angular
    .module('youproductiveApp')
    .factory('CommentsOfflineService', CommentsOfflineService);

  CommentsOfflineService.$inject = ['$q', '$rootScope', 'SQliteDB', 'TokenService'];

  function CommentsOfflineService($q, $rootScope, SQliteDB, TokenService) {
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

    function StringToBoolean(str) {
      return (str === 'true') ? true : false;
    }

    function _list() {
      return SQliteDB.query('SELECT * FROM comments;').then(function(result) {
        return SQliteDB.fetchAll(result);
      }, errorHandler);
    }

    function _getByType(type,id) {
      var taskSQL;
      switch (type) {
        case 'tasks':
          taskSQL = 'SELECT * FROM comments WHERE task_id=\'' + id + '\' AND type=\'tasks\' AND created_at=updated_at;';
          break;
        default:
          taskSQL = 'SELECT * FROM comments;';
          break;
      }
      return SQliteDB.query(taskSQL).then(function(result) {
        return SQliteDB.fetchAll(result);
      }, errorHandler);
    }


    function _get(id) {
      $rootScope.$broadcast('comments.get');
      return SQliteDB.query('SELECT * FROM comments WHERE id =?;', [id]).then(function(result) {
        return SQliteDB.fetchAll(result);
      }, errorHandler);
    }


    function _create(data) {
      data.comment = data.comment || '';
      data.parent_comment_id = data.parent_comment_id || '';
      data.status = data.status || null;
      data.type = data.type || 'tasks';
      data.project_id = data.project_id || null;
      data.user_id = data.user_id || $rootScope.globals.currentUser.user_id;
      data.task_id = data.task_id || false;
      data.organization_id = data.organization_id || null;
      data.created_at = data.created_at || $filter('date')(Date.now(), "dd MMM yy");
      data.updated_at = data.updated_at || data.created_at;

      _broadcastType = 'comments.create';
      return SQliteDB.query('INSERT INTO comments(comment,parent_comment_id,status,type,project_id,user_id,task_id,organization_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)', [
          data.comment, data.parent_comment_id, data.status, data.type,
          data.project_id, data.user_id, data.task_id, data.organization_id,
          data.created_at, data.updated_at
        ])
        .then(successHandler, errorHandler);
    }



    function _update(data) {
      data.comment = data.comment || '';
      data.parent_comment_id = data.parent_comment_id || '';
      data.status = data.status || null;
      data.type = data.type || 'tasks';
      data.project_id = data.project_id || null;
      data.user_id = data.user_id || $rootScope.globals.currentUser.user_id;
      data.task_id = data.task_id || false;
      data.organization_id = data.organization_id || null;
      data.created_at = data.created_at || $filter('date')(Date.now(), "dd MMM yy");
      data.updated_at = data.updated_at || data.created_at;

      _broadcastType = 'comments.update';
      return SQliteDB.query('UPDATE comments SET comment=?,parent_comment_id=?,status=?,type=?,project_id=?,user_id=?,task_id=?,organization_id=?,updated_at=? WHERE id=?', [
          data.comment, data.parent_comment_id, data.status, data.type,
          data.project_id, data.user_id, data.task_id, data.organization_id,
          data.updated_at, data.id
        ])
        .then(successHandler, errorHandler);
    }


    function _delete(id) {
      _broadcastType = 'comments.delete';
      return SQliteDB.query('DELETE FROM comments WHERE id=?', [id], function(result) {
        return result.rowsAffected;
      }, errorHandler);
    }


    function successHandler(response) {
      var data = {};
      if (_broadcastType == 'comments.create') {
        data.message = 'Successfully created.';
      } else if (_broadcastType == 'comments.update' || _broadcastType == 'comments.delete') {
        data.message = 'success';
      }
      $rootScope.$broadcast(_broadcastType, data);
    }

    function errorHandler(error) {
      console.log(error);
      // console.log(angular.toJson(error));
      $rootScope.$broadcast('comments.error', error);
    }
  }
})();
