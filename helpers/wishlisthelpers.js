var db = require('../database/connection');
var collections = require('../database/collections');
const { ObjectId } = require('mongodb');

module.exports = {
    addToWishlist: function(productId, userId) {
        return new Promise (async function(resolve, reject) {
            if(userId.length < 1) {
                resolve(false)
            }
            let proObj = {
                item : ObjectId(productId),
            }
            let userCart = await db.get().collection(collections.WISHLIST_COLLECTION).findOne({userId: ObjectId(userId)})
            if(userCart) {
                let proExist = userCart.products.findIndex(product => product.item == productId);
                console.log(proExist)
                if(proExist != -1){
                    resolve(false)
                } else {
                    db.get().collection(collections.WISHLIST_COLLECTION).updateOne({ userId: ObjectId(userId) }, {
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
                db.get().collection(collections.WISHLIST_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve(response);
                })
            }
        })
    },

    getProductsfromWishlist: function(userId) {
        return new Promise(async function(resolve, reject) {
            let cartItems = await db.get().collection(collections.WISHLIST_COLLECTION).aggregate([
                {
                    $match:{userId: ObjectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item'
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
                        product: {$arrayElemAt:['$product',0]}
                    }
                }
            ]).toArray()
            console.log(cartItems);
            if(cartItems.length == 0){
                resolve()
            } else {
                console.log("hereeee");
                resolve(cartItems)
            }
        })
    },

    deletefromWishlist: function(userId, proId) {
        return new Promise (function(resolve, reject) {
            db.get().collection(collections.WISHLIST_COLLECTION)
                    .updateOne({userId: ObjectId(userId)},
                    {
                        $pull:{products:{item: ObjectId(proId)}}
                    }
                    ).then((response) => {
                        resolve({removeProduct: true})
                    })
        })
    }
}