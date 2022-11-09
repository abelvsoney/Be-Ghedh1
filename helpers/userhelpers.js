var db = require('../database/connection');
var collections = require('../database/collections');
var collection = require('../database/collections');
const bcrypt = require('bcrypt');
const { response } = require('express');
const { ObjectId } = require('mongodb');
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
let uniqueotp;

module.exports={
    doSignup:async function(userData) {
        await db.get().collection(collections.USER_COLLECTION).deleteMany({verified:false})
        return new Promise(async function (resolve, reject) {
            var isThere = await db.get().collection(collections.USER_COLLECTION).findOne({$or : [{ email: userData.email },{number: userData.number}]})
            if (isThere) {
                resolve(false)
            } else {
                userData.blocked = false
                userData.password = await bcrypt.hash(userData.password, 10);
                userData.verified = false;
                db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((data) => {
                    resolve(data)
                })
            }
        })    
    },

    doLogin:async function(userData) {
        await db.get().collection(collections.USER_COLLECTION).deleteMany({verified:false})
        return new Promise (async (resolve, reject) => {
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ email: userData.email})
            if(user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if(status){
                        console.log("login success");
                        resolve(user)
                    }else{
                        console.log("login failed");
                        resolve(false)
                    }
                })
            }else{
                console.log("no user");
                resolve(false)
            }
        })
    },

    getAllUsers:async function(){
        await db.get().collection(collections.USER_COLLECTION).deleteMany({verified:false})
        return new Promise(async function(resolve, reject){
            let users = await db.get().collection(collections.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },

    changeStatus:function(userId){
        return new Promise (async function(resolve, reject){
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({_id : ObjectId(userId)})
            if(user.blocked == true){
                db.get().collection(collections.USER_COLLECTION).updateOne({_id: ObjectId(userId)},{
                    $set:{
                        blocked : false
                    }
                }).then((response) => {
                    resolve("unblocked")
                })
            } else {
                db.get().collection(collections.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                    $set: {
                        blocked: true
                    }
                }).then((response) => {
                    resolve("blocked")
                })
            }
        })
    },

    deleteUser:function(id){
        return new Promise (function (resolve, reject) {
            db.get().collection(collections.USER_COLLECTION).deleteOne({_id : ObjectId(id)}).then((response) => {
                resolve(response)
            })
        })
    },

    sendOTP:async function(email){
        otp = Math.random();
        otp = otp * 1000000;
        otp = parseInt(otp);
        uniqueotp = email+otp;
        console.log(otp);

        var mailoptions = {
            to: email,
            subject: "Otp for registration is: ",
            html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otp +"</h1>" // html body
        };

        await transporter.sendMail(mailoptions, (error, info) => {
            if (error) {
                return console.log(error);
            } else {
                console.log('Message sent: %s', info.messageId);
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                return true;
            }
        })
    },

    verifyOTP: async function(otpfromuser, email){
        if(otpfromuser == uniqueotp){
            await db.get().collection(collections.USER_COLLECTION).updateOne({email: email}, {$set: {verified: true}})
            return true;
        } else {
            return false;
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
    },
    isUser:async function(email){
        var isThere = await db.get().collection(collections.USER_COLLECTION).findOne({email:email , blocked:false});
        if(isThere){
            return isThere;
        }
        else {
            return false;
        }
        
    },

    verifyOTPChangePassword: async function(otpfromuser, email){
        console.log(email+otpfromuser,"nnn",uniqueotp);
        if(email+otpfromuser == uniqueotp){
            console.log('in truw');
            return true;
        } else {
            console.log('in false');
            return false;
        }
    },

    changePassword: async function(newpassword, email) {
        return new Promise(async function(resolve, reject) {
            newpassword = await bcrypt.hash(newpassword, 10);
        db.get().collection(collections.USER_COLLECTION).updateOne({email: email}, {
            $set:{
                password: newpassword
            }
        }).then((response) => {
            resolve(response)
        })
        })
       
    },

    getUserDetails: function(userId) {
        return new Promise(function(resolve, reject) {
            db.get().collection(collections.USER_COLLECTION).findOne({_id: ObjectId(userId)}).then((response) => {
                resolve(response);
            })
        })
    },

    editProfile:async function(userData, userId) {
        return new Promise(async function(resolve, reject) {
            var currentuser = await db.get().collection(collections.USER_COLLECTION).findOne({_id: ObjectId(userId)});
            console.log(currentuser,"\ncurrent user")
            if(currentuser.number == userData.number && currentuser.email == userData.email) {
                console.log("1");
                db.get().collection(collections.USER_COLLECTION).updateOne({_id: ObjectId(userId)}, {
                    $set:{
                        name: userData.name
                    }
                }).then(() => {
                    resolve(true)
                })
                
            } else if(currentuser.number == userData.number) {
                console.log("2");
                var isThere = await db.get().collection(collections.USER_COLLECTION).findOne({email: userData.email})
                if(isThere) {
                    resolve(false)
                } else {
                    db.get().collection(collections.USER_COLLECTION).updateOne({_id: ObjectId(userId)}, {
                        $set:{
                            name: userData.name,
                            email: userData.email
                        }
                    }).then(() => {
                        resolve(true)
                    })
                }
            } else if(currentuser.email == userData.email) {
                console.log("3");
                var isThere = await db.get().collection(collections.USER_COLLECTION).findOne({number: userData.number})
                if(isThere) {
                    resolve(false)
                } else {
                    db.get().collection(collections.USER_COLLECTION).updateOne({_id: ObjectId(userId)}, {
                        $set:{
                            name: userData.name,
                            number: userData.number
                        }
                    }).then(() => {
                        resolve(true)
                    })
                }
            } else {
                console.log("4");
                var isThere = await db.get().collection(collections.USER_COLLECTION).findOne({ $or: [{ email: userData.email }, { number: userData.number }] })
                if (isThere) {
                    resolve(false)
                } else {
                    db.get().collection(collections.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                        $set: {
                            name: userData.name,
                            email: userData.email,
                            number: userData.number
                        }
                    }).then(() => {
                        resolve(true)
                    })
                }
            }
            
        })
    },

    getAllUserOrders: () => {
        return new Promise(async (resolve, reject) => {
          let userPro = await db
            .get()
            .collection(collection.ORDER_COLLECTION)
            .find()
            .sort({ date: -1 })
            .toArray();
          console.log(userPro);
          resolve(userPro);
        });
      },
      getAllDeliveredOrder: () => {
        return new Promise(async (resolve, reject) => {
          let report = await db
            .get()
            .collection(collection.ORDER_COLLECTION)
            .find({ status: "Delivered" })
            .toArray();
          console.log("repo", report);
          resolve(report);
        });
      },
      getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
          let users = await db
            .get()
            .collection(collection.USER_COLLECTION)
            .find()
            .toArray();
          // console.log(users +'\n helo')
          resolve(users);
        });
      }
}