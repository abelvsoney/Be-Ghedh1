var db = require('../database/connection');
var collections = require('../database/collections');
const { ObjectId } = require('mongodb');
const { response } = require('express');

module.exports = {
    addToCart: function(userId, productId) {
        return new Promise (async function(resolve, reject) {
            await db.get().collection(collections.CART_COLLECTION).updateOne({userId: ObjectId(userId)},{
                $unset:{
                    coupon_code:""
                }
            })
            let proObj = {
                item : ObjectId(productId),
                quantity: 1
            }
            let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({userId: ObjectId(userId)})
            if(userCart) {
                let proExist = userCart.products.findIndex(product => product.item == productId);
                console.log(proExist)
                if(proExist != -1){
                    db.get().collection(collections.CART_COLLECTION)
                        .updateOne({userId: ObjectId(userId), 'products.item': ObjectId(productId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }).then((response) => {
                                resolve(response)
                            })
                } else {
                    db.get().collection(collections.CART_COLLECTION).updateOne({ userId: ObjectId(userId) }, {
                        $push: { products: proObj }
                    }).then((response) => {
                        resolve(response)
                    })
                }
                
            } else {
                let cartObj = {
                    userId: ObjectId(userId),
                    products: [proObj]
                }
                db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve(response);
                })
            }
        })
    },

    getCartbyUserId: function(userId) {
        return new Promise (async function (resolve, reject) {
            let cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([
                {
                    $match:{userId: ObjectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField:'_id',
                        as: 'product'
                    }
                },
                {
                    $project:{
                        item:1,
                        quantity:1,
                        coupon_code:1,
                        product: {$arrayElemAt:['$product',0]}
                    }
                }
            ]).toArray()
            // console.log(cartItems);
            if(cartItems.length == 0){
                resolve()
            } else {
                console.log("hereeee");
                resolve(cartItems)
            }
            
        })
    },
    
    getCartCount: function(userId) {
        return new Promise (async function(resolve, reject) {
            let count = 0;
            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({userId: ObjectId(userId)})
            if(cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },

    deleteProductfromCart:async function(proId, userId) {
        return new Promise (async function(resolve, reject) {
            await db.get().collection(collections.CART_COLLECTION).updateOne({userId: ObjectId(userId)},{
                $unset:{
                    coupon_code:""
                }
            })
            db.get().collection(collections.CART_COLLECTION)
                .updateOne({userId: ObjectId(userId)},
                {
                    $pull:{products:{item: ObjectId(proId)}}
            }).then((response) => {
                console.log(response);
                resolve(response)
            })
        })
    },

    changeQuantity:async (details, userId) => {
        details.count = parseInt(details.count)
        details.quan = parseInt(details.quantity)
        await db.get().collection(collections.CART_COLLECTION).updateOne({userId: ObjectId(userId)},{
            $unset:{
                coupon_code:""
            }
        })
        return new Promise(function (resolve, reject) {
            
            if(details.count == -1 && details.quantity == 1){
                db.get().collection(collections.CART_COLLECTION)
                    .updateOne({_id: ObjectId(details.cart)},
                    {
                        $pull:{products:{item: ObjectId(details.product)}}
                    }
                    ).then((response) => {
                        resolve({removeProduct: true})
                    })
            } else {
                db.get().collection(collections.CART_COLLECTION)
                .updateOne({_id:ObjectId(details.cart), 'products.item': ObjectId(details.product) },
                    {
                        $inc: { 'products.$.quantity': details.count }
                    }).then((response) => {
                        resolve({status: true})
                    })
            }
            
        })
    },

    getTotalAmount: (userId) => {
        return new Promise (async function (resolve, reject) {
            let total = await db.get().collection(collections.CART_COLLECTION).aggregate([
                {
                    $match:{userId: ObjectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField:'_id',
                        as: 'product'
                    }
                },
                {
                    $project:{
                        item:1,
                        quantity:1,
                        product: {$arrayElemAt:['$product',0]}
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity',{$toInt:'$product.price'}]}}
                    }
                }


            ]).toArray()

            console.log(total);
            if(total.length == 0){
                console.log("1");
                resolve(0)
            } else {
                console.log("2");
                let ftotal = total[0].total
                console.log("hereeee");
                ftotal = ftotal.toFixed(0)
                console.log(ftotal);
                resolve(ftotal)
            }
            
        })
    },

    getTotalOfferAmount: (userId) => {
        return new Promise (async function (resolve, reject) {
            let total = await db.get().collection(collections.CART_COLLECTION).aggregate([
                {
                    $match:{userId: ObjectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField:'_id',
                        as: 'product'
                    }
                },
                {
                    $project:{
                        item:1,
                        quantity:1,
                        product: {$arrayElemAt:['$product',0]}
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity',{$toInt:'$product.offerprice'}]}}
                    }
                }


            ]).toArray()

            console.log(total);
            if(total.length == 0){
                console.log("1");
                resolve(0)
            } else {
                console.log("2");
                let ftotal = total[0].total
                console.log("hereeee");
                ftotal = ftotal.toFixed(0)
                console.log(ftotal);
                resolve(ftotal)
            }
            
        })
    },

    getCouponDiscount:async function(userId, ftotal) {
        return new Promise(async function (resolve, reject) {
            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ userId: ObjectId(userId) })
            if(cart) {
                if (cart.coupon_code) {
                    let coupon = await db.get().collection(collections.COUPON_COLLECTION).findOne({ coupon_code: cart.coupon_code })
                    ftotal = ftotal * (coupon.discount / 100);
                    ftotal = parseInt(ftotal.toFixed(0))
                    resolve(ftotal)
                } else {
                    resolve(0)
                }
            } else {
                resolve(0)
            }
            
        })
    },

    getCartProductList: function(userId) {
        return new Promise (async function(resolve, reject) {
            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({userId: ObjectId(userId)});
            console.log(cart)
            if(cart.length > 0){
                resolve(cart.products)
            } else {
                resolve(cart.products)
            }
            
        })
    },

    isCoupon_Applied:async function(userId) {
        return new Promise(async function(resolve, reject) {
            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({userId: ObjectId(userId)});
            if(cart) {
                if(cart.coupon_code) {
                    resolve(cart.coupon_code)
                } else {
                    resolve(false)
                }
            } else {
                resolve(false)
            }
            
        })
    }
}