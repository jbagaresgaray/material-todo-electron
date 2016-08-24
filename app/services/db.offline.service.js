(function() {
    'use strict';

    angular
        .module('youproductiveApp')
        .factory('OfflineService', OfflineService);

    OfflineService.$inject = ['$q', '$rootScope', 'TasksOfflineService', 'UsersOfflineService',
        'CommentsOfflineService', 'FoldersOfflineService', 'FoldersUnionOfflineService', 'TagsOfflineService', 'TagsUnionOfflineService',
        'NotesOfflineService', 'UserstaksOfflineService', 'ProjectsOfflineService', 'LogsOfflineService', 'NotificationOfflineService',
        'OrganizationsOfflineService'
    ];

    function OfflineService($q, $rootScope, TasksOfflineService, UsersOfflineService,
        CommentsOfflineService, FoldersOfflineService, FoldersUnionOfflineService, TagsOfflineService, TagsUnionOfflineService,
        NotesOfflineService, UserstaksOfflineService, ProjectsOfflineService, LogsOfflineService, NotificationOfflineService,
        OrganizationsOfflineService) {

        var broadcastType = null;
        var service = {};

        // Pointer
        service.current = null;
        // Collection
        service.collection = {
            userstasks: UserstaksOfflineService,
            tasks: TasksOfflineService,
            tags: TagsOfflineService,
            tagsunions: TagsUnionOfflineService,
            foldersunions: FoldersUnionOfflineService,
            users: UsersOfflineService,
            projects: ProjectsOfflineService,
            comments: CommentsOfflineService,
            notes: NotesOfflineService,
            folders: FoldersOfflineService,
            logs: LogsOfflineService,
            notifications: NotificationOfflineService,
            organizations: OrganizationsOfflineService
        };

        // API methods
        service.list = list;
        service.custom = customList;
        service.show = show;
        service.create = create;
        service.update = update;
        service.destroy = destroy;
        service.foldersByUser = foldersByUser;
        service.createFolderIfNotExist = createFolderIfNotExist;
        service.createTagIfNotExist = createTagIfNotExist;
        service.getByType = getByType;

        return service;

        // API functions
        function list(collection) {
            // GET /v1/current
            service.current = collection;
            return service.collection[collection].list();
        }

        function customList(collection, params) {
            service.current = collection;
            return service.collection[collection].list(params.department, params.id);
        }

        function show(collection, id) {
            // GET /v1/current/:id
            service.current = collection;
            broadcastType = collection + '.show';
            return service.collection[collection].get(id);
        }

        function create(collection, data, type) {
            service.current = collection;

            if (type === 'subtasks') {
                broadcastType = type + '.create';
            } else {
                broadcastType = collection + '.create';
            }
            return service.collection[collection].create(data).then(success, error);
        }

        function update(collection, data) {
            // PUT /v1/current/:id
            service.current = collection;
            broadcastType = collection + '.update';
            return service.collection[collection].update(data).then(success, error);
        }

        function destroy(collection, data) {
            // DELETE /v1/current/:id
            service.current = collection;
            broadcastType = collection + '.destroy';
            return service.collection[collection].delete(data).then(success, error);
        }

        function foldersByUser() {
            return service.collection['foldersunions'].foldersByUser();
        }

        function createFolderIfNotExist(folder) {
            return service.collection['folders'].checkFolderNameIfExistIfNotCreated(folder);
        }

        function createTagIfNotExist (tag) {
            return service.collection['tags'].CreateTagIfNotExist(tag);
        }

        function success(response) {
            $rootScope.$broadcast(broadcastType, response);
        }

        function error(error) {
            console.log(angular.toJson(error));
            $rootScope.$broadcast(service.current + '.error', error);
        }

        // Task special function
        function getByType(collection, type, callback) {
            // GET /v1/tasks/:id/type
            var deferred = $q.defer();
            service.collection[service.current].customGETLIST(type).then(function(response) {
                if (_.isFunction(callback))
                    callback(response);
                deferred.resolve();
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }
    }
})();
