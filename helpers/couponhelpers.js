var db = require('../database/connection');
var collections = require('../database/collections');
const { ObjectId } = require('mongodb');
const carthelpers = require('./carthelpers');

module.exports = {
    addCoupon:async function(couponData) {
        return new Promise(async function(resolve, reject) {
            var isThere = await db.get().collection(collections.COUPON_COLLECTION).findOne({coupon_code: couponData.coupon_code})
            if(isThere) {
                resolve(false)
            } else {
                couponData.minamount = parseInt(couponData.minamount)
                couponData.discount = parseInt(couponData.discount)
                db.get().collection(collections.COUPON_COLLECTION).insertOne(couponData).then(() => {
                resolve(true)
                })
            }
        }) 
    },

    getAllCoupons: function() {
        return new Promise(function(resolve, reject) {
            db.get().collection(collections.COUPON_COLLECTION).find().toArray().then((response) => {
                resolve(response)
            })
        })
    },

    editCoupon: function(id,couponData) {
        return new Promise(function(resolve, reject) {
            couponData.minamount = parseInt(couponData.minamount)
            couponData.discount = parseInt(couponData.discount)
            db.get().collection(collections.COUPON_COLLECTION).updateOne({_id:ObjectId(id)},{
                $set:{
                    minamount: couponData.minamount,
                    validfrom: couponData.validfrom,
                    validtill: couponData.validtill,
                    discount: couponData.discount
                }
            }).then(() => {
                resolve()
            })
        })
    },

    deleteCoupon: function(id) {
        return new Promise(function(resolve, reject) {
            db.get().collection(collections.COUPON_COLLECTION).deleteOne({_id: ObjectId(id)}).then(() => {
                resolve()
            })
        })
    },

    getCouponById: function(id) {
        return new Promise(function(resolve, reject) {
            db.get().collection(collections.COUPON_COLLECTION).findOne({_id: ObjectId(id)}).then((response) => {
                resolve(response)
            })
        })
    },

    verifyAndAddCoupon: async function (couponCode, userId) {
        return new Promise(async function (resolve, reject) {
            let coupon = await db.get().collection(collections.COUPON_COLLECTION).findOne({ coupon_code: couponCode })
            if (coupon) {
                let currentDate = new Date();
                let validtill = new Date(coupon.validtill)
                let validfrom = new Date(coupon.validfrom)
                console.log(currentDate <= validtill && currentDate >= validfrom)
                if (currentDate <= validtill && currentDate >= validfrom) {
                    let totalamount = await carthelpers.getTotalAmount(userId)
                    if (totalamount >= coupon.minamount) {
                        db.get().collection(collections.CART_COLLECTION).updateOne({ userId: ObjectId(userId) }, {
                            $set: {
                                coupon_code: coupon.coupon_code
                            }
                        }).then(() => {
                            resolve(true)
                        })
                    } else{
                        console.log(1);
                        resolve(false)
                    }
                } else{
                    console.log(2);
                    resolve(false)
                }
            } else {
                console.log(3);
                resolve(false)
            }
        })

    },

    removeCouponFromCart: function(userId) {
        return new Promise(function(resolve, reject) {
            db.get().collection(collections.CART_COLLECTION).updateOne({userId: ObjectId(userId)},{
            $unset:{
                coupon_code:""
            }
        }).then(() => {
            resolve()
        })
        })
        
    },

    getAllActiveCoupon: function() {
        let currentDate = new Date()
        let result = [];
        return new Promise(function(resolve, reject) {
            db.get().collection(collections.COUPON_COLLECTION).find().toArray().then((res) => {
                // console.log(res);
                let coupons = res;
                coupons.forEach(element => {
                    if(new Date(element.validfrom) <= currentDate && new Date(element.validtill) >= currentDate) {
                        result.push(element)
                    }
                });
                // console.log(result);
                resolve(result)
            })
        })
    }
}