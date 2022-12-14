const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: 'Gmail',

    auth :{
        user: "beghedh@gmail.com",
        pass: 'ojqtddqtopvcsieu'
    }
});

let otp;

module.exports= {
    sendOTP:function(email){
        otp = Math.random();
        otp = otp * 1000000;
        otp = parseInt(otp);
        console.log(otp);

        var mailoptions = {
            to: email,
            subject: "Otp for registration is: ",
            html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otp +"</h1>" // html body
        };

        transporter.sendMail(mailoptions, (error, info) => {
            if (error) {
                return console.log(error);
            } else {
                console.log('Message sent: %s', info.messageId);
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                return "send";
            }
        })
    },

    verifyOTP: function(otpfromuser){
        if(otpfromuser == otp){
            return "verified";
        } else {
            return "wrong";
        }
    },

    resendOTP: function(email){
        var mailoptions = {
            to: email,
            subject: "Otp for registration is: ",
            html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otp +"</h1>" // html body
        };

        transporter.sendMail(mailoptions, (error, info) => {
            if (error) {
                return console.log(error);
            } else {
                console.log('Message sent: %s', info.messageId);
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                return "send";
            }
        })
    }
}