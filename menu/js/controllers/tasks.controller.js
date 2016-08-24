(function() {
    'use strict';

    angular.module('youproductiveApp')
        .controller('tasksCtrl', tasksCtrl);

    tasksCtrl.$inject = ['$rootScope', '$scope', '$http', '$state', '$timeout', '$ionicModal', '$filter', '$ionicPopover', 'dt', 'ionicToast', '$ionicLoading', 'Api2Service', 'CONFIG'];

    function tasksCtrl($rootScope, $scope, $http, $state, $timeout, $ionicModal, $filter, $ionicPopover, dt, ionicToast, $ionicLoading, Api2Service, CONFIG) {

        function StringToBoolean(str) {
            return (str === 'true') ? true : false;
        }

        var TaskController = {
            init: function() {
                $scope.activeTask = { name: 'Inbox', proper: 'inbox', active: true, icon: 'ion-folder' };
                $scope.tasks = dt.task;
                $scope.repeats = {
                    repeat: dt.repeat,
                    from: dt.repeat_from
                };
                $scope.isRequesting = true;
                $scope.task = {};
                $scope.create_task = {};
                $scope.subtask = {};
                $scope.comment = {};
                $scope.folder = {};
                $scope.folders = {};
                $scope.slug = {};

                $scope.taskEntryMode = 'single';

                $scope.taskgroup = {};
                $scope.taskgroup.inbox = [];
                $scope.taskgroup.starred = [];
                $scope.taskgroup.priorities = [];
                $scope.taskgroup.duedate = [];
                $scope.taskgroup.recentlyadded = [];
                $scope.taskgroup.completed = [];

                $scope.active = dt.active;
                $scope.activeState = 'inbox';


                this.load();
            },
            regroup: function(collection) {

                var task = collection.task;

                task.created_at = $filter('date')(new Date(task.created_at), "dd MMM yy");
                task.activeState = 'taskdetails';
                task.created_at = task.created_at ? $filter('date')(new Date(task.created_at), "dd MMM yy") : null;
                task.start_date = task.start_date ? new Date(task.start_date) : null;
                task.end_date = task.end_date ? new Date(task.end_date) : null;
                task.activeState = 'taskdetails';

                task.child = {};
                task.child.taskdetails = true;
                task.child.subtasks = collection.subtasks;
                task.child.notes = collection.notes.length > 0 ? collection.notes[0] : {};
                task.child.comments = collection.comments;

                task.child.comments = _.map(task.child.comments, function(comment) {
                    comment.created_at = moment(comment.created_at).format();
                    comment.fromNow = moment(comment.created_at).fromNow();
                    return comment;
                });

                task.child.files = collection.files;
                task.child.assigned_users = collection.assigned_users;
                task.child.share = true;
                task.urlSlug = collection.urlSlug;
                task.child.tags = collection.tags;

                task.status = StringToBoolean(task.status);
                task.starred = StringToBoolean(task.starred);
                task.priority = StringToBoolean(task.priority);

                task.isSkip = $rootScope.isSkipApp;

                // inbox
                if (!task.starred &&
                    !task.priorities &&
                    !task.start_date &&
                    !task.end_date &&
                    !task.completion_date &&
                    !task.status)
                    $scope.taskgroup.inbox.push(task);

                // starred
                if (!!task.starred)
                    $scope.taskgroup.starred.push(task);

                // priorities
                if (!!task.priority)
                    $scope.taskgroup.priorities.push(task);

                // due date
                if (!!task.start_date ||
                    !!task.end_date ||
                    !!task.completion_date) {
                    $scope.taskgroup.duedate.push(task);
                }

                // completed
                if (!!task.status)
                    $scope.taskgroup.completed.push(task);

                return task;
            },
            load: function() {
                var self = this;

                var onSuccess = function(response) {
                    console.log('response: ', response);
                    _.each(response, self.regroup);
                    $scope.isRequesting = false;
                    console.log($scope.taskgroup);
                    if (!$rootScope.isSkipApp) {
                        $http
                            .get(CONFIG.APIHost + 'foldersuser')
                            .success(function(response) {
                                $scope.folders = response;
                            })
                            .error(function(error) {
                                console.log(error);
                            });
                    } else {
                        FoldersUnionOfflineService.foldersByUser().then(function(response) {
                            $scope.folders = response;
                        });
                    }
                    $scope.$broadcast('scroll.refreshComplete');
                };

                var onError = function(error) {
                    console.log('Error: ', angular.toJson(error));
                    $scope.isRequesting = false;
                };

                if (!$rootScope.isSkipApp) {
                    Api2Service.list('tasks').then(onSuccess, onError);
                } else {
                    OfflineService.list('tasks').then(onSuccess, onError);
                }
            }
        };

        TaskController.init();

        $ionicModal.fromTemplateUrl('menu/templates/tasks/task.modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.taskmodal = modal;
        });

        $scope.gotoOther = function($event) {
            $ionicPopover.fromTemplateUrl('menu/templates/tasks/tasks.popover.html', {
                scope: $scope
            }).then(function(popover) {
                $scope.popover = popover;
                $scope.popover.show($event);
            });
        };

        $scope.createTask = function(task) {
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('notify-message', 'Task is currently pending. . .');
            } else {
                ionicToast.showInfo('Task is currently pending. . .', 'top', true, 1500);
            }

            wait();

            // if task param has a value then user is creating a subtask
            if (!!task) {
                $scope.subtask.parent_task_id = task.id;

                if (!$rootScope.isSkipApp) {
                    Api2Service.save('tasks', $scope.subtask, 'subtasks');
                } else {
                    OfflineService.create('tasks', $scope.subtask, 'subtasks');
                }

                $scope.subtask.created_at = $filter('date')(Date.now(), "dd MMM yy");
                task.child.subtasks.push($scope.subtask);
                $scope.task = task;
            } else {
                $scope.task = $scope.create_task;

                if (!$rootScope.isSkipApp) {
                    Api2Service.save('tasks', $scope.task);
                } else {
                    OfflineService.create('tasks', $scope.task);
                }

                $scope.task.created_at = $filter('date')(Date.now(), "dd MMM yy");
                $scope.taskgroup.inbox.push($scope.task);
                $scope.activeState = 'inbox';
            }
            // set requesting
            $scope.isRequesting = true;
        }

        $scope.addTasks = function() {
            $scope.taskmodal.show();
        };

        $scope.doRefresh = function() {
            TaskController.init();
        };

        $scope.changeActive = function(active) {
            $scope.popover.hide();
            $scope.activeTask = active;
        };

        $scope.$on('$destroy', function() {
            $scope.taskmodal.remove();
            $scope.popover.remove();
        });

        // tasks events
        $scope.$on('tasks.create', function(event, response) {
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('notify-message', 'Task created successfully. . .');
                require('electron').ipcRenderer.send('tray-refresh-task');
            } else {
                ionicToast.showSuccess('Task created successfully. . .', 'top', true, 1500);
            }

            if (!!response.task) {
                $scope.taskgroup[$scope.activeState] = _.map($scope.taskgroup[$scope.activeState], function(task) {
                    if (!task.id)
                        task = TaskController.regroup(response);
                    return task;
                });
            }

            $scope.isRequesting = false;
            $scope.task = {};
            $scope.create_task = {};
        });
        $scope.$on('tasks.update', function(event, response) {
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('notify-message', 'Task updated successfully. . .');
            } else {
                ionicToast.showSuccess('Task updated successfully. . .', 'top', true, 1500);
            }
            $scope.isRequesting = false;
        });
        $scope.$on('tasks.destroy', function(event, response) {
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('notify-message', 'Task deleted successfully. . .');
            } else {
                ionicToast.showSuccess('Task deleted successfully. . .', 'top', true, 1500);
            }

            _.each($scope.taskgroup, function(tasks, group) {
                _.each(tasks, function(task) {
                    if (task.id == $scope.task.id) {
                        $scope.taskgroup[group] = _.without($scope.taskgroup[group], $scope.task);
                    }
                });
            });

            $scope.isRequesting = false;
            $scope.task = {};
        });
        $scope.$on('tasks.error', function(event, response) {
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('error-message', 'Something went wrong, creating task failed. . .');
            } else {
                ionicToast.showError('Something went wrong, creating task failed. . .', 'top', true, 1500);
            }

            // if something went wrong then remove pending task
            if (response.broadcast == 'tasks.create')
                $scope.taskgroup.inbox = _.without($scope.taskgroup.inbox, $scope.task);

            $scope.isRequesting = false;
            $scope.task = {};
        });

        function wait() {
            // wait
            if ($scope.isRequesting) {
                if (typeof module === "object" && typeof module.exports === "object") {
                    require('electron').ipcRenderer.send('notify-message', 'Request is still loading. . .');
                } else {
                    ionicToast.showInfo('Request is still loading. . .', 'top', true, 1000);
                }
                return true;
            }
        }

    }
})();
