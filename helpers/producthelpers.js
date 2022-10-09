var db = require('../database/connection');
var collections = require('../database/collections');
const { response } = require('express');
const { ObjectID } = require('bson');

module.exports ={
    addProduct:function(productData){
        return new Promise (async function(resolve, reject){
            let productId = productData.product_name+productData.brand_name+productData.category+productData.size+productData.color.trim()
            productData.productId = productId;  
            var isThere = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({productId: productData.productId})
            if(isThere){
                resolve(false)
            } else {
                let sizeId = productData.product_name + productData.brand_name + productData.category + productData.size;
                productData.sizeId = sizeId;
                let commonId = productData.product_name + productData.brand_name + productData.category;
                productData.commonId = commonId
                productData.blocked = false;
                productData.quantity = parseInt(productData.quantity)
                productData.price = parseInt(productData.price)
                productData.offerprice = productData.price;
                db.get().collection(collections.PRODUCT_COLLECTION).insertOne(productData).then((response) => {
                    resolve(response)
                })
            }
        })
    },

    getAllProducts:function(){
        return new Promise (async function(resolve, reject){
            let products = await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },

    getAllActiveProducts:function(){
        return new Promise (async function(resolve, reject){
            let products = await db.get().collection(collections.PRODUCT_COLLECTION).find({blocked: false}).toArray()
            resolve(products)
        })
    },

    deleteProduct:function(id){
        return new Promise (function(resolve, reject){
            db.get().collection(collections.PRODUCT_COLLECTION).deleteOne({_id: ObjectID(id)}).then((response) => {
                resolve(response)
            })
        })
    },
    
    getProductById:function(id){
        return new Promise (function (resolve, reject){
            db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:ObjectID(id)}).then((response) => {
                resolve(response)
            })
        })
    },

    updateProduct:async function(id, productData){

        return new Promise (async function (resolve, reject){
            productData.productoffer = parseInt(productData.productoffer)
            let p = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:ObjectID(id)});
            if(productData.productoffer > 0) {
                let offerprice;
                if(p.productoffer == productData.productoffer) {
                    offerprice = parseInt(p.offerprice.toFixed(0))
                } else {
                    offerprice = p.price - (p.price*(productData.productoffer/100))
                    offerprice = parseInt(offerprice.toFixed(0))
                }
                productData.offerprice = offerprice;
            } else {
                productData.offerprice = p.price;
            }

            let productId = productData.product_name+productData.brand_name+productData.category+productData.size+productData.color.trim()
            productData.productId = productId;
            let commonId = productData.product_name+productData.brand_name+productData.category;
            productData.commonId = commonId;
            productData.quantity = parseInt(productData.quantity)
            productData.price = parseInt(productData.price)

                db.get().collection(collections.PRODUCT_COLLECTION).updateOne({ _id: ObjectID(id) }, {
                    $set: {
                        commondId: productData.commonId,
                        productId: productData.productId,
                        product_name: productData.product_name,
                        product_description: productData.product_description,
                        quantity: productData.quantity,
                        price: productData.price,
                        category: productData.category,
                        color: productData.color,
                        size: productData.size,
                        img_url1: productData.img_url1,
                        img_url3: productData.img_url2,
                        img_url3: productData.img_url3,
                        img_url4: productData.img_url4,
                        productoffer: productData.productoffer,
                        offerprice: productData.offerprice
                    }
                }).then((response) => {
                    console.log(response)
                    resolve(response)
                })          
        })
    },

    changeStatus:function(id){
        return new Promise (async function(resolve, reject){
            let product = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id : ObjectID(id)})
            if(product.blocked == true){
                db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id: ObjectID(id)},{
                    $set:{
                        blocked : false
                    }
                }).then(() => {
                    resolve("unblocked")
                })
            } else {
                db.get().collection(collections.PRODUCT_COLLECTION).updateOne({ _id: ObjectID(id) }, {
                    $set: {
                        blocked: true
                    }
                }).then((response) => {
                    resolve("blocked")
                })
            }
        })
    },

    getSizesOfProduct: function(commonId) {
        return new Promise(async function(resolve, reject){
            console.log(commonId);
            let sizes = await db.get().collection(collections.PRODUCT_COLLECTION).find({commonId: commonId}).project({size:1, _id:0}).toArray();
            
            let uniqueSize = [...sizes.reduce((map, obj) => map.set(obj.size, obj), new Map()).values()];
            uniqueSize = uniqueSize.sort();
            resolve(uniqueSize)
        })
    },

    getAllUniqueProducts: function(){
        return new Promise(async function(resolve, reject){
            db.get().collection(collections.PRODUCT_COLLECTION).find()
        })
    }
}