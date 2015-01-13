/* SQL SERVER */

/* import MS SQL Server */
var sql = require('mssql');

exports.executeQuery = function(config, query, cb) {
   
    if(!config) {
    
        var config = {
            user: config.user,
            password: config.password,
            server: (config.server+'\\'+config.instance), // You can use 'localhost\\instance' to connect to named instance
            database: config.database,

            options: {
                encrypt: false // Use this if you're on Windows Azure
            }
        }    
    } 
   
    sql.connect(config, function(err) {
        // ... error checks
        if (err) throw err;        

        var request = new sql.Request();
        request.query(query, function(err, recordset) {
            // ... error checks
            if (err) return cb(err, null);
            
             cb(null, recordset);
        });

    });

}