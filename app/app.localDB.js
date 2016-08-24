(function() {
    'use strict';

    angular
        .module('youproductiveApp')

    .constant('DB_CONFIG', {
        name: 'DB',
        tables: [{
            name: 'tasks',
            columns: [
                { name: 'id', type: 'INTEGER PRIMARY KEY' },
                { name: 'name', type: 'VARCHAR' },
                { name: 'description', type: 'VARCHAR' },
                { name: 'status', type: 'VARCHAR' },
                { name: 'start_date', type: 'TEXT' },
                { name: 'end_date', type: 'TEXT' },
                { name: 'completion_date', type: 'TEXT' },
                { name: 'starred', type: 'INTEGER' },
                { name: 'priority', type: 'TEXT' },
                { name: 'estimate_time', type: 'REAL' },
                { name: 'time_spent', type: 'TEXT' },
                { name: 'parent_task_id', type: 'INTEGER' },
                { name: 'original_task_id', type: 'INTEGER' },
                { name: 'allowed_user_ids', type: 'VARCHAR' },
                { name: 'tags_ids', type: 'VARCHAR' },
                { name: 'public_key', type: 'VARCHAR' },
                { name: 'project_id ', type: 'INTEGER' },
                { name: 'user_id', type: 'INTEGER' },
                { name: 'folder_id', type: 'INTEGER' },
                { name: 'created_at', type: 'TEXT' },
                { name: 'updated_at', type: 'TEXT' }
            ],
            constraint: []
        }, {
            name: 'comments',
            columns: [
                { name: 'id', type: 'INTEGER PRIMARY KEY' },
                { name: 'comment', type: 'TEXT' },
                { name: 'parent_comment_id', type: 'INTEGER' },
                { name: 'status', type: 'VARCHAR' },
                { name: 'type', type: 'TEXT' },
                { name: 'project_id', type: 'INTEGER' },
                { name: 'user_id', type: 'INTEGER' },
                { name: 'task_id', type: 'INTEGER' },
                { name: 'organization_id', type: 'INTEGER' },
                { name: 'created_at', type: 'TEXT' },
                { name: 'updated_at', type: 'TEXT' }
            ],
            constraint: [
                { parent_id: 'task_id', table: 'tasks', field: 'id' }
            ]
        }, {
            name: 'files',
            columns: [
                { name: 'id', type: 'INTEGER PRIMARY KEY' },
                { name: 'file_name', type: 'TEXT' },
                { name: 'hash', type: 'TEXT' },
                { name: 'mime', type: 'TEXT' },
                { name: 'type', type: 'TEXT' },
                { name: 's3_file_uri', type: 'TEXT' },
                { name: 'project_id', type: 'INTEGER' },
                { name: 'organization_id', type: 'INTEGER' },
                { name: 'task_id', type: 'INTEGER' },
                { name: 'user_id', type: 'INTEGER' },
                { name: 'comment_id', type: 'INTEGER' },
                { name: 'created_at', type: 'TEXT' },
                { name: 'updated_at', type: 'TEXT' }
            ],
            constraint: []
        }, {
            name: 'tags',
            columns: [
                { name: 'id', type: 'INTEGER PRIMARY KEY' },
                { name: 'name', type: 'TEXT' },
                { name: 'created_at', type: 'TEXT' },
                { name: 'updated_at', type: 'TEXT' }
            ],
            constraint: []
        }, {
            name: 'tags_union',
            columns: [
                { name: 'id', type: 'INTEGER PRIMARY KEY' },
                { name: 'tag_id', type: 'INTEGER' },
                { name: 'associated_id', type: 'INTEGER' },
                { name: 'department', type: 'TEXT' },
                { name: 'user_id', type: 'INTEGER' },
                { name: 'created_at', type: 'TEXT' },
                { name: 'updated_at', type: 'TEXT' }
            ],
            constraint: []
        }, {
            name: 'notes',
            columns: [
                { name: 'id', type: 'INTEGER PRIMARY KEY' },
                { name: 'note', type: 'TEXT' },
                { name: 'type', type: 'TEXT' },
                { name: 'associated_id', type: 'INTEGER' },
                { name: 'user_id', type: 'INTEGER' },
                { name: 'created_at', type: 'TEXT' },
                { name: 'updated_at', type: 'TEXT' }
            ],
            constraint: []
        }, {
            name: 'users',
            columns: [
                { name: 'id', type: 'INTEGER PRIMARY KEY' },
                { name: 'email', type: 'TEXT' },
                { name: 'username', type: 'VARCHAR' },
                { name: 'first_name', type: 'VARCHAR' },
                { name: 'last_name', type: 'VARCHAR' },
                { name: 'password', type: 'VARCHAR' },
                { name: 'status', type: 'INTEGER' },
                { name: 'email_verification_code', type: 'VARCHAR' },
                { name: 'public_key', type: 'VARCHAR' },
                { name: 'timezone', type: 'VARCHAR' },
                { name: 'country    ', type: 'VARCHAR' },
                { name: 'created_at', type: 'TEXT' },
                { name: 'updated_at', type: 'TEXT' }
            ]
        }, {
            name: 'folders',
            columns: [
                { name: 'id', type: 'INTEGER PRIMARY KEY' },
                { name: 'name', type: 'TEXT' },
                { name: 'description', type: 'TEXT' },
                { name: 'organize', type: 'TEXT' },
                { name: 'parent_folder_id', type: 'INTEGER' },
                { name: 'user_id', type: 'INTEGER' },
                { name: 'created_at', type: 'TEXT' },
                { name: 'updated_at', type: 'TEXT' }
            ],
            constraint: []
        }, {
            name: 'folders_union',
            columns: [
                { name: 'id', type: 'INTEGER PRIMARY KEY' },
                { name: 'folder_id', type: 'INTEGER' },
                { name: 'associated_id', type: 'INTEGER' },
                { name: 'department', type: 'TEXT' },
                { name: 'user_id', type: 'INTEGER' },
                { name: 'created_at', type: 'TEXT' },
                { name: 'updated_at', type: 'TEXT' }
            ],
            constraint: [
                { parent_id: 'folder_id', table: 'folders', field: 'id' }
            ]
        }, {
            name: 'users_tasks',
            columns: [
                { name: 'id', type: 'INTEGER PRIMARY KEY' },
                { name: 'assignee_user_id', type: 'INTEGER' },
                { name: 'assigned_user_id', type: 'INTEGER' },
                { name: 'task_id', type: 'INTEGER' },
                { name: 'created_at', type: 'TEXT' },
                { name: 'updated_at', type: 'TEXT' }
            ],
            constraint: [
                { parent_id: 'assignee_user_id', table: 'users', field: 'id' },
                { parent_id: 'assigned_user_id', table: 'users', field: 'id' }
            ]
        }, {
            name: 'projects',
            columns: [
                { name: 'id', type: 'INTEGER PRIMARY KEY' },
                { name: 'name', type: 'TEXT' },
                { name: 'description', type: 'TEXT' },
                { name: 'public_key', type: 'TEXT' },
                { name: 'status', type: 'INTEGER' },
                { name: 'start_date', type: 'TEXT' },
                { name: 'end_date', type: 'TEXT' },
                { name: 'organization_id', type: 'INTEGER' },
                { name: 'created_at', type: 'TEXT' },
                { name: 'updated_at', type: 'TEXT' }
            ],
            constraint: []
        }, {
            name: 'logs',
            columns: [
                { name: 'id', type: 'INTEGER PRIMARY KEY' },
                { name: 'description', type: 'TEXT' },
                { name: 'type', type: 'TEXT' },
                { name: 'associated_id', type: 'INTEGER' },
                { name: 'user_id', type: 'INTEGER' },
                { name: 'created_at', type: 'TEXT' },
                { name: 'updated_at', type: 'TEXT' }
            ],
            constraint: []
        }, {
            name: 'notifications',
            columns: [
                { name: 'id', type: 'INTEGER PRIMARY KEY' },
                { name: 'description', type: 'TEXT' },
                { name: 'status', type: 'INTEGER' },
                { name: 'user_id', type: 'INTEGER' },
                { name: 'created_at', type: 'TEXT' },
                { name: 'updated_at', type: 'TEXT' }
            ],
            constraint: []
        }, {
            name: 'organizations',
            columns: [
                { name: 'id', type: 'INTEGER PRIMARY KEY' },
                { name: 'name', type: 'TEXT' },
                { name: 'description', type: 'TEXT' },
                { name: 'user_id', type: 'INTEGER' },
                { name: 'created_at', type: 'TEXT' },
                { name: 'updated_at', type: 'TEXT' }
            ],
            constraint: []
        }, {
            name: 'url',
            columns: [
                { name: 'id', type: 'INTEGER PRIMARY KEY' },
                { name: 'url', type: 'TEXT' },
                { name: 'hash', type: 'TEXT' },
                { name: 'counter', type: 'INTEGER' },
                { name: 'created_at', type: 'TEXT' },
                { name: 'updated_at', type: 'TEXT' }
            ],
            constraint: []
        }, {
            name: 'url_shortener',
            columns: [
                { name: 'id', type: 'INTEGER PRIMARY KEY' },
                { name: 'slug', type: 'TEXT' },
                { name: 'type', type: 'TEXT' },
                { name: 'associated_id', type: 'INTEGER' },
                { name: 'user_id', type: 'INTEGER' },
                { name: 'url_id', type: 'INTEGER' },
                { name: 'created_at', type: 'TEXT' },
                { name: 'updated_at', type: 'TEXT' }
            ],
            constraint: [
                { parent_id: 'url_id', table: 'url', field: 'id' }
            ]
        }]
    });

})();