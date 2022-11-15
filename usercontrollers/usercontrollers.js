var userhelpers = require('../helpers/userhelpers')
var producthelpers = require('../helpers/producthelpers')
var addresshelpers = require('../helpers/addresshelpers')
var carthelpers = require('../helpers/carthelpers')
var jwt = require('jsonwebtoken')
const { response } = require('express')
const orderhelpers = require('../helpers/orderhelpers')
const wishlisthelpers = require('../helpers/wishlisthelpers')
const bannerhelpers = require('../helpers/bannerhelpers')
const couponhelpers = require('../helpers/couponhelpers')
const brandhelpers =  require('../helpers/brandhelpers')
const categoryhelpers = require('../helpers/categoryhelpers')
var easyinvoice = require('easyinvoice');
const wallethelpers = require('../helpers/wallethelpers')
require('dotenv').config()

// function getUserDetails (req, res){
//     let token = req.cookies.token;
//     let user = jwt.verify(token, process.env.USER_SECRET_KEY);
//     return user;
// }


module.exports={

    getHomePage: async function(req, res) {
        let products = await producthelpers.getAllUniqueProducts();
        products = products.slice(0,4)
        products.forEach(element => {
            if(element.price > element.offerprice){
                element.offer = true
            }
        });
        let token = req.cookies.token;
        if(token){
            let user = jwt.verify(token, process.env.USER_SECRET_KEY)
            let cartCount = await carthelpers.getCartCount(user._id)
            carthelpers.getCartbyUserId(user._id).then((response) => {
                console.log(response+'\n hiii');
                bannerhelpers.getAllBanners().then((banners) => {
                    res.render('050 cozastore-master/index', {user: req.cookies.token, cartCount, cartItems:response, banners, products, home:true})
                })
            
        })
        } else {
            bannerhelpers.getAllBanners().then((banners) => {
                res.render('050 cozastore-master/index', {user: req.cookies.token, banners, products, home: true})
            })
        }
        
        
        
    },

    getProducts:async function(req, res){
        let token = req.cookies.token;
        if(token) {
            let user = jwt.verify(token, process.env.USER_SECRET_KEY)
            let wishlist =await wishlisthelpers.getProductsfromWishlist(user._id);
            // console.log("wishlist\n",wishlist,"\n wishlist");
            let brands = await brandhelpers.getAllBrands()
            if(wishlist) {
                producthelpers.getAllUniqueProducts().then((response) => {
                    let products = response;
                    products.forEach(element => {
                        wishlist.forEach(wish => {
                            // console.log(wish.product._id.toString() == element._id.toString());
                            if(wish.product._id.toString() == element._id.toString()) {
                                // console.log("inside");
                                element.wishlisted = true;
                            }
                        });
                        if (element.price > element.offerprice) {
                            element.offer = true
                        }
                    });
                    console.log("asdd\n",products,"\n dfgh");
                    res.render('050 cozastore-master/product', { user: req.cookies.token, products, brands, shop: true })
                })
            } else {
                let brands = await brandhelpers.getAllBrands()
        producthelpers.getAllUniqueProducts().then((response) => {
            let products = response;
            products.forEach(element => {
                if(element.price > element.offerprice){
                    element.offer = true
                }
            });
            res.render('050 cozastore-master/product',{user: req.cookies.token, products, brands, shop: true})
        })
            }
        } else {
            let brands = await brandhelpers.getAllBrands()
        producthelpers.getAllUniqueProducts().then((response) => {
            let products = response;
            products.forEach(element => {
                if(element.price > element.offerprice){
                    element.offer = true
                }
            });
            res.render('050 cozastore-master/product',{user: req.cookies.token, products, brands, shop: true})
        })
        }
    },

    getLogin:function(req, res){
        res.render('user/userlogin', {blocked:req.cookies.blocked, userLogin:true});
        res.clearCookie('blocked')
    },

    postLogin:function(req, res){
        userhelpers.doLogin(req.body).then((response) => {
            if(! response){
                res.cookie('blocked', "Invalid Credentials")
                res.redirect('/login')
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
        let p = await producthelpers.getAllUniqueProducts();
        p = p.slice(0,4)
        p.forEach(element => {
            if(element.price > element.offerprice){
                element.offer = true
            }
        });
        let cartCount
        if(req.user) {
            cartCount = await carthelpers.getCartCount(req.user._id)
        }
        producthelpers.getProductById(req.query.id).then((response) => {
            let product = response;
            // console.log(product);
            if(product.price > product.offerprice) {
                product.offer = true;
            }
            if(product.quantity < 1) {
                product.outofstock = true;
            } 
            producthelpers.getSizesOfProduct(product.commonId).then((sizes) => {
                sizes.forEach((item, index, arr) => {
                    if(item.size == product.size) {
                        arr.splice(index, 1);
                    }
                });
                if(req.user){
                    carthelpers.getCartbyUserId(req.user._id).then((cartItems) => {
                        res.render('050 cozastore-master/product-detail',{user: req.cookies.token, product, sizes, cartCount, cartItems, p, shop: true})
                    })
                } else {
                    res.render('050 cozastore-master/product-detail',{user: req.cookies.token, product, sizes, p, shop: true})
                }
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
        console.log("inside");
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
        if(token) {
            let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        carthelpers.addToCart(user._id, req.params.id).then((response) => {
            console.log(response);
            // res.redirect('/viewcart')
            res.json({status:true})
        })
        } else {
            res.json({status:false})
        }
        
    },

    getViewCart:async function(req, res) {
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        let offertotal =await carthelpers.getTotalOfferAmount(user._id)
        let coupDisc = await carthelpers.getCouponDiscount(user._id, offertotal)
        console.log(offertotal);
        carthelpers.getCartbyUserId(user._id).then((response) => {
            let products = response;
            if (products) {
                products.forEach(element => {
                    if (element.price > element.offerprice) {
                        element.offer = true
                    }
                });
            }
            
            carthelpers.getTotalAmount(user._id).then((total) => {
                offertotal = total - offertotal;
                let subtotal = total - (offertotal + coupDisc)
                console.log(response);
                res.render('050 cozastore-master/shopping-cart',{user: req.cookies.token, products: response, total, offertotal, coupDisc, subtotal})
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

    postChangeProductQuantity:async function(req, res) {
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        console.log(req.body);
        carthelpers.changeQuantity(req.body, user._id).then(async (response) => {
            let offertotal =await carthelpers.getTotalOfferAmount(user._id)
            let coupDisc = await carthelpers.getCouponDiscount(user._id, offertotal)
            carthelpers.getTotalAmount(user._id).then((total) => {
                offertotal = total - offertotal;
                let subtotal = total - (offertotal + coupDisc)
                response.total = parseInt(total);
                response.subtotal = subtotal;
                response.offertotal = offertotal;
                response.coupDisc = coupDisc;
                res.json(response)
            })
        })
    },

    getCheckout: async function(req, res) {
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        let offertotal =await carthelpers.getTotalOfferAmount(user._id)
        let coupDisc = await carthelpers.getCouponDiscount(user._id, offertotal)
        let addresses = await addresshelpers.getAllAddressbyUserId(user._id);
        let products = await carthelpers.getCartbyUserId(user._id);
        let coupon_codeapplied = await carthelpers.isCoupon_Applied(user._id)
        let wallet = await wallethelpers.getUserWallet(user._id);
        let wallet_success
        console.log(products,"\nproducts")
        if(products) {
            products.forEach(element => {
                element.product.tprice = element.quantity * element.product.offerprice
            console.log(element.quantity);
            if(element.quantity > element.product.quantity) {
                res.redirect('/viewcart')
            }
        });
        carthelpers.getTotalAmount(user._id).then((total) => {
            offertotal = total - offertotal;
            let subtotal = total - (offertotal + coupDisc)
            if(subtotal <= wallet.amount) {
                wallet_success = true;
            } else {
                wallet_success = false;
            }
            res.render('user/checkout',{user: req.cookies.token, total, products, addresses, coupon_codeapplied, offertotal, coupDisc, subtotal, wallet_success})
        })
        } else {
            res.redirect('/viewcart')
        }
        
    },

    postPlaceOrder: async function(req, res) {
        console.log("body\n", req.body)
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        console.log(user);
        let products = await carthelpers.getCartProductList(user._id);
        console.log("products in cart", products);
        let offertotal =await carthelpers.getTotalOfferAmount(user._id)
        let coupDisc = await carthelpers.getCouponDiscount(user._id, offertotal)
        let total = await carthelpers.getTotalAmount(user._id);
        offertotal = total - offertotal;
        let subtotal = total - (offertotal + coupDisc)
        console.log(subtotal);
        let address = await addresshelpers.getAddressbyId(req.body.addressId)
        req.body.addressId = address
        console.log("address\n",address,"\n address");
        if(products.length > 0) {
            orderhelpers.placeOrder(user._id, req.body, products, subtotal, total, offertotal, coupDisc).then((response) => {
                if(req.body.paymentmethod == 'COD'){
                    res.json({status: true})
                } else if (req.body.paymentmethod == 'RazorPay'){
                    orderhelpers.generateRazorPay(response.insertedId, subtotal).then((orderresponse) => {
                        console.log("orderresponse", orderresponse);
                        res.json(orderresponse)
                    })
                } else if (req.body.paymentmethod == "Wallet") {
                    wallethelpers.debitWallet(user._id, response.insertedId, subtotal).then((r) => {
                        res.json({status: true})
                    })
                } else {
                    console.log("inside paypal");
                    orderhelpers.changePaymentStatus(response.insertedId).then((resp) => {
                        res.json("paypal")
                    })
                }
                
            })
        } else {
            res.send("error")
        }
        
    },

    getOrderSuccessful: function(req, res) {
        res.redirect('/vieworders')
    },

    getVIewOrders: function(req, res) {
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        orderhelpers.getAllOrdersbyUserId(user._id).then((response) => {
            // console.log(response);
            console.log(response);
            response.forEach(order => {
                var d = new Date(order.date),
                    month = '' + (d.getMonth() + 1),
                    day = '' + d.getDate(),
                    year = d.getFullYear();

                if (month.length < 2)
                    month = '0' + month;
                if (day.length < 2)
                    day = '0' + day;

                order.date = [year, month, day].join('-');
                if(order.status == "Cancelled") {
                    order.cancelled = true
                } else if(order.status == "Delivered"){
                    order.delivered = true;
                } else if(order.status == "Returned") {
                    order.returned = true;
                }
            });
            response.reverse();
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
        if(token) {
            let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        console.log(req.params.proId)
        wishlisthelpers.addToWishlist(req.params.proId, user._id).then((response) => {
            console.log("hii");
            res.json(response)
        })
        } else {
            res.json({status:false})
        }
        
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
        console.log("inside");
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
    },

    getMyProfile: function(req, res) {
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        userhelpers.getUserDetails(user._id).then((userd) => {
            res.render('user/myprofile',{userd, user: req.cookies.token})
        })
    },

    getEditProfile: function(req, res) {
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        userhelpers.getUserDetails(user._id).then((userd) => {
            res.render('user/editprofile',{userd, user: req.cookies.token})
        })
    },

    postEditProfile: function(req, res) {
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        let userid = user._id;
        console.log(req.body)
        userhelpers.editProfile(req.body, userid).then((response) => {
            if(response) {
                res.clearCookie('token')
                userhelpers.getUserDetails(userid).then((user) => {
                    const token = jwt.sign(user, process.env.USER_SECRET_KEY);
                    res.cookie('token', token, { httponly: true });
                    res.redirect('/myprofile')
                })
            } else {
                res.send("Already exists")
            }
        })
    },

    postVerifyAndAddCoupon: function(req, res) {
        console.log(req.body.coupon_code);
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        couponhelpers.verifyAndAddCoupon(req.body.coupon_code, user._id).then((response) => {
            res.json(response)
        })
    },

    changeOrderStatus: function(req, res) {
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        console.log((req.query.status));
        orderhelpers.changeOrderStatus(user._id, req.query.id, req.query.status).then(() => {
            res.redirect('/vieworders')
        })
    },

    getRemoveCoupon: function(req, res) {
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        couponhelpers.removeCouponFromCart(user._id).then(() => {
            res.redirect('/checkout')
        })
    },

    getFilterByBrand:async function(req, res) {
        let token = req.cookies.token;
        if(token) {
            let user = jwt.verify(token, process.env.USER_SECRET_KEY)
            let wishlist =await wishlisthelpers.getProductsfromWishlist(user._id);
        }

        let brands = await brandhelpers.getAllBrands()
        let currentbrand = req.query.bname;
        console.log(brands);
        brands.forEach((item, index, arr) => {
            if(item.brandname == currentbrand) {
                arr.splice(index, 1);
            }
        });
        let categories =await categoryhelpers.getCategorybyBrand(currentbrand)
        producthelpers.getAllProductsByBrand(req.query.bname).then((response) => {
            let products = response;
            products.forEach(element => {
                if(element.price > element.offerprice){
                    element.offer = true
                }
            });
            res.render('050 cozastore-master/filterbybrand',{user: req.cookies.token, products, brands, currentbrand, categories})
        })
    },

    getFilterByCategory: async function(req, res) {
        let token = req.cookies.token;
        if(token) {
            let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        }

        let brands = await brandhelpers.getAllBrands()
        
        
        producthelpers.getAllProductsByBrand_Category(req.query.catid).then(async (resp) => {
            let products = resp.products;
            let currentbrand = resp.currentBrand;
            console.log(currentbrand);
            let categories =await categoryhelpers.getCategorybyBrand(currentbrand)
            brands.forEach((item, index, arr) => {
                if(item.brandname == currentbrand) {
                    arr.splice(index, 1);
                }
            });
            res.render('050 cozastore-master/filterbybrand',{user: req.cookies.token, products, brands, currentbrand, categories})
        })

        
    },

    getViewOrderDetails: async function(req, res) {
        let orderDetails = await orderhelpers.getOrderDetails(req.query.id);
        console.log(orderDetails);
        orderhelpers.getOrderDetailsByOrderId(req.query.id).then((products) => {
            console.log(products);
            res.render('user/orderdetails', {user: req.cookies.token, orderDetails, products})
        })
    },
    getMyWallet: function(req, res) {
        let token = req.cookies.token;
        let user = jwt.verify(token, process.env.USER_SECRET_KEY);
        wallethelpers.getUserWallet(user._id).then((response) => {
            let transaction = response.transaction;
            // console.log(res.transaction)
            transaction.forEach(order => {
                var d = new Date(order.date),
                    month = '' + (d.getMonth() + 1),
                    day = '' + d.getDate(),
                    year = d.getFullYear();

                if (month.length < 2)
                    month = '0' + month;
                if (day.length < 2)
                    day = '0' + day;

                order.date = [year, month, day].join('-');
            });
            console.log(transaction);
            res.render('user/mywallet', {user: req.cookies.token, transaction, response})
        })
    },

    getViewCoupons: function(req, res) {
        couponhelpers.getAllActiveCoupon().then((r) => {
            console.log(r)
            res.render('user/coupons', {user: req.cookies.token, coupons: r})
        })
    }
}