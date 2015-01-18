/* ABS Tips app created by BorisM @ ABS on 01.10.2015 */

/* import Express */
var express = require('express');

/* Express v4 http logger */
var morgan = require('morgan');
var fs = require('fs');
var propReader = require('properties-reader');
var bodyParser = require('body-parser');
var app = express();

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}))


/* This is my custom ms sql module. */
var mssqlutil = require('./mssqlUtil');

/* This is my custom mailer */
var mailer = require('./absMailer');

//handle static content in Express
app.use(express.static(__dirname + '/public'));

//Express middleware bodyparser
/* The extended argument allows to choose between parsing the urlencoded data with the querystring library (when false) or the qs library (when true). The "extended" syntax allows for rich objects and arrays to be encoded into the urlencoded format, allowing for a JSON-like experience with urlencoded. For more information, please see the qs library. */
app.use(bodyParser.urlencoded({    
  extended: false
}));

/* Set the properties file here */
var properties = propReader('config.properties');

var smtp = getSMTP(properties);
var ds = getDS(properties);

/* AJAX get the most recent tips */
app.get('/getTips', function(req, res){

    var selectQuery = 'select top 10 * from tip order by tip.TIP_DATE desc';
    mssqlutil.executeQuery(ds, selectQuery, function(err, data) {       
        
        if (err) {
            console.log(err);
            res.statusCode = 500;
            res.end('Oops...there was an error getting the tips...');
        }
        
        if (data.length < 1) res.end('No submitted tips');
        
        var myJsonString = JSON.stringify(data);        
        res.end(myJsonString);  
    });

});

/* AJAX get the most recent tips */
app.get('/getUsers', function(req, res){

    var selectQuery = 'select TIP_USER_NAME, TIP_USER_EMAIL from ABS_USER order by ABS_USER.TIP_USER_NAME';
    mssqlutil.executeQuery(ds, selectQuery, function(err, data) {       
        
        if (err) {
            console.log(err);
            res.statusCode = 500;
            res.end('Oops...there was an error getting the users...');
        }
        
        var myJsonString = JSON.stringify(data);        
        res.end(myJsonString);  
    });

});

/* AJAX get tips based on search criteria */
app.post('/getSearchResults', function(req, res){    
    
    var lookupUserQuery = " select TIP_USER_ID from ABS_USER where ABS_USER.TIP_USER_NAME like '%" +req.body.userSelectName+"%'";
    var userID = '';
    //console.log(userID);
    
    mssqlutil.executeQuery(ds, lookupUserQuery, function(err, records) {
       
        if (err) {
            console.log(err);
            res.statusCode = 500;
            res.end('Oops...there was an error getting the ID for this user...');
        }
        else {
            //console.log(records);
            var myJsonString = JSON.stringify(records);
            var array = JSON.parse(myJsonString);
            //console.log(myJsonString);
            for (var i = 0; i < array.length; i++) {
                
                userID = array[i].TIP_USER_ID;
            }
            
            var selectQuery = 'select * from tip inner join abs_user on abs_user.tip_user_id = tip.tip_abs_user_id where tip.tip_abs_user_id = '+ userID ;    
           
            if(req.body.fromDate) {
                //console.log('From Date Provided');
                selectQuery += " and tip.TIP_DATE >= '"+ req.body.fromDate +"' ";
            }
            if(req.body.toDate) {
                //console.log('To Date Provided');
                selectQuery += " and tip.TIP_DATE <= '"+ req.body.toDate +"' ";
            }
            
            selectQuery += ' order by tip.TIP_DATE desc';
            
            mssqlutil.executeQuery(ds, selectQuery, function(err, data) {       

                if (err) {
                    console.log(err);
                    res.statusCode = 500;
                    res.end('Oops...there was an error getting the results...');
                }
                
                if (data.length < 1) { 
                    res.end('No submitted tips for this user or this date period');
                }
                //console.log(data);
                var myJsonString = JSON.stringify(data);        
                res.end(myJsonString);  
            });  
        }
    });  

     
});

/* AJAX POST */
app.post('/', function(req, res) { 
    
    var lookupUserQuery = " select TIP_USER_ID from ABS_USER where ABS_USER.TIP_USER_NAME like '%" +req.body.userSelectName+"%'";
    var userID = '';
    //console.log(lookupUserQuery)
    
    mssqlutil.executeQuery(ds, lookupUserQuery, function(err, records) {
       
        if (err) {
            console.log(err);
            res.statusCode = 500;
            res.end('Oops...there was an error getting the id for this user when submitting...');
        }
        else {
            //console.log(records);
            var myJsonString = JSON.stringify(records);
            var array = JSON.parse(myJsonString);
            //console.log(myJsonString);
            for (var i = 0; i < array.length; i++) {
                
                userID = array[i].TIP_USER_ID;
            }
            var toBeInserted = {
        "submitter":  userID,
        "submitterEmail":  req.body.userSelectEmail,
        "name":  sanitize(req.body.name),
        "title": sanitize(req.body.title),
        "institution": sanitize(req.body.institution),
        "address": sanitize(req.body.address),
        "citystatezip": sanitize(req.body.citystatezip),
        "email": req.body.email,
        "phone": req.body.phone,
        "instructions": sanitize(req.body.message)
    };    
    
          //  var sss = toBeInserted.instructions;
          //  sss = sss.replace(/'/g, "''");
         //   toBeInserted.instructions = sss;
  //  console.log(sss);
       // return ;
    var data =  '<table style="border:1px solid #CCCCCC;"><tr><td style="width:25%;text-align:right"><strong>Submitter</strong></td><td style="color: #336799; width:75%"> '+ req.body.userSelectName + '</td></tr> '+                
                '<tr><td style="text-align:right"><strong>Name</strong></td><td style="color: #336799; width:75%"> '+ req.body.name + ' </td></tr> '+
                '<tr><td style="text-align:right"><strong>Title</strong></td><td style="color: #336799; width:75%"> '+ req.body.title + ' </td></tr> '+
                '<tr><td style="text-align:right"><strong>Institution</strong></td><td style="color: #336799; width:75%"> '+ req.body.institution + ' </td></tr> '+
                '<tr><td style="text-align:right"><strong>Address</strong></td><td style="color: #336799; width:75%"> '+ req.body.address + '</td></tr> '+
                '<tr><td style="text-align:right"><strong>City, State, Zip</strong></td><td style="color: #336799; width:75%"> '+ req.body.citystatezip + '</td></tr>'+
                '<tr><td style="text-align:right"><strong>Phone</strong></td><td style="color: #336799; width:75%"> '+ req.body.phone + '</td></tr> '+
                '<tr><td style="text-align:right"><strong>Email</strong></td><td style="color: #336799; width:75%"> '+ req.body.email + ' </td></tr> '+
                '<tr><td style="text-align:right;margin-top:5px"><strong>Instructions</strong></td><td style="color: #336799; width:75%"> '+ req.body.message + '  </td></tr></table> '
                ;
    
    //var data = '<div style="font-size:24px; font-weight:bold">ARSENAL</div>';
    
    var createQuery = "INSERT INTO tip (TIP_ABS_USER_ID, TIP_CONTACT_NAME, TIP_CONTACT_TITLE, TIP_INSTITUTION, TIP_ADDRESS, TIP_CITYSTATEZIP, TIP_EMAIL, TIP_PHONE, TIP_INSTRUCTIONS)                                    VALUES ('"+toBeInserted.submitter+"','"+toBeInserted.name+"','"+toBeInserted.title+"', '"+toBeInserted.institution+"', '"+toBeInserted.address+"',                                        '"+toBeInserted.citystatezip+"', '"+toBeInserted.email+"', '"+toBeInserted.phone+"', '"+toBeInserted.instructions+"')";
   
    mssqlutil.executeQuery(ds, createQuery, function(err, records) {
       
        if (err) {
            console.log(err);
            res.statusCode = 500;
            res.end('Oops...there was an error saving the tips...');
        } else {
           // console.log(data);
            /* send mail */
            var emailData = {
                "from":"bmechkov@abs-ok.com",
                "to":"bmechkov@abs-ok.com",
                "cc": req.body.userSelectEmail,
                "subject":"New Tip!",            
                "data": data
            };
            //mailer.send(smtp, emailData);        
        }
        res.end();  
    });
        }        
    });
    
    
});

app.get("*", function(req, res){
    res.redirect('/');
});

/* Start my server on port 3000 */
app.listen(process.env.PORT || 3000);

/***************************** Utility functions ******************************/

/* Populate SMTP info */
function getSMTP(propFile) {
    
    return { 
                "host":propFile.path().office365.host,
                "port":propFile.path().office365.port,
                "user":propFile.path().office365.user,
                "pass":propFile.path().office365.pass   
            };
    
}

/* Populate Data Source info */
function getDS(propFile) {
    return { 
                "user":propFile.path().sqlsvrds.user,
                "password":propFile.path().sqlsvrds.password,
                "server": (propFile.path().sqlsvrds.server +'\\'+propFile.path().sqlsvrds.instance),                
                "database":propFile.path().sqlsvrds.database,
                "options": { encrypt: propFile.path().sqlsvrds.encrypt }
            };
    
}


//Sanitize input for special characters
function sanitize(value) {    
    return value.replace(/'/g, "''");    
}