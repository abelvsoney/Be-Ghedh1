const jwt = require('jsonwebtoken');
var credentials = require('../admincontrollers/admincredentials');
require('dotenv').config()

module.exports={

    adminJWTTokenAuth:function(req, res, next){
        const admintoken = req.cookies.admintoken;   
        try{
            const admin = jwt.verify(admintoken, process.env.ADMIN_SECRET_KEY);
            req.admin=admin;
            if (credentials.blocked == true) {
                res.clearCookie('admintoken');
                res.redirect('/admin/login')
            } else {
                if (admin.blocked == credentials.blocked) {
                    next();
                } else {
                    res.clearCookie('admintoken');
                    return res.redirect('/admin/login');
                }
            }
        }catch (err){
            res.clearCookie('admintoken');
            return res.redirect('/admin/login')
        }
    },
    adminLoggedIn:function(req, res, next){
        const admintoken = req.cookies.admintoken;
        try{
            const admin = jwt.verify(admintoken, process.env.ADMIN_SECRET_KEY);
            req.admin=admin;
            return res.redirect('/admin')
        }catch (err){
            res.clearCookie('admintoken');
            next();
        }
    }
}