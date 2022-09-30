var userhelpers = require('../helpers/userhelpers')
var producthelpers = require('../helpers/producthelpers')
var addresshelpers = require('../helpers/addresshelpers')
var carthelpers = require('../helpers/carthelpers')
var jwt = require('jsonwebtoken')
const { response } = require('express')
const orderhelpers = require('../helpers/orderhelpers')
const wishlisthelpers = require('../helpers/wishlisthelpers')
const bannerhelpers = require('../helpers/bannerhelpers')
require('dotenv').config()

// function getUserDetails (req, res){
//     let token = req.cookies.token;
//     let user = jwt.verify(token, process.env.USER_SECRET_KEY);
//     return user;
// }


module.exports={

    getHomePage: async function(req, res) {
        let token = req.cookies.token;
        if(token){
            let user = jwt.verify(token, process.env.USER_SECRET_KEY)
            let cartCount = await carthelpers.getCartCount(user._id)
            carthelpers.getCartbyUserId(user._id).then((response) => {
                console.log(response+'\n hiii');
                bannerhelpers.getAllBanners().then((banners) => {
                    res.render('050 cozastore-master/index', {user: req.cookies.token, cartCount, cartItems:response, banners})
                })
            
        })
        } else {
            bannerhelpers.getAllBanners().then((banners) => {
                res.render('050 cozastore-master/index', {user: req.cookies.token, banners})
            })
        }
        
        
        
    },

    getProducts:function(req, res){
        producthelpers.getAllActiveProducts().then((response) => {
            let products = response;
            res.render('050 cozastore-master/product',{user: req.cookies.token, products})
        })
        
    },

    getLogin:function(req, res){
        res.render('user/userlogin', {blocked:req.cookies.blocked, userLogin:true});
        res.clearCookie('blocked')
    },

    postLogin:function(req, res){
        userhelpers.doLogin(req.body).then((response) => {
            if(! response){
                res.send("failed")
            } else {
                if(response.blocked){
                    res.clearCookie('token')
                    res.cookie('blocked', "User Blocked")
                    res.redirect('/login')
                } else {
                    const token = jwt.sign(response, process.env.USER_SECRET_KEY);
                    res.cookie('token', token, { httponly: true });
                    res.redirect('/')
                }
            }
        })
    },

    getSignup:function(req, res){
        res.render('user/signup',{signuperror:req.cookies.signuperror})
        res.clearCookie('signuperror')
    },

    postSignup:function(req, res){
        userhelpers.doSignup(req.body).then((response) => {
            if(response == false){
                res.cookie('signuperror',"Email or Number already exists");
                res.redirect('/signup');
                
            } else {
                userhelpers.sendOTP(req.body.email)
                res.cookie('email', req.body.email)
                res.redirect('/verifyotp')
            }
        })
    },

    getResendOtp :function(req, res) {
        userhelpers.resendOTP(req.query.email)
        res.cookie('email', req.query.email)
        res.redirect('/verifyotp')
    },

    getLogout:function(req, res){
        res.clearCookie('token');
        res.redirect('/')
    },

    getVerifyotp:function(req, res){
        res.render('user/otpverification',{email: req.cookies.email})
        res.clearCookie('email')
    },

    postVerifyotp: function(req, res){
        console.log("hereeeeeeeeee");
        if(userhelpers.verifyOTP(req.body.email+req.body.otp, req.body.email)){
            res.redirect('/')
        } else {
            res.redirect('/verifyotp')
        }
    },

    getViewProduct: async function(req, res) {
        let cartCount = await carthelpers.getCartCount(req.user._id)
        producthelpers.getProductById(req.query.id).then((response) => {
            let product = response;  
            producthelpers.getSizesOfProduct(product.commonId).then((sizes) => {
                carthelpers.getCartbyUserId(req.user._id).then((cartItems) => {
                    res.render('050 cozastore-master/product-detail',{user: req.cookies.token, product, sizes, cartCount, cartItems})
                    console.log(sizes)
                })
            })
        })
    },

    getCart:function(req, res){
        res.render('user/cart')
    },
    getOtplogin: function(req, res){
        res.render('user/emailselect')
    },
    postOtplogin:async function(req, res){
        if(await userhelpers.isUser(req.body.email)){
            console.log(userhelpers.isUser(req.body.email))
            userhelpers.sendOTP(req.body.email)
            res.render('user/otplogin',{email: req.body.email})
        } else {
            res.send("No user")
        }
    },
    postLoginOtp:async function (req, res) {
        console.log("hiii")
        if (await userhelpers.verifyOTP(req.body.email + req.body.otp, req.body.email)) {
            var user = await userhelpers.isUser(req.body.email)
            const token = jwt.sign(user, process.env.USER_SECRET_KEY);
            res.cookie('token', token, { httponly: true });
            res.redirect('/')
        } else {
            res.send('login failed')
        }
    },

    getAddAddress: function (req, res){
        res.render('user/add-address')
    },

    postAddAddress: function(req, res) {
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        addresshelpers.addAddress(req.body, user._id).then((response) => {
            res.redirect('/')
        })
    },

    getMyAddresses: function(req, res) {
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        addresshelpers.getAllAddressbyUserId(user._id).then((addresses) => {
            res.render('050 cozastore-master/myaddresses', {addresses, user: req.cookies.token})
        })
        
    },

    getEditAddress: function(req, res) {
        addresshelpers.getAddressbyId(req.query.id).then((address) => {
            res.render('user/editaddress', {address, user: req.cookies.token})
        })
    },

    postEditAddress: function(req, res) {
        addresshelpers.editAddress(req.body, req.query.id).then((response) => {
            res.redirect('/myaddresses')
        })
    },

    getDeleteAddress: function(req, res) {
        addresshelpers.deleteAddress(req.query.id).then((response) => {
            res.redirect('/myaddresses')
        })
    },

    getAddtoCart: function(req, res) {
        console.log("in cart");
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        carthelpers.addToCart(user._id, req.params.id).then((response) => {
            // res.redirect('/viewcart')
            res.json({status:true})
        })
    },

    getViewCart: function(req, res) {
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        carthelpers.getCartbyUserId(user._id).then((response) => {
            carthelpers.getTotalAmount(user._id).then((total) => {
                console.log(response);
                res.render('050 cozastore-master/shopping-cart',{user: req.cookies.token, products: response, total})
            })
        })
    },

    getDeleteProductFromCart: function(req, res) {
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        carthelpers.deleteProductfromCart(req.params.id, user._id).then((response) => {
            console.log(response);
            res.json({status: true})
        })
    },

    postChangeProductQuantity: function(req, res) {
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        console.log(req.body);
        carthelpers.changeQuantity(req.body).then((response) => {
            carthelpers.getTotalAmount(user._id).then((total) => {
                response.total = total;
                res.json(response)
            })
        })
    },

    getCheckout: async function(req, res) {
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        let addresses = await addresshelpers.getAllAddressbyUserId(user._id);
        let products = await carthelpers.getCartbyUserId(user._id);
        carthelpers.getTotalAmount(user._id).then((total) => {

            res.render('user/checkout',{user: req.cookies.token, total, products, addresses})
        })
    },

    postPlaceOrder: async function(req, res) {
        console.log("body\n", req.body)
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        console.log(user);
        let products = await carthelpers.getCartProductList(user._id);
        console.log("products in cart", products);
        let totalPrice = await carthelpers.getTotalAmount(user._id);
        orderhelpers.placeOrder(user._id, req.body, products, totalPrice).then((response) => {
            if(req.body.paymentmethod == 'COD'){
                res.json({status: true})
            } else if (req.body.paymentmethod == 'RazorPay'){
                orderhelpers.generateRazorPay(response.insertedId, totalPrice).then((orderresponse) => {
                    console.log("orderresponse", orderresponse);
                    res.json(orderresponse)
                })
            } else {
                console.log("inside paypal");
                orderhelpers.changePaymentStatus(response.insertedId).then((resp) => {
                    res.json("paypal")
                })
            }
            
        })
        console.log(products);
        console.log(req.body);
    },

    getOrderSuccessful: function(req, res) {
        res.redirect('/vieworders')
    },

    getVIewOrders: function(req, res) {
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        orderhelpers.getAllOrdersbyUserId(user._id).then((response, orderIds) => {
            response.forEach(order => {
                if(order.status == "Cancelled") {
                    order.cancelled = true
                }
            });
            res.render('user/vieworders',{user:req.cookies.token, orders: response})
        })
    },

    getCancelOrder: function(req, res) {
        orderhelpers.cancelOrder(req.query.id).then((response) => {
            res.redirect('/vieworders')
        })
    },

    getViewWishlist: function(req, res) {
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        wishlisthelpers.getProductsfromWishlist(user._id).then((products) => {
            console.log(products)
            res.render('user/wishlist',{products, user:req.cookies.token})
        })
        
    },

    getAddToWishlist: function(req, res) {
        console.log("jjjj");
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        console.log(req.params.proId)
        wishlisthelpers.addToWishlist(req.params.proId, user._id).then((response) => {
            res.json({status:true})
        })
    },

    getRemovefromWishlist: function(req, res) {
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        wishlisthelpers.deletefromWishlist(user._id, req.query.id).then((response) => {
            res.redirect('/wishlist')
        })
    },

    postVerifyPayment: function(req, res) {
        console.log(req.body)
        orderhelpers.verifyRazorPayPayment(req.body).then(() => {
            console.log("inside here");
            orderhelpers.changePaymentStatus(req.body['order[receipt]']).then((updateResponse) => {
                console.log("payment successful")
                res.json({status: true})
            })
        }). catch((err) => {
            console.log(err);
            res.json({status: false, errMsg:"Payment Failed"})
        })
    },

    getChangePasswordOtpVerification: async function(req, res) {
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        await userhelpers.sendOTP(user.email)
        res.render('user/otplogin', {user: req.cookies.token, email: user.email})
    },

    postChangePasswordVerification: async function(req, res) {
        console.log(req.body)
        if(await userhelpers.verifyOTPChangePassword(req.body.otp, req.body.email)) {
            res.redirect('/changepassword')
        } else {
            res.send('wrong otp')
        }
    },

    getChangePassword: function(req, res) {
        res.render('user/forgotpassword',{user: req.cookies.token})
    },

    postChangePassword: function(req, res) {
        console.log(req.body)
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        if(req.body.password_first ==req.body.password_second) {
            userhelpers.changePassword(req.body.password_first, user.email).then(() => {
                res.redirect('/')
            })
        } else {
            res.send("wrong")
        }
    },

    getForgotPassword: function(req, res) {
        res.render('user/emailselect',{forgotpassword: true})
    },

    postForgotPassword: async function(req, res) {
        if(await userhelpers.isUser(req.body.email)){
            await userhelpers.sendOTP(req.body.email)
            console.log("ppp")
            res.render('user/otplogin', {email:req.body.email, forgotpassword: true, user: false})
        }
    },

    postForgotPasswordOtp: function(req, res) {
        console.log(req.body)
        if(userhelpers.verifyOTPChangePassword(req.body.otp, req.body.email)){
            console.log("in");
            res.cookie('email',req.body.email)
            res.render('user/forgotpassword',{user: false})
        } else{
            res.send("error")
        }
        
    },

    postForgotPasswordChange: function(req, res) {
        console.log("iniside herereee");
        console.log(req.cookies.email)
        if(req.body.password_first ==req.body.password_second) {
            userhelpers.changePassword(req.body.password_first, req.cookies.email).then(() => {
                res.clearCookie('email')
                res.redirect('/login')
            })
        } else {
            res.send("wrong")
        }
    }
}