/* ABS MAILER */

var nodemailer = require("nodemailer");
    
exports.send = function(config, data) { 
    
    var smtpTransport = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        auth: {
            user: config.user,
            pass: config.pass
        }
    }); 

    smtpTransport.sendMail({
        from: data.from, // sender address
        to: data.to, // comma separated list of receivers
        cc: data.cc,
        subject: data.subject, // Subject line
        html:  data.data // html body
        }, function(error, response){
            if(error){
                console.log(error);
            }else{
                console.log("Mail sent: " + response.message);
            }
        });
    
}