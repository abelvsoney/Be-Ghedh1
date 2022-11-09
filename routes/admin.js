var express = require('express');
var router = express.Router();
var admincontrollers = require('../admincontrollers/admincontrollers')
var adminauthentication = require('../adminauthentication/authentication')
const fileupload = require('express-fileupload');
const usercontrollers = require('../usercontrollers/usercontrollers');

var db = require('../database/connection');
var collection = require('../database/collections');
const chartHelper = require('../helpers/charthelpers');
const userHelper = require('../helpers/userhelpers');
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
// router.get('/', adminauthentication.adminJWTTokenAuth, admincontrollers.getDasboard);

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
    console.log(req.files.sampleFile)
    let image1 = req.files.sampleFile
    let n = Math.random(0,10)
    image1.mv('./public/ImageSite/'+n+".jpg", (err, done) => {
        if(!err) {
            res.send("success")
        } else {
            console.log(err)
        }
    })
});

router.get('/vieworderdetails', admincontrollers.getViewOrderDetails)

router.get('/', async function (req, res, next) {
    console.log("in dashboard");
    try {
      let total = 0
      let newDate = []
      no= 0
      let u_no =0
      let order =0
      let report = await userHelper.getAllDeliveredOrder()
    
      console.log("llll");
      order_count= await db.get().collection(collection.ORDER_COLLECTION).find().count()
      console.log("order:",order);
      
      await userHelper.getAllUserOrders().then((orders)=>{
        
        // console.log("in try: ",orders);
         orders.forEach(data => {
       
     
          if (data.status == "Delivered") {
            no++
            total=total+data.totalAmount
            console.log(total);
          }
         });
         console.log("llll");
        
       }).catch((err)=>{res.redirect('/error')})
     await  userHelper.getAllUsers().then((users)=>{
      users.reverse()
      let newUsers = []
      let newTrans = []
      for (let index = 0; index < 5; index++) {
        newUsers.push(users[index])
        
      }
      users = newUsers
        userHelper.getAllUserOrders().then(async(orders) => {
          for (let index = 0; index < 3; index++) {
            newTrans.push(orders[index])
            
          }
          orders = newTrans
          try {
            console.log("llll");
            console.log("order: ",orders);
          } catch (err) {
            console.log("err: 2nd try ",err)
            res.redirect('/error')
          }
          await userHelper.getAllUsers().then((users)=>{users.forEach(data => {
       
            u_no++
               
            });
          })       
           res.render('admin/dashboard2',{admin:true,total,users,orders,no,u_no,report,order_count});
            
      });
   
        
      })
     
   
      
    } catch (err) {
      console.log(err);
      res.redirect('/error')
    }
  })
  
  router.get('/dashboard/day', async (req,res)=>{
    await chartHelper.findOrdersByDay().then((data)=>{
      res.json(data)
    })
  })
  router.get('/dashboard/week',async (req,res)=>{
    await chartHelper.findOrderByMonth().then((data)=>{
      res.json(data)
    })
  })
  router.get('/dashboard/month',async (req,res)=>{
    await chartHelper.findOrderByYear().then((data)=>{
      console.log("hy:",data);
      res.json(data)
    })
  })
  router.get('/dashboard/category',async (req,res)=>{
    await chartHelper.categoryStatus().then((data)=>{
      // console.log(data);
      res.json(data)
    })
  })

module.exports = router;
