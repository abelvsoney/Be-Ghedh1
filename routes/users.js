var express = require('express');
var router = express.Router();
var usercontrollers = require('../usercontrollers/usercontrollers')
var userauthentication = require('../userauthentication/authentication');
const admincontrollers = require('../admincontrollers/admincontrollers');
var carthelpers = require('../helpers/carthelpers')
var jwt = require('jsonwebtoken')
const paypal = require('../helpers/paypal')


/* GET users listing. */
router.get('/',userauthentication.isUnblocked, usercontrollers.getHomePage)

router.get('/login', userauthentication.userLoggedIn, userauthentication.isUnblocked, usercontrollers.getLogin);

router.post('/login', usercontrollers.postLogin);

router.get('/logout', usercontrollers.getLogout)

router.get('/signup', userauthentication.userLoggedIn, usercontrollers.getSignup);

router.get('/otplogin', usercontrollers.getOtplogin)

router.post('/otplogin', usercontrollers.postOtplogin)

router.post('/signup', usercontrollers.postSignup);

router.post('/loginotp', usercontrollers.postLoginOtp)

router.get('/verifyotp',userauthentication.userLoggedIn, usercontrollers.getVerifyotp)

router.post('/verify', usercontrollers.postVerifyotp);

router.get('/resendotp',userauthentication.userLoggedIn, usercontrollers.getResendOtp)

router.get('/products', userauthentication.isUnblocked, usercontrollers.getProducts)

router.get('/viewproduct',userauthentication.isUnblocked, usercontrollers.getViewProduct)

router.get('/cart', userauthentication.userJWTTokenAuth, usercontrollers.getCart)

router.get('/myaddresses',userauthentication.userJWTTokenAuth, usercontrollers.getMyAddresses)

router.get('/addaddress',userauthentication.userJWTTokenAuth, usercontrollers.getAddAddress);

router.post('/addaddress',userauthentication.userJWTTokenAuth, usercontrollers.postAddAddress);

router.get('/editaddress',userauthentication.userJWTTokenAuth, usercontrollers.getEditAddress);

router.post('/editaddress',userauthentication.userJWTTokenAuth, usercontrollers.postEditAddress)

router.get('/deleteaddress',userauthentication.userJWTTokenAuth, usercontrollers.getDeleteAddress)

router.get('/addtocart/:id',userauthentication.userJWTTokenAuth, usercontrollers.getAddtoCart);

router.get('/viewcart',userauthentication.userJWTTokenAuth, usercontrollers.getViewCart);

router.get('/deleteproductfromcart/:id',userauthentication.userJWTTokenAuth, usercontrollers.getDeleteProductFromCart);

router.post('/changeproductquantity',userauthentication.userJWTTokenAuth, usercontrollers.postChangeProductQuantity);

router.get('/checkout',userauthentication.userJWTTokenAuth, usercontrollers.getCheckout);

router.post('/placeorder',userauthentication.userJWTTokenAuth, usercontrollers.postPlaceOrder)

router.get('/ordersuccessful',userauthentication.userJWTTokenAuth, usercontrollers.getOrderSuccessful);

router.get('/vieworders',userauthentication.userJWTTokenAuth, usercontrollers.getVIewOrders);

router.get('/cancelorder',userauthentication.userJWTTokenAuth, usercontrollers.getCancelOrder);

router.get('/wishlist',userauthentication.userJWTTokenAuth, usercontrollers.getViewWishlist);

router.get('/addtowishlist/:proId',userauthentication.userJWTTokenAuth, usercontrollers.getAddToWishlist);

router.get('/removefromwishlist',userauthentication.userJWTTokenAuth, usercontrollers.getRemovefromWishlist);

router.post('/verifypayment',userauthentication.userJWTTokenAuth, usercontrollers.postVerifyPayment);

//paypal
router.post("/api/orders", userauthentication.userJWTTokenAuth, async (req, res) => {
  let token = req.cookies.token;
  let user = jwt.verify(token, process.env.USER_SECRET_KEY);
  let offertotal = await carthelpers.getTotalOfferAmount(user._id)
  let coupDisc = await carthelpers.getCouponDiscount(user._id, offertotal)
  let total = await carthelpers.getTotalAmount(user._id);
  offertotal = total - offertotal;
  let subtotal = total - (offertotal + coupDisc)
  const order = await paypal.createOrder(subtotal);
  res.json(order);
});
  
  router.post("/api/orders/:orderId/capture",userauthentication.userJWTTokenAuth, async (req, res) => {
    const { orderId } = req.params;
    const captureData = await paypal.capturePayment(orderId);
    res.json(captureData);
  });
//

router.get('/changepasswordotpverification', usercontrollers.getChangePasswordOtpVerification);

router.post('/changepasswordotpverification', usercontrollers.postChangePasswordVerification)

router.get('/changepassword',userauthentication.userJWTTokenAuth, usercontrollers.getChangePassword);

router.post('/changepassword', usercontrollers.postChangePassword);

router.get('/forgotpassword', usercontrollers.getForgotPassword);

router.post('/forgotpassword', usercontrollers.postForgotPassword);

router.post('/forgotpasswordotp', usercontrollers.postForgotPasswordOtp);

router.post('/forgotpasswordchange', usercontrollers.postForgotPasswordChange);

router.get('/myprofile',userauthentication.userJWTTokenAuth, usercontrollers.getMyProfile);

router.get('/editprofile',userauthentication.userJWTTokenAuth, usercontrollers.getEditProfile);

router.post('/editprofile', usercontrollers.postEditProfile)

router.post('/verifyandaddcoupon',userauthentication.userJWTTokenAuth, usercontrollers.postVerifyAndAddCoupon);

router.get('/changeorderstatus',userauthentication.userJWTTokenAuth, usercontrollers.changeOrderStatus);

router.get('/removecoupon',userauthentication.userJWTTokenAuth, usercontrollers.getRemoveCoupon);

router.get('/filterbybrand', usercontrollers.getFilterByBrand)

router.get('/filterbycategory', usercontrollers.getFilterByCategory);

// router.get('/')

module.exports = router;
