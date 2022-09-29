const twilio = require('twilio')
require('dotenv').config()

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;

const client = twilio(accountSid, authToken, {
    // Custom HTTP Client with a one minute timeout
    httpClient: new MyRequestClient(60000),
});

client.messages
    .create({
        to: '+15555555555',
        from: '+15555555551',
        body: 'Ahoy, custom requestClient!',
    })
    .then((message) => console.log(`Message SID ${message.sid}`))

module.exports ={
    verifyOTP:function(){
        
    }
}