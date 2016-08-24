(function() {
    'use strict';

    angular
        .module('youproductiveApp')
        .controller('TasksController', TasksController);

    TasksController.$inject = ['SocketService', '$rootScope', 'Api2Service', '$location', '$state', 'Restangular', '$timeout', 'OfflineService', 'ApiService', 'TasksService', 'FlashService', '$scope', '$http', '$q', '$filter', '_', 'dt', 'CONFIG', 'Upload', '$uibModal',
        'FoldersOfflineService', 'FoldersUnionOfflineService', 'TasksOfflineService', 'CommentsOfflineService', 'TagsOfflineService', 'NotesOfflineService', 'FilesOfflineService', 'UploadOfflineService', 'TagsService'
    ];

    function StringToBoolean(str) {
        return (str === 'true') ? true : false;
    }

    function TasksController(SocketService, $rootScope, Api2Service, $location, $state, Restangular, $timeout, OfflineService, ApiService, TasksService, FlashService, $scope, $http, $q, $filter, _, dt, CONFIG, Upload, $uibModal,
        FoldersOfflineService, FoldersUnionOfflineService, TasksOfflineService, CommentsOfflineService, TagsOfflineService, NotesOfflineService, FilesOfflineService, UploadOfflineService, TagsService) {

        var vm = this;

        vm.createTask = createTask; //
        vm.updateTask = updateTask; //
        vm.deleteTask = deleteTask; //
        vm.activeSubTab = activeSubTab; //
        vm.taskLoadChildSection = taskLoadChildSection;
        vm.changeState = changeState;
        vm.changeToTime = changeToTime;
        vm.changeToDate = changeToDate;
        vm.dateSelection = dateSelection;
        vm.chatDate = chatDate;
        vm.downloadFile = downloadFile;
        vm.commentDetails = commentDetails;
        vm.hasCreateTaskProperty = hasCreateTaskProperty;
        vm.showDatePicker = showDatePicker;
        vm.showTimePicker = showTimePicker;

        vm.noteCommand = noteCommand;

        vm.openStatuses = openStatuses;
        vm.addTag = addTag; //
        vm.deleteTag = deleteTag; //
        vm.loadTags = loadTags; //

        vm.createComment = createComment;

        vm.saveNote = saveNote;
        vm.deleteNote = deleteNote;

        vm.saveFolder = saveFolder;

        vm.assignUserTask = assignUserTask;
        vm.generateLink = generateLink;

        vm.showPrompt = showPrompt;

        $rootScope.notifications = 0; // temporary;

        // Use $scope for taskGroup and taskLists because vm
        // is not compatible with ui-tabs

        //$scope.taskGroup = [];
        //$scope.taskLists = dt.lists.task;


        /**
         * @object
         * @description
         * Initialize view models, load tasks and re-group
         */
        var TaskController = {
            init: function() {
                vm.priorityOptions = dt.options.priority;
                vm.repeats = {
                    repeat: dt.repeat,
                    from: dt.repeat_from
                };
                vm.isRequesting = true;
                vm.task = {};
                vm.create_task = {};
                vm.subtask = {};
                vm.comment = {};
                vm.folder = {};
                vm.folders = {};
                vm.slug = {};

                vm.taskEntryMode = 'single';

                vm.taskgroup = {};
                vm.taskgroup.inbox = [];
                vm.taskgroup.starred = [];
                vm.taskgroup.priorities = [];
                vm.taskgroup.duedate = [];
                vm.taskgroup.recentlyadded = [];
                vm.taskgroup.completed = [];

                vm.active = dt.active;
                vm.activeState = 'inbox';


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

                _.each(collection.subtasks, function(val) {
                    val.status = StringToBoolean(val.status);
                    val.starred = StringToBoolean(val.starred);
                    val.priority = StringToBoolean(val.priority);
                });
                task.child.subtasks = collection.subtasks;


                task.child.notes = collection.notes.length > 0 ? collection.notes[0] : {};
                task.child.comments = collection.comments;

                task.child.comments = _.map(task.child.comments, function(comment) {
                    comment.created_at = moment(comment.created_at).format();
                    comment.fromNow = moment(comment.created_at).fromNow();
                    comment.isEdit = false;
                    return comment;
                });

                task.child.files = collection.files;
                task.child.assigned_users = collection.assigned_users;
                task.child.share = true;

                if (!_.isEmpty(collection.urlSlug))
                    collection.urlSlug[0].slug = CONFIG.Local + collection.urlSlug[0].slug;

                task.child.urlSlug = collection.urlSlug;
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
                    vm.taskgroup.inbox.push(task);

                // starred
                if (!!task.starred)
                    vm.taskgroup.starred.push(task);

                // priorities
                if (!!task.priority)
                    vm.taskgroup.priorities.push(task);

                // due date
                if (!!task.start_date ||
                    !!task.end_date ||
                    !!task.completion_date) {
                    vm.taskgroup.duedate.push(task);
                }

                // completed
                if (!!task.status)
                    vm.taskgroup.completed.push(task);

                return task;
            },
            load: function() {
                var self = this;

                var onSuccess = function(response) {
                    console.log('response: ', response);
                    _.each(response, self.regroup);
                    vm.isRequesting = false;
                    console.log(vm.taskgroup);
                    if (!$rootScope.isSkipApp) {
                        $http
                            .get(CONFIG.APIHost + 'foldersuser')
                            .success(function(response) {
                                vm.folders = response;
                            })
                            .error(function(error) {
                                console.log(error);
                            });
                    } else {
                        FoldersUnionOfflineService.foldersByUser().then(function(response) {
                            vm.folders = response;
                        });
                    }
                };

                var onError = function(error) {
                    console.log('Error: ', angular.toJson(error));
                    vm.isRequesting = false;
                };

                if (!$rootScope.isSkipApp) {
                    Api2Service.list('tasks').then(onSuccess, onError);
                } else {
                    OfflineService.list('tasks').then(onSuccess, onError);
                }
            }
        };
        TaskController.init();

        if (!$rootScope.isSkipApp) {
            SocketService.on("server-updates:App\\Events\\ServerUpdated", function(response) {
                console.log(response);
                var resource = response.resource;
                switch (resource) {
                    case 'tasks':

                        break;
                    case 'comments':
                        if (!!response.data) {

                            if (_.isEmpty(vm.task)) {

                                _.each(vm.taskgroup, function(tasks, group) {
                                    _.each(tasks, function(task, idx) {
                                        if (task.id == response.data.task_id) {
                                            //response.data.created_at = moment(response.data.created_at);
                                            response.data.fromNow = moment(response.data.created_at).fromNow();
                                            vm.taskgroup[group][idx].child.comments.push(response.data);
                                        }
                                    });
                                });
                                $rootScope.notifications = $rootScope.notifications + 1;
                            } else {
                                if (typeof module === "object" && typeof module.exports === "object") {
                                    require('electron').ipcRenderer.send('comment-message', 'Comment created successfully. . .');
                                } else {
                                    FlashService.otherThumbslider('Comment created successfully. . .', '', false, 1500);
                                }
                                vm.isRequesting = false;
                                vm.comment = {};

                                vm.taskgroup[vm.activeState] = _.map(vm.taskgroup[vm.activeState], function(task) {
                                    if (task.id == vm.task.id) {
                                        task.child.comments = _.map(task.child.comments, function(comment) {
                                            if (_.isUndefined(comment.id)) {
                                                comment = response.data;
                                                //comment.created_at = moment(comment);
                                                comment.fromNow = moment(comment.created_at).fromNow();
                                            }
                                            return comment;
                                        });
                                    }
                                    vm.task = {};
                                    return task;
                                });
                            }
                        }

                        break;
                }
            });
        }

        $rootScope.$on("reload", function() {
            TaskController.init();
        });


        if (typeof module === "object" && typeof module.exports === "object") {
            const ipcRenderer = require('electron').ipcRenderer;

            ipcRenderer.on('tasks-starred', function(event) {
                console.log('tasks-starred');
                changeState(event, 'starred');
            });

            ipcRenderer.on('tasks-priorities', function(event) {
                console.log('tasks-priorities');
                changeState(event, 'priorities');
            });

            ipcRenderer.on('tasks-due-date', function(event) {
                console.log('tasks-due');
                changeState(event, 'duedate');
            });

            ipcRenderer.on('tasks-recently-added', function(event) {
                console.log('tasks-recently');
                changeState(event, 'recentlyadded');
            });

            ipcRenderer.on('tasks-completed', function(event) {
                console.log('tasks-completed');
                changeState(event, 'completed');
            });
        }


        // tasks events
        $scope.$on('tasks.create', function(event, response) {
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('notify-message', 'Task created successfully. . .');
            } else {
                FlashService.otherThumbslider('Task created successfully. . .', '', false, 1500);
            }

            if (!!response.task) {
                vm.taskgroup[vm.activeState] = _.map(vm.taskgroup[vm.activeState], function(task) {
                    if (!task.id)
                        task = TaskController.regroup(response);
                    return task;
                });
            }

            vm.isRequesting = false;
            vm.task = {};
            vm.create_task = {};
        });
        $scope.$on('tasks.update', function(event, response) {
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('notify-message', 'Task updated successfully. . .');
            } else {
                FlashService.otherThumbslider('Task updated successfully. . .', '', false, 1500);
            }
            vm.isRequesting = false;
        });
        $scope.$on('tasks.destroy', function(event, response) {
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('notify-message', 'Task deleted successfully. . .');
            } else {
                FlashService.otherThumbslider('Task deleted successfully. . .', '', false, 1500);
            }

            _.each(vm.taskgroup, function(tasks, group) {
                _.each(tasks, function(task) {
                    if (task.id == vm.task.id) {
                        vm.taskgroup[group] = _.without(vm.taskgroup[group], vm.task);
                    }
                });
            });

            // if (!!vm.task.isSubtask)
            //     vm.taskgroup[vm.activeState].subtasks = _.without(vm.taskgroup[vm.activeState].subtasks, vm.task);
            // else
            //     vm.taskgroup[vm.activeState] = _.without(vm.taskgroup[vm.activeState], vm.task);

            vm.isRequesting = false;
            vm.task = {};
        });
        $scope.$on('tasks.error', function(event, response) {
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('error-message', 'Something went wrong, creating task failed. . .');
            } else {
                FlashService.otherThumbslider('Something went wrong, creating task failed. . .', 'error', false, 1500);
            }

            // if something went wrong then remove pending task
            if (response.broadcast == 'tasks.create')
                vm.taskgroup.inbox = _.without(vm.taskgroup.inbox, vm.task);

            vm.isRequesting = false;
            vm.task = {};
        });



        // subtasks events
        $scope.$on('subtasks.create', function(event, response) {
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('notify-message', 'Subtask added successfully. . .');
            } else {
                FlashService.otherThumbslider('Subtask added successfully', '');
            }

            if (!!response.task) {
                vm.taskgroup[vm.activeState][0].child.subtasks = _.map(vm.taskgroup[vm.activeState][0].child.subtasks, function(subtask) {
                    if (!subtask.id)
                        subtask = response.task;
                    return subtask;
                });
            }

            vm.isRequesting = false;
            vm.task = vm.subtask = {};
        });
        $scope.$on('subtasks.destroy', function(event, response) {
            vm.taskgroup[vm.activeState] = _.map(vm.taskgroup[vm.activeState], function(task) {

                _.each(task.child.subtasks, function(subtask) {
                    if (subtask.id == vm.task.id) {
                        task.child.subtasks = _.without(task.child.subtasks, vm.task);
                    }
                });
                return task;
            });
            vm.task = {};
            vm.isRequesting = false;
        });
        $scope.$on('subtasks.error', function(event, response) {
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('error-message', 'Something went wrong, creating task failed. . .');
            } else {
                FlashService.otherThumbslider('Something went wrong, creating task failed. . .', 'error', false, 1500);
            }

            // if something went wrong then remove pending subtasks
            if (response.broadcast == 'subtasks.create') {
                var sliced = _.without(vm.task.child.subtasks, vm.subtask);
                vm.taskgroup[vm.activeState] = _.map(vm.taskgroup[vm.activeState], function(task) {
                    if (task.id == vm.task.id)
                        task.child.subtasks = sliced;
                    return task
                });
            }

            vm.isRequesting = false;
            vm.task = vm.subtask = {};
        });



        // notes events
        $scope.$on('notes.create', function(event, response) {
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('notify-message', 'Notes created successfully. . .');
            } else {
                FlashService.otherThumbslider('Notes created successfully. . .', '', false, 1500);
            }

            if (!!response.data) {
                vm.taskgroup[vm.activeState] = _.map(vm.taskgroup[vm.activeState], function(task) {

                    if (task.id == vm.task.id) {
                        task.child.notes = _.map(task.child.notes, function(note) {
                            if (!note.id)
                                note = response.data;
                            return note;
                        });
                    }

                    return task;
                });
            }

            vm.isAdding = vm.isRequesting = false;
            vm.note = vm.task = {};
        });
        $scope.$on('notes.update', function(event, response) {
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('notify-message', 'Note updated successfully. . .');
            } else {
                // FlashService.otherThumbslider('Note updated successfully. . .', '', false, 1500);
            }

            vm.isRequesting = false;
        });
        $scope.$on('notes.destroy', function(event, response) {
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('notify-message', response.message);
            } else {
                FlashService.otherThumbslider(response.message, '', false, 1500);
            }

            vm.taskgroup[vm.activeState] = _.map(vm.taskgroup[vm.activeState], function(task) {
                if (task.id == vm.task.id) {
                    task.child.notes = _.without(task.child.notes, vm.note);
                }
                return task;
            });

            vm.isAdding = vm.isRequesting = false;
            vm.task = vm.note = {};
        });



        // comments events
        /*$scope.$on('comments.create', function(event, response) {
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('notify-message', 'Comment created successfully. . .');
            } else {
                FlashService.otherThumbslider('Comment created successfully. . .', '', false, 1500);
            }
            vm.isRequesting = false;
            vm.comment = {};
        });*/
        $scope.$on('comments.error', function(event, response) {
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('error-message', 'Something went wrong, creating comment failed. . .');
            } else {
                FlashService.otherThumbslider('Something went wrong, creating comment failed. . .', 'error', false, 1500);
            }

            if (response.broadcast == 'comments.create') {
                var sliced = _.without(vm.task.child.comments, vm.comment);
                vm.taskgroup[vm.activeState] = _.map(vm.taskgroup[vm.activeState], function(task) {
                    if (task.id == vm.task.id)
                        task.child.comments = sliced;
                    return task;
                });
            }

            vm.comment = vm.task = {};
            vm.isRequesting = false;
        });



        // tags events
        $scope.$on('tagsunions.create', function(event, response) {
            console.log(response);
            vm.isRequesting = false;
        });
        $scope.$on('tagsunions.delete', function(event, response) {
            console.log(response);
            vm.isRequesting = false;
        });
        $scope.$on('tags.delete', function(event, response) {
            console.log(response);
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('notify-message', 'Tag deleted successfully. . .');
            } else {
                FlashService.otherThumbslider('Tag deleted successfully. . .', '', false, 1500);
            }
            vm.isRequesting = false;
        });



        // folders events
        $scope.$on('foldersunions.create', function(event, response) {
            console.log(response);

            if (!$rootScope.isSkipApp) {
                Api2Service.custom('foldersunions', { department: 'tasks', id: vm.task.id }).then(function(response) {
                    vm.task.child.folders = response;
                    //on.saveFolder = undefined;
                    $http
                        .get(CONFIG.APIHost + 'foldersuser')
                        .success(function(response) {
                            vm.folders = response;
                        })
                        .error(function(error) {
                            console.log(error);
                        });
                });
            } else {
                OfflineService.custom('foldersunions', { department: 'tasks', id: vm.task.id }).then(function(response) {
                    vm.task.child.folders = response;

                    OfflineService.foldersByUser().then(function(response) {
                        vm.folders = response;
                    });
                });
            }

            vm.isRequesting = false;
            event.preventDefault();
            // $state.go($state.current, null, { reload: true });
        });

        function showPrompt(state) {
            if (!$rootScope.isSkipApp) {
                vm.task.activeState = state;
            } else {
                $uibModal.open({
                    animation: true,
                    templateUrl: 'app/components/tasks/modal/prompt.view.html',
                    size: 'md'
                });
            }
        }

        // tasks crud functions
        function createTask(task) {

            // notify user
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('notify-message', 'Task is currently pending. . .');
            } else {
                FlashService.otherThumbslider('Task is currently pending. . .', '', false, 1500);
            }

            wait();

            // if task param has a value then user is creating a subtask
            if (!!task) {
                vm.subtask.parent_task_id = task.id;

                if (!$rootScope.isSkipApp) {
                    Api2Service.save('tasks', vm.subtask, 'subtasks');
                } else {
                    OfflineService.create('tasks', vm.subtask, 'subtasks');
                }

                vm.subtask.created_at = $filter('date')(Date.now(), "dd MMM yy");
                task.child.subtasks.push(vm.subtask);
                vm.task = task;
            } else {
                vm.task = vm.create_task;

                if (!$rootScope.isSkipApp) {
                    Api2Service.save('tasks', vm.task);
                } else {
                    OfflineService.create('tasks', vm.task);
                }

                vm.task.created_at = $filter('date')(Date.now(), "dd MMM yy");
                vm.taskgroup.inbox.push(vm.task);
                vm.activeState = 'inbox';
            }
            // set requesting
            vm.isRequesting = true;
        }

        function updateTask(task, property, option) {
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('notify-message', 'Updating task. . .');
            } else {
                FlashService.otherThumbslider('Updating task. . .', '', false, 1500);
            }

            wait();
            // determine if property is starred or status
            switch (property) {
                case 'status':
                    task[property] = !task[property];
                    break;
                case 'starred':
                    task[property] = !task[property];
                    break;
            }

            if (!!option && property === 'priorities')
                task['priority'] = option;

            // update task
            if (!$rootScope.isSkipApp) {
                Api2Service.save('tasks', task);
            } else {
                console.log('task: ', task);
                OfflineService.update('tasks', task);
            }

            vm.isRequesting = true;
        }

        function deleteTask(task, subtask) {
            vm.task = subtask ? subtask : task;

            if (!!subtask)
                vm.task.isSubtask = true;

            if (!$rootScope.isSkipApp) {
                Api2Service.destroy('tasks', vm.task.id);
            } else {
                OfflineService.destroy('tasks', vm.task.id);
            }

            // notify user
            if (typeof module === "object" && typeof module.exports === "object") {
                require('electron').ipcRenderer.send('notify-message', 'Deleting task. . .');
            } else {
                FlashService.otherThumbslider('Deleting task. . .', '', false, 1500);
            }

            vm.isRequesting = true;
        }



        // notes crud functions
        function saveNote(task) {
            if (!vm.note.id) {

                task.child.notes.type = 'tasks';
                task.child.notes.associated_id = task.id;
                vm.task = task;

                if (!$rootScope.isSkipApp) {
                    Api2Service.save('notes', task.child.notes);
                } else {
                    OfflineService.create('notes', task.child.notes);
                }
            } else { // update note
                if (!$rootScope.isSkipApp) {
                    Api2Service.save('notes', task.child.notes);
                } else {
                    OfflineService.update('notes', task.child.notest);
                }
            }
            vm.isRequesting = true;
        }

        function deleteNote(task) {
            if (!!vm.note.id) {
                vm.task = task;
                if (!$rootScope.isSkipApp) {
                    Api2Service.destroy('notes', vm.note.id);
                } else {
                    OfflineService.destroy('notes', vm.note.id);
                }
            }
            vm.isRequesting = true;
        }

        function noteCommand(action, value) {
            angular.element(document).ready(function() {
                document.execCommand(action, false, value);
            });
        }



        // comments crud functions
        function createComment(task) {

            vm.comment.task_id = task.id;
            vm.comment.type = 'tasks';

            if (!$rootScope.isSkipApp) {
                Api2Service.save('comments', vm.comment);
            } else {
                OfflineService.save('comments', vm.comments);
            }

            vm.comment.created_at = $filter('date')(Date.now(), "d MMM h:mm a");
            vm.comment.fromNow = moment(Date.now()).fromNow();

            task.child.comments.push(vm.comment);
            vm.task = task;

            vm.isRequesting = true;
        }



        // folders crud functions
        function saveFolder(task) {

            console.log(task.id);
            if (!vm.folder.id) {
                if (!$rootScope.isSkipApp) {
                    ApiService
                        .createFolderIfNotExist(vm.folder.name)
                        .then(function(response) {
                            console.log(response.data);
                            task.folder_id = response.data;
                            vm.task = task;
                            updateTask(task);
                            var folderunion = JSON.stringify({ folder_id: response.data, associated_id: task.id, department: 'tasks' });
                            Api2Service.save('foldersunions', folderunion);
                        }, errorHandler);
                } else {
                    OfflineService
                        .createFolderIfNotExist(vm.folder)
                        .then(function(response) {
                            console.log('createFolderIfNotExist: ', response);
                            task.folder_id = response.data;
                            vm.task = task;
                            updateTask(task);
                            var folderunion = { folder_id: response.data, associated_id: task.id, department: 'tasks' };
                            OfflineService.create('foldersunions', folderunion);
                        }, errorHandler);
                }
            } else {
                if (!$rootScope.isSkipApp) {
                    var folderunion = JSON.stringify({ folder_id: response.data, associated_id: task.id, department: 'tasks' });
                    ApiService.create('foldersunions', folderunion);
                } else {
                    var folderunion = { folder_id: response.data, associated_id: task.id, department: 'tasks' };
                    OfflineService.create('foldersunions', folderunion);
                }
            }
            vm.isRequesting = true;
        }



        // user task function
        function assignUserTask(task) {
            // TODO: refactor later using own service
            console.log(vm.assign);
            vm.isRequesting = true;
            $http
                .get(CONFIG.APIHost + 'user/search/' + vm.assign)
                .success(function(response) {
                    console.log(response);
                    var userstasks;
                    var user;
                    if (!!response.users && response.users.length > 0) {
                        user = response.users[0];
                        userstasks = { task_id: task.id, assigned_user_id: user.user_id };
                        console.log(userstasks);
                        $http
                            .post(CONFIG.APIHost + 'userstasks', userstasks)
                            .success(function(response) {
                                console.log(response);
                                $http
                                    .get(CONFIG.APIHost + 'userstasks/' + task.id)
                                    .success(function(response) {
                                        console.log(response);
                                        vm.isRequesting = false;
                                        if (!!response && response.length > 0)
                                            task.child.assigned_users = response;
                                    })
                                    .error(function(error) {
                                        console.log(error);
                                        vm.isRequesting = false;
                                    })
                            })
                            .error(function(error) {
                                console.log(error);
                                vm.isRequesting = false;
                            });
                    } else {
                        if (typeof module === "object" && typeof module.exports === "object") {
                            require('electron').ipcRenderer.send('error-message', 'User does not exists. . .');
                        } else {
                            FlashService.otherThumbslider('User does not exists. . .', 'error', false, 3000);
                        }
                    }
                })
                .error(function(error) {
                    console.log(error);
                });
        }



        function generateLink(data, type) {

            // TODO: refactor later to its own service

            console.log($location.absUrl());


            var urldata = {
                urldata: 'youprodev.com/' + type + '/' + data.id
            };
            $http
                .post(CONFIG.APIHost + 'urls', urldata)
                .success(function(response) {
                    console.log(response);

                    var urlsshorts = {
                        url_id: response,
                        associated_id: data.id,
                        type: type + 's'
                    };
                    $http
                        .post(CONFIG.APIHost + 'urlshorts', urlsshorts)
                        .success(function(response) {

                            console.log(response);
                            vm.slug[type] = CONFIG.Local + response;
                        })
                        .error(function(error) {
                            console.log(error);
                        });
                })
                .error(function(error) {
                    console.log(error);
                });
        }

        function openStatuses() {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'app/components/tasks/modals/status.view.html',
                controller: 'ModalStatusController',
                size: 'md',
                resolve: {
                    items: function() {
                        return $scope.items;
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {}, function() {});
        }
        // tags functions
        function addTag(tag, task) {
            if (!tag.id) {
                if (!$rootScope.isSkipApp) {
                    ApiService
                        .createTagIfNotExist(tag.name)
                        .then(function(response) {
                            var tagunion = JSON.stringify({ tag_id: response.data, associated_id: task.id, department: 'tasks' });
                            ApiService.create('tagsunions', tagunion);
                        }, errorHandler);
                } else {
                    OfflineService
                        .createTagIfNotExist(tag.name)
                        .then(function(response) {
                            console.log(response);
                            var tagunion = { tag_id: response.data, associated_id: task.id, department: 'tasks' };
                            OfflineService.create('tagsunions', tagunion);
                        }, errorHandler);
                }
            } else {
                if (!$rootScope.isSkipApp) {
                    var tagunion = JSON.stringify({ tag_id: tag.id, associated_id: task.id, department: 'tasks' });
                    ApiService.create('tagsunions', tagunion);
                } else {
                    var tagunion = { tag_id: tag.id, associated_id: task.id, department: 'tasks' };
                    OfflineService.create('tagsunions', tagunion);
                }
            }
        }

        function deleteTag(tag) {
            if (!!tag.id) {
                vm.isRequesting = true;
                if (!$rootScope.isSkipApp) {
                    ApiService
                        .customDelete('tags', tag)
                        .then(function(response) {
                            console.log(angular.toJson(response));
                            vm.isRequesting = false;
                        }, function(error) {
                            console.log(angular.toJson(error));
                            vm.isRequesting = false;
                        });
                } else {
                    OfflineService
                        .destroy('tags', tag)
                        .then(function(response) {
                            console.log(angular.toJson(response));
                            vm.isRequesting = false;
                        }, function(error) {
                            console.log(angular.toJson(error));
                            vm.isRequesting = false;
                        });
                }
            }
        }

        function loadTags(query) {
            if (!$rootScope.isSkipApp) {
                return ApiService.list('tags');
            } else {
                return OfflineService.list('tags');
            }
        }



        // other methods
        function wait() {
            // wait
            if (vm.isRequesting) {
                if (typeof module === "object" && typeof module.exports === "object") {
                    require('electron').ipcRenderer.send('notify-message', 'Request is still loading. . .');
                } else {
                    FlashService.barSlideTop('Request is still loading. . .', '', 100);
                }
                return true;
            }
        }

        function changeState(event, state) {
            vm.activeState = state;
        }

        function changeToTime(date) {
            if (!!date)
                return moment(date).format('LTS');
        }

        function changeToDate(date) {
            if (!!date)
                return moment(date).format('LL');
        }

        function dateSelection(task, date, type) {
            switch (type) {
                case 'today':
                    task[date] = moment().format();
                    break;
                case 'tomorrow':
                    task[date] = moment().add(1, 'days').format();
                    break;
                case 'in one week':
                    task[date] = moment().add(7, 'days').format();
                    break;
                case 'in one month':
                    task[date] = moment().add(1, 'months').format();
                    break;
                case 'in one year':
                    task[date] = moment().add(1, 'year').format();
                    break;
            }
            console.log(task);
            if (!!task.id)
                updateTask(task, 'date', false);
        }

        function chatDate(date) {
            return $filter('date')(date, "d MMM") + ' at ' + moment(date).format('LT');
        }

        function downloadFile(downloadPath) {
            window.open(downloadPath, '_blank', '');
        }

        function commentDetails(comment, task, info) {
            var user = "";
            _.each(task.child.assigned_users, function(u) {
                if (u.assigned_user_id == comment.user_id) {
                    console.log($rootScope.globals.currentUser);
                    user = u;
                }
            });
            return $rootScope.globals.currentUser.user_id == comment.user_id ? $rootScope.globals.currentUser[info] : user[info];
        }

        function hasCreateTaskProperty() {
            var count = 0;

            if (_.size(vm.create_task) != 0) {

                _.each(vm.create_task, function(value, key) {
                    if (key != 'name') {
                        if (!value)
                            count++;
                    } else
                        count++;
                });

                if (count == _.size(vm.create_task))
                    return false;

                return true;
            } else {
                return false;
            }


            if (!_.isEmpty(vm.create_task)) {


            }


            return false;
        }

        function showDatePicker(ev, task, property) {
            $mdpDatePicker(task[property], {
                targetEvent: ev
            }).then(function (selectedDate) {
                task[property] = selectedDate;
                if(!!task.id)
                    updateTask(task, 'date', false);
            })
        }
        function showTimePicker(ev, task, property) {
            $mdpTimePicker(task[property], {
                targetEvent: ev
            }).then(function (selectedDate) {
                task[property] = selectedDate;
                if(!!task.id)
                    updateTask(task, 'date', false);
            })
        }
        
        function activeSubTab(childState, task) {

            vm.activeChildState = childState;

            task.subMenuLists[task.subActiveIndex].active = false;
            task.subMenuLists[idx].active = true;
            task.subActiveIndex = idx;
        }

        function taskLoadChildSection(task, section) {
            task.activeState = section;
            task.is_collapsed = true;
        }

        // file upload methods
        $scope.currentTask = {};

        $scope.upload = function(files, task) {

            var calls = [];
            if (files && files.length) {
                console.log(files);

                vm.isRequesting = true;

                if (!$rootScope.isSkipApp) {
                    _.each(files, function(file) {
                        if (!file.$error) {
                            calls.push(uploadFile(file, task));
                        }
                    });
                } else {
                    if (typeof module === "object" && typeof module.exports === "object") {
                        _.each(files, function(file) {
                            if (!file.$error) {
                                calls.push(UploadOfflineService.localupload(file, task.id));
                            }
                        });
                    } else {
                        if (typeof module === "object" && typeof module.exports === "object") {
                            require('electron').ipcRenderer.send('error-message', 'Uploading via browser is not supported. . .');
                        } else {
                            FlashService.barSlideTop('Uploading via browser is not supported', 'warning', 100);
                        }
                    }
                }
                $q.all(calls).then(function(response) {
                    if (!$rootScope.isSkipApp) {
                        Api2Service.custom('files', { department: 'tasks', id: task.id }).then(function(response) {
                            if (typeof module === "object" && typeof module.exports === "object") {
                                require('electron').ipcRenderer.send('notify-message', 'Files uploaded successfully. . .');
                            } else {
                                FlashService.otherThumbslider('Files uploaded successfully...', 'success', false, 1500);
                            }
                            task.child.files = response;
                        });
                    } else {
                        FilesOfflineService.getByType('tasks', task.id).then(function(response) {
                            task.child.files = response;
                        });
                        if (typeof module === "object" && typeof module.exports === "object") {
                            require('electron').ipcRenderer.send('notify-message', 'Files uploaded successfully. . .');
                        } else {
                            FlashService.otherThumbslider('Files uploaded successfully...', 'success', false, 1500);
                        }
                    }
                    vm.isRequesting = false;
                }, function(error) {
                    console.log(angular.toJson(error));
                    vm.isRequesting = false;
                });

            }
        };

        function uploadFile(file, task, callback) {
            var deferred = $q.defer();
            if (!file.$error) {
                Upload.upload({
                    url: CONFIG.APIHost + 'files',
                    data: {
                        filefield: file,
                        type: 'tasks',
                        task_id: task.id
                    }
                }).then(function(response) {
                    if (_.isFunction(callback))
                        callback(response.data);
                    deferred.resolve(response.data);
                }, function(error) {
                    deferred.reject(error);
                }, function(evt) {
                    // evt
                })
            } else {
                deferred.reject();
            }
            return deferred.promise;
        }



        // handlers
        function errorHandler(response) {
            console.log('Error => ' + angular.toJson(response));
            vm.isRequesting = false;
            if (response.data.error == 'token_expired') {
                if (typeof module === "object" && typeof module.exports === "object") {
                    require('electron').ipcRenderer.send('notify-message', 'Your session has expired. Please login again.');
                } else {
                    FlashService.barSlideTop('Your session has expired. Please login again.', 'error', 100);
                }
                $state.go('login');
            } else {
                FlashService.barSlideTop(response.data.error.message, 'error', 100);
            }
        }

        vm.toggleSubPriority = function(event, open) {
            event.preventDefault();
            event.stopPropagation();
            console.log(open);
        };
    }

    angular.module('youproductiveApp')
        .controller('ModalStatusController', ModalStatusController);

    ModalStatusController.$inject = [];

    function ModalStatusController() {

    }
})();
