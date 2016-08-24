(function() {
    'use strict';

    angular
        .module('youproductiveApp')
        .factory('SQliteDB', SQliteDB);

    SQliteDB.$inject = ['$q', 'DB_CONFIG'];

    function SQliteDB($q, DB_CONFIG) {
        var self = this;
        self.db = null;


        self.init = function() {
            if (typeof(window.openDatabase) !== 'undefined') {
                self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', 2 * 1024 * 1024);

                angular.forEach(DB_CONFIG.tables, function(table) {
                    var columns = [];
                    var keys = [];

                    angular.forEach(table.columns, function(column) {
                        columns.push(column.name + ' ' + column.type);
                    });

                    angular.forEach(table.constraint, function(column) {
                        keys.push('FOREIGN KEY (' + column.parent_id + ') REFERENCES ' + column.table + '(' + column.field + ')');
                    });

                    if (table.constraint && table.constraint.length > 0) {
                        var ref = keys.join(',');
                        var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ',' + ref + ')';

                        self.query(query);
                        // console.log('Table with keys ' + table.name + ' initialized');
                    } else {
                        var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';

                        self.query(query);
                        // sconsole.log('Table ' + table.name + ' initialized');
                    }
                });
            }
        };

        self.query = function(query, bindings) {
            bindings = typeof bindings !== 'undefined' ? bindings : [];
            var deferred = $q.defer();
            if (typeof(window.openDatabase) !== 'undefined') {
                self.db.transaction(function(transaction) {
                    // console.log('query: ', query);
                    // console.log('bindings: ', bindings);
                    transaction.executeSql(query, bindings, function(transaction, result) {
                        deferred.resolve(result);
                    }, function(transaction, error) {
                        console.log('error: ', error);
                        deferred.reject(error);
                    });
                });
            } else {
                deferred.resolve();
            }

            return deferred.promise;
        };

        self.fetchAll = function(result) {
            var output = [];
            for (var i = 0; i < result.rows.length; i++) {
                output.push(result.rows.item(i));
            }
            return output;
        };

        self.recordCount = function(result) {
            return result.rows.length;
        };

        self.fetch = function(result) {
            return result.rows.item(0);
        };


        return self;
    }

})();
