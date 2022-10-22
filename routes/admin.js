var express = require('express');
var router = express.Router();
var admincontrollers = require('../admincontrollers/admincontrollers')
var adminauthentication = require('../adminauthentication/authentication')
const fileupload = require('express-fileupload');
const usercontrollers = require('../usercontrollers/usercontrollers');
router.use(fileupload())


// const multer = require('multer')



// const storage = multer.diskStorage({
//     destination: function(req, file, cb){
//         cb(null, '../public/ImageSite')
//     },
//     filename: function(req, file, cb) {
//         cb(null, file.originalname)
//     }
// })

// const upload = multer({storage : storage})


//login and logout
router.get('/', adminauthentication.adminJWTTokenAuth, admincontrollers.getDasboard);

router.get('/login', adminauthentication.adminLoggedIn, admincontrollers.getLogin);

router.post('/login', admincontrollers.postLogin);

router.get('/logout', admincontrollers.getLogout);

//users

router.get('/viewusers', adminauthentication.adminJWTTokenAuth, admincontrollers.getViewusers);

router.get('/blockuser', adminauthentication.adminJWTTokenAuth, admincontrollers.getBlockuser);

router.get('/deleteuser',adminauthentication.adminJWTTokenAuth, admincontrollers.getDeleteUser)

//brand

router.get('/viewbrands',adminauthentication.adminJWTTokenAuth, admincontrollers.getViewBrands)

router.post('/addbrand',adminauthentication.adminJWTTokenAuth, admincontrollers.postAddBrand)

router.get('/deletebrand',adminauthentication.adminJWTTokenAuth, admincontrollers.getDeleteBrand)

//categories

router.get('/viewcategories',adminauthentication.adminJWTTokenAuth, admincontrollers.getViewCategories);

router.post('/addcategory',adminauthentication.adminJWTTokenAuth, admincontrollers.postAddCategory);

router.get('/deletecategory',adminauthentication.adminJWTTokenAuth, admincontrollers.getDeleteCategory)

//product

router.get('/addproduct',adminauthentication.adminJWTTokenAuth, adminauthentication.adminJWTTokenAuth, admincontrollers.getAddProduct);

router.post('/addproduct',adminauthentication.adminJWTTokenAuth, admincontrollers.postAddProduct);

router.post('/addproductfinal' ,adminauthentication.adminJWTTokenAuth, admincontrollers.postAddProductFinal);

router.get('/viewproducts',adminauthentication.adminJWTTokenAuth, adminauthentication.adminJWTTokenAuth, admincontrollers.getViewproducts);

router.get('/deleteproduct',adminauthentication.adminJWTTokenAuth, admincontrollers.getDeleteProduct);

router.get('/editproduct',adminauthentication.adminJWTTokenAuth, admincontrollers.getEditProduct);

router.post('/editproduct',adminauthentication.adminJWTTokenAuth, admincontrollers.postEditProduct);

router.get('/changestatus',adminauthentication.adminJWTTokenAuth, admincontrollers.changeStatus);

router.get('/viewbanners', admincontrollers.getViewBanners);

router.post('/addbanner', admincontrollers.postAddBanner);

router.get('/vieworders', admincontrollers.getViewOrders);

router.get('/cancelorder', admincontrollers.getCancelOrder);

router.get('/editbanner', admincontrollers.getEditBanner);

router.post('/editbanner', admincontrollers.postEditBanner);

router.get('/deletebanner', admincontrollers.getDeleteBanner);

router.get('/changeOrderStatus', admincontrollers.getchangeOrderStatus);

router.get('/day', admincontrollers.getDay)

// router.get('/addbanner', admincontrollers.getAddBanner)

router.get('/addcategoryoffer', admincontrollers.getAddCategoryOffer);

router.post('/addcategoryoffer', admincontrollers.postAddCategoryOffer);

router.get('/deletecategoryoffer', admincontrollers.getDeleteCategoryOffer);

router.get('/viewcoupons', admincontrollers.getViewCoupons);

router.post('/addcoupon', admincontrollers.postAddCoupon)

router.get('/deletecoupon', admincontrollers.getDeleteCoupon)

router.get('/editcoupon', admincontrollers.getEditCoupon)

router.post('/editcoupon', admincontrollers.postEditCoupon);

router.get('/salesreport', admincontrollers.getSalesReport);

router.get('/test', function(req, res) {
    res.render('admin/trialupload', {admin: true})
});

router.post('/test', function(req, res) {
    console.log(req.files)
})

module.exports = router;
