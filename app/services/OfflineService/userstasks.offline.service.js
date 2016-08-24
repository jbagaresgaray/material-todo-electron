(function() {
  'use strict';

  angular
    .module('youproductiveApp')
    .factory('UserstaksOfflineService', UserstaksOfflineService);

  UserstaksOfflineService.$inject = ['$q', '$rootScope', 'SQliteDB', 'TokenService','$filter'];

  function UserstaksOfflineService($q, $rootScope, SQliteDB, TokenService,$filter) {
    var _broadcastType = null;

    var service = {};

    // Restangular methods
    service.list = _list;
    service.get = _get;
    service.create = _create;
    service.update = _update;
    service.delete = _delete;

    return service;

    function _list(task_id) {
      return SQliteDB.query('SELECT ut.*,fu.*,u.username,u.last_name,u.first_name,u.email FROM users_tasks AS ut ' +
        'LEFT JOIN files AS fu ON fu.user_id = ut.assigned_user_id AND fu.type =\'use_photo\'' +
        'LEFT JOIN users AS u ON u.user_id = ut.assigned_user_id ' +
        'WHERE ut.task_id =?;',[task_id]).then(function(result) {
        return SQliteDB.fetchAll(result);
      }, errorHandler);
    }

    /**
     * @param id
     * @return the result of the query
     */
    function _get(id) {
      $rootScope.$broadcast('userstasks.get');
      return SQliteDB.query('SELECT * FROM comments WHERE id =?;', [id]).then(function(result) {
        return SQliteDB.fetchAll(result);
      }, errorHandler);
    }

    /**
     * @param assignee_user_id
     * @param assigned_user_id
     * @param task_id
     * @param created_at
     * @param updated_at
     * @return the lastInsertId
     */
    function _create(data) {
      data.assignee_user_id = data.assignee_user_id || '';
      data.assigned_user_id = data.assigned_user_id || '';
      data.task_id = data.task_id || null;
      data.created_at = data.created_at || $filter('date')(Date.now(), "dd MMM yy");
      data.updated_at = data.updated_at || data.created_at;

      _broadcastType = 'userstasks.create';
      return SQliteDB.query('INSERT INTO users_tasks(assignee_user_id,assigned_user_id,task_id,created_at,updated_at) VALUES (?,?,?,?,?)', [
          data.assignee_user_id, data.assigned_user_id, data.task_id,
          data.created_at, data.updated_at
        ])
        .then(successHandler, errorHandler);
    }


    /**
     * @param comment
     * @param parent_comment_id
     * @param status
     * @param type
     * @param project_id
     * @param user_id
     * @param task_id
     * @param organization_id
     * @param created_at
     * @param updated_at
     * @return the rowsAffected
     */
    function _update(data) {
      data.assignee_user_id = data.assignee_user_id || '';
      data.assigned_user_id = data.assigned_user_id || '';
      data.task_id = data.task_id || $filter('date')(Date.now(), "dd MMM yy");
      data.updated_at = data.updated_at || data.created_at;

      _broadcastType = 'userstasks.update';
      return SQliteDB.query('UPDATE users_tasks SET assignee_user_id=?,assigned_user_id=?,task_id=?,updated_at=? WHERE id=?', [
          data.assignee_user_id, data.assigned_user_id, data.task_id,
          data.updated_at, data.id
        ])
        .then(successHandler, errorHandler);
    }


    /**
     * @param id
     * @return the result of the query
     */
    function _delete(id) {
      _broadcastType = 'userstasks.delete';
      return SQliteDB.query('DELETE FROM users_tasks WHERE id=?', [id], function(result) {
        return result.rowsAffected;
      }, errorHandler);
    }


    function successHandler(response) {
      var data = {};
      if (_broadcastType == 'userstasks.create') {
        data.message = 'Successfully created.';
      } else if (_broadcastType == 'userstasks.update' || _broadcastType == 'userstasks.delete') {
        data.message = 'success';
      }
      $rootScope.$broadcast(_broadcastType, data);
    }

    function errorHandler(error) {
      console.log(error);
      // console.log(angular.toJson(error));
      $rootScope.$broadcast('userstasks.error', error);
    }
  }
})();
