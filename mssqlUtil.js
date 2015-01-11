/* SQL SERVER */

/* import MS SQL Server */
var sql = require('mssql');

exports.executeQuery = function(config, query, cb) {
   
    if(!config) {
    
        var config = {
            user: 'xx',
            password: 'xx',
            server: 'xx\\xx', // You can use 'localhost\\instance' to connect to named instance
            database: 'xx',

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