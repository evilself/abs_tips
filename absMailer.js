/* ABS MAILER */

var nodemailer = require("nodemailer");
    
exports.send = function(from, to, subject, body) { 
    
    var smtpTransport = nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        auth: {
            user: "XX",
            pass: "XX"
        }
    }); 

    smtpTransport.sendMail({
        from: from, // sender address
        to: to, // comma separated list of receivers
        subject: subject, // Subject line
        html:  body // plaintext body
        }, function(error, response){
            if(error){
                console.log(error);
            }else{
                console.log("Mail sent: " + response.message);
            }
        });
    
}