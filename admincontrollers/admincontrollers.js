var express = require('express');
var router = express.Router();
var db = require('../database/connection')
var credentials = require('./admincredentials')
var jwt = require('jsonwebtoken')
var userhelpers = require('../helpers/userhelpers')
const { response } = require('express')
const brandhelpers = require('../helpers/brandhelpers')
const categoryhelpers = require('../helpers/categoryhelpers')
const producthelpers = require('../helpers/producthelpers')
const emailotp = require('../userauthentication/emailotp')
const fileUpload = require('express-fileupload');
const carthelpers = require('../helpers/carthelpers');
const orderhelpers = require('../helpers/orderhelpers');
const bannerhelpers = require('../helpers/bannerhelpers');
const charthelpers = require('../helpers/charthelpers');
router.use(fileUpload())
// const multer = require('multer')
require('dotenv').config()
var chartjs = require('chart.js')

// const storage = multer.diskStorage({
//     destination: function(req, file, cb){
//         cb(null, '../public/ImageSite')
//     },
//     filename: function(req, file, cb) {
//         cb(null, file.originalname)
//     }
// })

// const upload = multer({storage : storage})


module.exports = {
    //admin dashboard
    getDasboard:function(req, res) {
        charthelpers.findOrdersByDay().then((data) => {
            res.render('admin/dashboard',{admin:req.cookies.admintoken, dashboard:true, data});
        })
        
    },

    // login and logout
    getLogin:function(req, res){
        console.log(req.cookies)
        res.render('admin/adminlogin',{loginErr:req.cookies.loginErr, adminLogin:true});
        res.clearCookie('loginErr')
    },

    postLogin:function(req,res){
        if(req.body.email === credentials.email && req.body.password === credentials.password){
            const admintoken = jwt.sign(credentials, process.env.ADMIN_SECRET_KEY, {expiresIn:'7d'});
            res.cookie('admintoken', admintoken, {httponly:true});
            res.redirect('/admin')
        }else{
            res.cookie('loginErr',"Invalid Username or Password")
            res.redirect("/admin/login")
        }  
    },

    getLogout:function(req, res){
        res.clearCookie('admintoken');
        res.redirect('/admin')
    },

    // users
    getViewusers:function(req, res){
        userhelpers.getAllUsers().then((users)=>{
            let customers = users
            res.render('admin/viewusers', {admin:req.cookies.admintoken, users:true, customers})
        });
    },

    getBlockuser:function(req, res){
        userhelpers.changeStatus(req.query.id).then((response) => {
            res.redirect('/admin/viewusers')
        })
        
    },

    getDeleteUser :function(req, res) {
        userhelpers.deleteUser(req.query.id).then((response) => {
            res.redirect('/admin/viewusers')
        })
    },

    //brand
    getViewBrands:function(req, res){
        brandhelpers.getAllBrands().then((response) => {
            let brands = response;
            res.render('admin/viewbrands',{admin:req.cookies.admintoken, brands})
        })
        
    },
    
    postAddBrand:function(req, res){
        brandhelpers.addBrand(req.body).then((response) => {
            console.log(response)
            res.redirect('/admin/viewbrands')
        })
    },

    getDeleteBrand:function(req, res){
        brandhelpers.deleteBrand(req.query.id, req.query.brandname).then((response) =>{
            res.redirect('/admin/viewbrands')
        })
    },

    //categories
    getViewCategories:function(req, res){
        categoryhelpers.getAllCategories().then((response) =>{
            brandhelpers.getAllBrands().then((brand) => {
                res.render('admin/viewcategories',{admin:req.cookies.admintoken, categories:response, brand})
            }) 
        })
    },

    postAddCategory:function(req, res){
        categoryhelpers.addCategory(req.body).then((response) =>{
            console.log(response)
            res.redirect('/admin/viewcategories')
        })
    },

    getDeleteCategory:function(req, res){
        console.log(req.query.categoryId);
        categoryhelpers.deleteCategory(req.query.categoryId).then((response) =>{
            res.redirect('/admin/viewcategories')
        })
    },

    //product
    
    getViewproducts:function(req, res){
        producthelpers.getAllProducts().then((product) => {
            res.render('admin/viewproducts', {admin:req.cookies.admintoken, products:true, product})
        })
        
    },
    
    getAddProduct:function(req, res){
        brandhelpers.getAllBrands().then((response) => {
            res.render('admin/choosebrand', {admin:req.cookies.admintoken, products:true, brand:response})
        }) 
    },

    postAddProduct:function(req, res){
        categoryhelpers.getCategorybyBrand(req.body.brand).then((category) => {
            if (Object.keys(category).length == 0){
                res.cookie('no-category-error',"No Category Added for this brand")
                res.redirect("/admin/addproduct")
            } else {
                res.render('admin/addproduct', {admin:true, category, brand_name:req.body.brand, products:true})
            }
        })
        
    },

    postAddProductFinal:function(req, res){
        console.log(req.body);
        // console.log(req.files+"\nimage");

        

        producthelpers.addProduct(req.body).then((response) => {
            if(response) {
                res.redirect('/admin/viewproducts')
            } else {
                res.cookie("product-creation-error", "Product already exists")
                res.redirect('/admin/viewproducts')
            }
        })
    },

    getDeleteProduct:function(req, res){
        producthelpers.deleteProduct(req.query.id).then((response) => {
            res.redirect('/admin/viewproducts')
        })
    },

    getEditProduct:function(req, res){
        producthelpers.getProductById(req.query.id).then((response) => {
            categoryhelpers.getCategorybyBrand(response.brand_name).then((category) => {
                res.render('admin/editproduct',{admin:req.cookies.admintoken, response, category})
            })
            
        })
    },

    postEditProduct:function(req, res){
        producthelpers.updateProduct(req.query.id, req.body).then((response) => {
            res.redirect('/admin/viewproducts')
        })
    },

    changeStatus:function(req, res){
        producthelpers.changeStatus(req.query.id).then((response) => {
            if(response){
                res.redirect('/admin/viewproducts')
            }
        })
    },



    //trial

    otplogin:function(req, res){
        res.render('admin/otplogin',{adminLogin:true})
    },

    postSend:function(req, res){
        console.log(req.body.email);
        emailotp.sendOTP(req.body.email)
        res.render('admin/verifyotp',{email:req.body.email})
    },

    postVerify:function(req, res){
        console.log(req.body)
        if(emailotp.verifyOTP(req.body.otp) == "verified"){
            res.send("verified")
        } else{
            res.send("npopooooo")
        }
    },

    getViewBanners: function(req, res) {
        bannerhelpers.getAllBanners().then((banners) => {
            res.render('admin/viewbanners',{admin: true, banners})
        })
        
    },

    postAddBanner: function(req, res) {
        console.log(req.body);
        bannerhelpers.addNewBanner(req.body).then((response) => {
            res.redirect('/admin/viewbanners')
        })
    },

    getViewOrders: function(req, res) {
        orderhelpers.getAllOrders().then((orders) => {
            orders.forEach(order => {
                if(order.status == "Cancelled") {
                    order.cancelled = true
                } else if (order.status == "pending") {
                    order.pending = true
                } else if(order.status == "placed") {
                    order.placed = true
                } else if (order.status == "Delivered") {
                    order.delivered = true
                } else {
                    order.shipped = true;
                }
            });
            // console.log(orders)
            res.render('admin/vieworders',{admin:true, orders})
        })
    },

    getCancelOrder: function(req, res) {
        orderhelpers.cancelOrder(req.query.id).then((response) => {
            res.redirect('/admin/vieworders')
        })
    },

    postEditBanner: function(req, res) {
        bannerhelpers.updateBanner(req.query.id, req.body).then((response) => {
            res.redirect('/admin/viewbanners')
        })
    },

    getEditBanner: function(req, res) {
        bannerhelpers.getBannerbyId(req.query.id).then((response) => {
            res.render('admin/editbanner',{admin: true, response})
        })
    },

    getDeleteBanner: function(req, res) {
        bannerhelpers.deleteBanner(req.query.id).then((response) => {
            res.redirect('/admin/viewbanners')
        })
    },

    getchangeOrderStatus: function(req, res) {
        console.log(req.query.status);
        orderhelpers.changeOrderStatus(req.query.id, req.query.status).then(() => {
            // console.log("inside hrrrr");
            res.redirect('/admin/vieworders')
        })
    },

    getDay: function(req, res) {
        charthelpers.findOrdersByDay().then((data) => {
            console.log("data\n",data)
            res.json(data)
        })
    }
}