var http = require('http');
var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();
var mongoose = require('mongoose');

//handle static content
app.use(express.static(__dirname + '/public'));

//Express middleware bodyparser
app.use(bodyParser.urlencoded({    
  extended: false
}));

// Database
mongoose.connect('mongodb://localhost/XXXX');

var Schema = mongoose.Schema;  

var Tip = new Schema({  
    tip_date: { type: Date, default: Date.now },
    name : { type: String, required: true },  
    title: { type: String, required: true },  
    phone: { type: String, unique: true }    
});

var TipModel = mongoose.model('Tip', Tip);

app.get('/show', function (req, res){
  return TipModel.find(function (err, tips) {
    if (!err) {
        console.log(tips.length);
      return res.send(tips);
    } else {
      return console.log(err);
    }
  });
});

//**********************************DATABASE END*****************************

app.post('/', function(req, res) {
    console.log('POST');
    
    var data =  'Title: '+ req.body.title + ' \n '+
                'Name: '+ req.body.name + ' \n '+
                'Title: '+ req.body.title + ' \n '+
                'Institution: '+ req.body.institution + ' \n '+
                'Phone: '+ req.body.phone + ' \n '+
                'Email: '+ req.body.email + ' \n '
                ;
    console.log(data);
    var name = req.body.name,
        color = req.body.color;
    
    
    var nodemailer = require("nodemailer");
 
    var smtpTransport = nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        auth: {
            user: "XXXXX",
            pass: "XXXXX"
        }
    }); 

    smtpTransport.sendMail({
        from: "SW <XXXXX>", // sender address
        to: "SW <XXXXXXX>", // comma separated list of receivers
        subject: "New Tip", // Subject line
        text:  data // plaintext body
        }, function(error, response){
            if(error){
                console.log(error);
            }else{
                console.log("Mail sent: " + response.message);
            }
        });
   
    // ...
    res.end();
});

app.listen(process.env.PORT || 3000);

function notFound(res) {

    res.statusCode = 404;
    res.setHeader('Content-type','text/plain');
    res.end('Resource not found');
    
}

function serverStaticContent() {
    
    
}

function sendResponse(res) {
    
    fs.readFile('./index.html', function(err, data) {
    
        res.statusCode=200;
        //res.setHeader('content-type','text/html');
        //res.setHeader('content-length', Buffer.byteLength(resData));
        res.end(data);
    
    
    });
    /*var formdata = '<form action="/" method="post" enctype="multipart/form-data" >'+                 
                '   <input type="file" name="file"/>'+
                  '      <input type="Submit" value="Upload"/>        '+
                '</form>';
    
    var resData  = ' <div>'+ formdata+'<br/></div> ';*/
       
    
}