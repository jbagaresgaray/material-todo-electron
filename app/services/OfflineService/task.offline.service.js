(function() {
    'use strict';

    angular
        .module('youproductiveApp')
        .factory('TasksOfflineService', TasksOfflineService);

    TasksOfflineService.$inject = ['$q', '$rootScope', 'SQliteDB', 'TokenService', '$filter'];

    function TasksOfflineService($q, $rootScope, SQliteDB, TokenService, $filter) {
        var _broadcastType = null;

        var service = {};
        var subtask = null;

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

        function getTaskData(task_id, uid) {
            //main task item
            var taskArr = [];
            var subtasksArr = [];
            var notesArr = [];
            var commentsArr = [];
            var filesArr = [];
            var userTasksArr = [];
            var tagsunionArr = [];
            var urlSlugArr = [];


            var task = SQliteDB.query('SELECT * FROM tasks WHERE id =?;', [task_id]).then(function(result) {
                return SQliteDB.fetchAll(result);
            });

            //subtasks
            var subTasks = SQliteDB.query('SELECT * FROM tasks WHERE user_id =? AND parent_task_id=?;', [uid, task_id]).then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);

            //notes
            var notes = SQliteDB.query('SELECT * FROM notes WHERE type=\'tasks\' AND associated_id=?;', [task_id]).then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);

            //comments
            var comments = SQliteDB.query('SELECT * FROM comments WHERE task_id=? AND type=\'tasks\' AND created_at=updated_at;', [task_id]).then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);

            //files
            var files = SQliteDB.query('SELECT ft.*,fu.s3_file_uri as s3_file_uri_user_photo FROM files AS ft LEFT JOIN files AS fu ON fu.user_id = ft.user_id AND fu.type=\'user_photo\'' +
                ' WHERE (ft.type=\'tasks\' AND ft.task_id=?);', [task_id]).then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);

            //assign user
            var userTasks = SQliteDB.query('SELECT ut.*,fu.*,u.username,u.last_name,u.first_name,u.email FROM users_tasks AS ut ' +
                'LEFT JOIN files AS fu ON fu.user_id = ut.assigned_user_id AND fu.type =\'use_photo\'' +
                'LEFT JOIN users AS u ON u.id = ut.assigned_user_id ' +
                'WHERE ut.task_id =?;', [task_id]).then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);

            //tags
            var tagsunion = SQliteDB.query('SELECT tu.id,t.name FROM tags_union AS tu INNER JOIN tags t ON tu.tag_id = t.id WHERE tu.department=\'tasks\' AND tu.associated_id =?;', [task_id]).then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);

            //share
            var urlSlug = SQliteDB.query('SELECT us.slug FROM url_shortener AS us WHERE us.type=\'tasks\' AND us.associated_id =?;', [task_id]).then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);

            return $q.all([task, subTasks, notes, comments, files, userTasks, tagsunion, urlSlug])
                .then(function(res) {
                    return {
                        'task': res[0][0],
                        'subtasks': res[1],
                        'notes': res[2],
                        'comments': res[3],
                        'files': res[4],
                        'assigned_users': res[5],
                        'tags': res[6],
                        'urlSlug': res[7]
                    };
                });
        }


        function _list() {
            var uid = $rootScope.globals.currentUser.user_id;
            var deferred = $q.defer();
            var arrayData = [];
            var promises = [];

            var userAssigned = SQliteDB.query('SELECT ut.task_id as tid FROM users_tasks AS ut WHERE ut.assigned_user_id=?;', [uid]).then(function(result) {
                return SQliteDB.fetchAll(result);
            });

            var tasks = SQliteDB.query('SELECT t.id as tid FROM tasks AS t WHERE t.user_id=? AND t.parent_task_id IS NULL;', [uid]).then(function(result) {
                return SQliteDB.fetchAll(result);
            });

            $q.all([userAssigned, tasks]).then(function(res) {
                var taskList = _.concat(res[1], res[0]);
                if (taskList.length > 0) {
                    angular.forEach(taskList, function(t) {
                        getTaskData(t.tid, uid).then(function(res) {
                            arrayData.push(res);
                            
                            if(arrayData.length === taskList.length){
                                deferred.resolve(arrayData);
                            }
                        });
                    });
                } else {
                    deferred.resolve(arrayData);
                }
            });
            return deferred.promise;

            /*return SQliteDB.query('SELECT * FROM tasks;').then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);*/
        }

        function _getByType(type, uid) {
            var taskSQL;
            switch (type) {
                case 'inbox':
                    taskSQL = 'SELECT * FROM tasks WHERE user_id = ? AND status=\'false\' AND created_at=updated_at;';
                    break;
                case 'starred':
                    taskSQL = 'SELECT * FROM tasks WHERE user_id = ? AND starred=\'true\' AND status=\'false\';';
                    break;
                case 'priorities':
                    taskSQL = 'SELECT * FROM tasks WHERE user_id = ? AND priority NOT IN (\'\', null) AND status=\'false\';';
                    break;
                case 'duedate':
                    taskSQL = 'SELECT * FROM tasks WHERE user_id = ? AND end_date IS NOT NULL AND status=\'false\';';
                    break;
                case 'recentlyadded':
                    taskSQL = 'SELECT * FROM tasks WHERE user_id = ? AND status = \'false\' AND created_at != updated_at ORDER BY updated_at DESC;';
                    break;
                case 'completed':
                    taskSQL = 'SELECT * FROM tasks WHERE user_id = ? AND status = \'true\';';
                    break;
                default:
                    taskSQL = 'SELECT * FROM tasks WHERE user_id = ?;';
                    break;
            }
            return SQliteDB.query(taskSQL, [uid]).then(function(result) {
                var output = [];
                for (var i = 0; i < result.rows.length; i++) {
                    var row = result.rows.item(i);
                    row.status = StringToBoolean(row.status);
                    row.starred = StringToBoolean(row.starred);
                    row.priority = StringToBoolean(row.priority);

                    output.push(row);
                }
                return output;
                // return SQliteDB.fetchAll(result);
            }, errorHandler);
        }

        function allCounterTasks(uid) {
            var tasksInbox = SQliteDB.query('SELECT * FROM tasks WHERE user_id = ? AND status=\'false\' AND created_at=updated_at;', [uid]).then(function(result) {
                return SQliteDB.recordCount();
            }, errorHandler);

            var tasksStarred = SQliteDB.query('SELECT * FROM tasks WHERE user_id = ? AND status=\'false\' AND starred=\'false\'', [uid]).then(function(result) {
                return SQliteDB.recordCount();
            }, errorHandler);

            var tasksPriorities = SQliteDB.query('SELECT * FROM tasks WHERE user_id = ? AND priority NOT IN (\'\', null) AND status=\'false\'').then(function(result) {
                return SQliteDB.recordCount();
            }, errorHandler);

            var tasksDueDate = SQliteDB.query('SELECT * FROM tasks WHERE user_id = ? AND status=\'false\' AND end_date IS NOT NULL;').then(function(result) {
                return SQliteDB.recordCount();
            }, errorHandler);

            var tasksRecentlyAdded = SQliteDB.query('SELECT * FROM tasks WHERE user_id = ? AND status=\'false\' AND created_at != updated_at ORDER BY updated_at DESC').then(function(result) {
                return SQliteDB.recordCount();
            }, errorHandler);

            var tasksCompleted = SQliteDB.query('SELECT * FROM tasks WHERE user_id = ? AND status=\'false\';').then(function(result) {
                return SQliteDB.recordCount();
            }, errorHandler);

            return {
                inbox: tasksInbox,
                starred: tasksStarred,
                priorities: tasksPriorities,
                duedate: tasksDueDate,
                recentlyadded: tasksRecentlyAdded,
                completed: tasksCompleted
            };
        }


        function _get(id) {
            $rootScope.$broadcast('task.get');
            return SQliteDB.query('SELECT * FROM tasks WHERE id =?;', [id]).then(function(result) {
                return SQliteDB.fetchAll(result);
            }, errorHandler);
        }


        function _create(task, hasTask) {
            task.name = task.name || '';
            task.description = task.description || '';

            task.status = task.status || false;

            task.start_date = task.start_date || null;
            task.end_date = task.end_date || null;
            task.completion_date = task.completion_date || null;
            task.starred = task.starred || false;
            task.priority = task.priority || '';
            task.estimate_time = task.estimate_time || null;
            task.time_spent = task.time_spent || 0;
            task.parent_task_id = task.parent_task_id || null;
            task.original_task_id = task.original_task_id || null;
            task.allowed_user_ids = task.allowed_user_ids || null;
            task.tags_ids = task.tags_ids || '';
            task.public_key = task.public_key || '';
            task.project_id = task.project_id || '';
            task.user_id = task.user_id || $rootScope.globals.currentUser.user_id;
            task.folder_id = task.folder_id || null;
            task.created_at = task.created_at || $filter('date')(Date.now(), "dd MMM yy");
            task.updated_at = task.updated_at || task.created_at;

            if (!!hasTask) {
                _broadcastType = 'subtask.create';
                subtask = task;
            } else {
                _broadcastType = 'task.create';
                subtask = null;
            }

            return SQliteDB.query('INSERT INTO tasks(name,description,status,start_date,end_date,completion_date,starred,priority,estimate_time,time_spent,parent_task_id,original_task_id,allowed_user_ids,tags_ids,public_key,project_id,user_id,folder_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
                    task.name, task.description, task.status, task.start_date,
                    task.end_date, task.completion_date, task.starred, task.priority,
                    task.estimate_time, task.time_spent, task.parent_task_id, task.original_task_id,
                    task.allowed_user_ids, task.tags_ids, task.public_key, task.project_id,
                    task.user_id, task.folder_id, task.created_at, task.updated_at
                ]);
        }



        function _update(task) {
            var var_status;
            task.name = task.name || '';
            task.description = task.description || '';

            var_status = task.status || false;

            task.start_date = task.start_date || null;
            task.end_date = task.end_date || null;
            task.completion_date = task.completion_date || null;
            task.starred = task.starred || false;
            task.priority = task.priority || '';
            task.estimate_time = task.estimate_time || null;
            task.time_spent = task.time_spent || false;
            task.parent_task_id = task.parent_task_id || null;
            task.original_task_id = task.original_task_id || null;
            task.allowed_user_ids = task.allowed_user_ids || null;
            task.tags_ids = task.tags_ids || '';
            task.public_key = task.public_key || '';
            task.user_id = task.user_id || null;
            task.project_id = task.project_id || '';
            task.user_id = task.user_id || $rootScope.globals.currentUser.user_id;
            task.folder_id = task.folder_id || null;
            task.updated_at = task.updated_at || $filter('date')(Date.now(), "dd MMM yy");

            _broadcastType = 'task.update';
            return SQliteDB.query('UPDATE tasks SET name=?,description=?,status=?,start_date=?,end_date=?,completion_date=?,starred=?,priority=?,estimate_time=?,time_spent=?,parent_task_id=?,original_task_id=?,allowed_user_ids=?,tags_ids=?,public_key=?,project_id=?,user_id=?,folder_id=?,updated_at=? WHERE id=?', [
                    task.name, task.description, var_status, task.start_date,
                    task.end_date, task.completion_date, task.starred, task.priority,
                    task.estimate_time, task.time_spent, task.parent_task_id, task.original_task_id,
                    task.allowed_user_ids, task.tags_ids, task.public_key, task.project_id,
                    task.user_id, task.folder_id, task.updated_at, task.id
                ]);
        }


        function _delete(id) {
            _broadcastType = 'task.destroy';
            return SQliteDB.query('DELETE FROM tasks WHERE id=?', [id], function(result) {
                return SQliteDB.query('DELETE FROM tasks WHERE parent_task_id=?', [id], function(result) {
                    return SQliteDB.query('DELETE FROM comments WHERE task_id=?', [id], function(result) {

                    }, errorHandler);
                }, errorHandler);
            }, errorHandler);

            return SQliteDB.query('DELETE FROM tags WHERE id IN (SELECT tag_id FROM tags_union WHERE department=\'task\' AND associated_id=?', [id], function(result) {
                return SQliteDB.query('DELETE FROM tags_union WHERE department=\'task\' AND associated_id=?', [id], function(result) {

                }, errorHandler);
            }, errorHandler);

        }

        function successHandler(response) {
            var data = {};
            if (_broadcastType == 'task.create') {
                data.task = response.insertId;
            } else if (_broadcastType == 'subtask.create') {
                data = subtask;
            } else if (_broadcastType == 'task.update' || _broadcastType == 'task.destroy') {
                data = 'success';
            }

            $rootScope.$broadcast(_broadcastType, data);
        }

        function errorHandler(error) {
            console.log(error);
            // console.log(angular.toJson(error));
            $rootScope.$broadcast('task.error', error);
        }
    }
})();
