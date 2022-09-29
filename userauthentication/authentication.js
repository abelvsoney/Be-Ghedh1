const jwt = require('jsonwebtoken');
var db = require('../database/connection');
var collections = require('../database/collections')
require('dotenv').config()

module.exports={

    userJWTTokenAuth:async function(req, res, next){
        const token = req.cookies.token;
        try{
            const user = jwt.verify(token, process.env.USER_SECRET_KEY);
            // console.log(user)
            let userData = await db.get().collection(collections.USER_COLLECTION).findOne({ email: user.email })
            // console.log(userData);
            if (userData.blocked == true) {
                res.clearCookie('token');
                res.cookie('blocked',"User blocked")
                res.redirect('/login')
            } else {
                req.user = user;
                next();
            }
        }catch (err){
            res.clearCookie('token');
            return res.redirect('/login')
        }
    },
    userLoggedIn:function(req, res, next){
        const token = req.cookies.token;
        console.log(token);
        try{
            const user = jwt.verify(token, process.env.USER_SECRET_KEY);
            req.user=user;
            return res.redirect('/')
        }catch (err){
            res.clearCookie('token');
            next();
        }
    },
    isUnblocked:async function(req, res, next){
        const token = req.cookies.token;
        try{
            const user = jwt.verify(token, process.env.USER_SECRET_KEY);
            let userData = await db.get().collection(collections.USER_COLLECTION).findOne({ email: user.email })
            if (userData.blocked == true) {
                res.clearCookie('token');
                next();
            } else {
                req.user = user;
                next();
            }
        }catch (err){
            res.clearCookie('token');
            next();
        }
    }
}