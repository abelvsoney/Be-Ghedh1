var express = require('express');
var router = express.Router();
var usercontrollers = require('../usercontrollers/usercontrollers')
var userauthentication = require('../userauthentication/authentication');
const admincontrollers = require('../admincontrollers/admincontrollers');
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

router.get('/myaddresses', usercontrollers.getMyAddresses)

router.get('/addaddress',userauthentication.userJWTTokenAuth, usercontrollers.getAddAddress);

router.post('/addaddress', usercontrollers.postAddAddress);

router.get('/editaddress', usercontrollers.getEditAddress);

router.post('/editaddress', usercontrollers.postEditAddress)

router.get('/deleteaddress', usercontrollers.getDeleteAddress)

router.get('/addtocart/:id',usercontrollers.getAddtoCart);

router.get('/viewcart', usercontrollers.getViewCart);

router.get('/deleteproductfromcart/:id', usercontrollers.getDeleteProductFromCart);

router.post('/changeproductquantity', usercontrollers.postChangeProductQuantity);

router.get('/checkout', usercontrollers.getCheckout);

router.post('/placeorder', usercontrollers.postPlaceOrder)

router.get('/ordersuccessful', usercontrollers.getOrderSuccessful);

router.get('/vieworders', usercontrollers.getVIewOrders);

router.get('/cancelorder', usercontrollers.getCancelOrder);

router.get('/wishlist', usercontrollers.getViewWishlist);

router.get('/addtowishlist/:proId', usercontrollers.getAddToWishlist);

router.get('/removefromwishlist', usercontrollers.getRemovefromWishlist);

router.post('/verifypayment', usercontrollers.postVerifyPayment);

//paypal
router.post("/api/orders", async (req, res) => {
    const order = await paypal.createOrder();
    res.json(order);
  });
  
  router.post("/api/orders/:orderId/capture", async (req, res) => {
    const { orderId } = req.params;
    const captureData = await paypal.capturePayment(orderId);
    res.json(captureData);
  });
//

router.get('/changepasswordotpverification', usercontrollers.getChangePasswordOtpVerification);

router.post('/changepasswordotpverification', usercontrollers.postChangePasswordVerification)

router.get('/changepassword', usercontrollers.getChangePassword);

router.post('/changepassword', usercontrollers.postChangePassword);

router.get('/forgotpassword', usercontrollers.getForgotPassword);

router.post('/forgotpassword', usercontrollers.postForgotPassword);

router.post('/forgotpasswordotp', usercontrollers.postForgotPasswordOtp);

router.post('/forgotpasswordchange', usercontrollers.postForgotPasswordChange);

router.get('/myprofile', usercontrollers.getMyProfile);

router.get('/editprofile', usercontrollers.getEditProfile);

router.post('/editprofile', usercontrollers.postEditProfile)

router.post('/verifyandaddcoupon', usercontrollers.postVerifyAndAddCoupon);

router.get('/changeorderstatus', usercontrollers.changeOrderStatus);

router.get('/removecoupon', usercontrollers.getRemoveCoupon)

module.exports = router;
