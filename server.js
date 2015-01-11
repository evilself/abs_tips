/* ABS Tips app created by BorisM @ ABS on 01.10.2015 */

/* import Express */
var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();

/* This is my custom ms sql module. */
var mssqlutil = require('./mssqlUtil');

/* This is my custom mailer */
var mailer = require('./absMailer');

/*MongoDB and Mongoose are not going to be used in this app, since everybody at ABS and clients is using SQL Server*/
//var mongoose = require('mongoose');
// Database
//mongoose.connect('mongodb://localhost/XXXX');

/*var Schema = mongoose.Schema;  

var Tip = new Schema({  
    tip_date: { type: Date, default: Date.now },
    name : { type: String, required: true },  
    title: { type: String, required: true },  
    phone: { type: String, unique: true }    
});

var TipModel = mongoose.model('Tip', Tip);*/

/*app.get('/show', function (req, res){
  return TipModel.find(function (err, tips) {
    if (!err) {
        console.log(tips.length);
      return res.send(tips);
    } else {
      return console.log(err);
    }
  });
});*/
//*********************MONGO DB*******************************************************************************************


//handle static content in Express
app.use(express.static(__dirname + '/public'));

//Express middleware bodyparser
/* The extended argument allows to choose between parsing the urlencoded data with the querystring library (when false) or the qs library (when true). The "extended" syntax allows for rich objects and arrays to be encoded into the urlencoded format, allowing for a JSON-like experience with urlencoded. For more information, please see the qs library. */
app.use(bodyParser.urlencoded({    
  extended: false
}));


/* AJAX get the most recent tips */
app.get('/getTips', function(req, res){

    var selectQuery = 'select top 10 * from tip order by tip.TIP_DATE desc';
    mssqlutil.executeQuery(null, selectQuery, function(err, data) {       
        
        if (err) throw err;
        if(data.length < 1) res.end('No submitted tips');
        
        var myJsonString = JSON.stringify(data);        
        res.end(myJsonString);  
    });

});

/* AJAX POST */
app.post('/', function(req, res) { 
    
    var toBeInserted = {
        "submitter":  req.body.submitter,
        "name":  req.body.name,
        "title": req.body.title,
        "institution": req.body.institution,
        "address": req.body.address,
        "citystatezip": req.body.citystatezip,
        "email": req.body.email,
        "phone": req.body.phone,
        "instructions": req.body.message
    };
    
    var data =  '<strong>Submitter:</strong> '+ req.body.submitter + ' <br/> '+                
                '<strong>Name:</strong> '+ req.body.name + '  <br/> '+
                '<strong>Title:</strong> '+ req.body.title + '  <br/> '+
                '<strong>Institution:</strong> '+ req.body.institution + '  <br/> '+
                '<strong>Address:</strong> '+ req.body.address + ' <br/> '+
                '<strong>City, State, Zip:</strong> '+ req.body.citystatezip + '  <br/> '+
                '<strong>Phone:</strong> '+ req.body.phone + '  <br/> '+
                '<strong>Email:</strong> '+ req.body.email + '  <br/> '+
                '<strong>Instractions:</strong> '+ req.body.message + '  <br/> '
                ;
    
    //var data = '<div style="font-size:24px; font-weight:bold">ARSENAL</div>';
    
    var createQuery = "INSERT INTO tip (TIP_WHISTLEBLOWER, TIP_CONTACT_NAME, TIP_CONTACT_TITLE, TIP_INSTITUTION, TIP_ADDRESS, TIP_CITYSTATEZIP, TIP_EMAIL, TIP_PHONE, TIP_INSTRUCTIONS)                                    VALUES ('"+toBeInserted.submitter+"','"+toBeInserted.name+"','"+toBeInserted.title+"', '"+toBeInserted.institution+"', '"+toBeInserted.address+"',                                        '"+toBeInserted.citystatezip+"', '"+toBeInserted.email+"', '"+toBeInserted.phone+"', '"+toBeInserted.instructions+"')";
   
    mssqlutil.executeQuery(null, createQuery, function(err, records) {
       
        if (err) res.end('Tip could not be saved! Error occured...');
        else {
            console.log(data);
            /* send mail */
            var emailData = {
                "from":"BM <XX>",
                "to":"BM XX",
                "subject":"New Tip!",            
                "data": data
            };
            mailer.send(emailData.from, emailData.to, emailData.subject, emailData.data);        
        }
        res.end();  
    });
});

app.get("*", function(req, res){
    res.redirect('/');
});

/* Start my server on port 3000 */
app.listen(process.env.PORT || 3000);