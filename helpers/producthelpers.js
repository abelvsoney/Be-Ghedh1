var db = require('../database/connection');
var collections = require('../database/collections');
const { response } = require('express');
const { ObjectID } = require('bson');
const { CATEGORIES_COLLECTION } = require('../database/collections');

module.exports ={
    addProduct:function(productData){
        return new Promise (async function(resolve, reject){
            let productId = productData.product_name+productData.brand_name+productData.category+productData.size+productData.color.trim()
            productData.productId = productId;  
            var isThere = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({productId: productData.productId})
            if(isThere){
                resolve(false)
            } else {
                let categoryDetails = await db.get().collection(CATEGORIES_COLLECTION).findOne({brand: productData.brand_name, categoryname: productData.category});
                if(categoryDetails.offer) {
                    productData.categoryOffer = categoryDetails.offer;
                    // productData.totalOffer = categoryDetails.offer;
                } else {
                    productData.categoryOffer = 0;
                    productData.totalOffer = 0;
                }

                let sizeId = productData.product_name + productData.brand_name + productData.category + productData.size;
                productData.sizeId = sizeId;
                let commonId = productData.product_name + productData.brand_name + productData.category;
                productData.commonId = commonId
                productData.blocked = false;
                productData.quantity = parseInt(productData.quantity)
                productData.price = parseInt(productData.price)
                productData.offerprice = productData.price;
                productData.productoffer = 0;
                console.log(productData);
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
    
    getProductById:async function(id){
        return new Promise (async function (resolve, reject){
            let productData = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:ObjectID(id)});
            console.log(productData)
            let coffer = parseInt(productData.totalOffer - productData.productoffer);
            if(coffer != productData.categoryOffer) {
                if(productData.categoryOffer > 0) {
                    let off = parseInt(productData.totalOffer - coffer);
                    off = parseInt(off + productData.categoryOffer);
                    productData.totalOffer = parseInt(off);

                    let catOffprice = parseInt((coffer/100) * productData.price);
                    let ucofferprice = parseInt(productData.price + catOffprice);
                    let offp = parseInt(off/100 * productData.price);
                    offp = parseInt(offp.toFixed(0))
                    productData.offerprice = (parseInt);
                } else {
                    productData.totalOffer = parseInt(productData.productoffer);
                    let ucofferprice = parseInt(productData.price - productData.price * (productData.productoffer/100));
                    ucofferprice = parseInt(ucofferprice.toFixed(0))
                    productData.offerprice = parseInt(ucofferprice);
                }
                await db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id:ObjectID(id)}, {
                    $set:{
                        totalOffer: productData.totalOffer,
                        offerprice: productData.offerprice
                    }
                })
            }
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
                if(p.productoffer == productData.productoffer) {
                    productData.offerprice = p.offerprice
                    productData.totalOffer = p.totalOffer
                    // offerprice = parseInt(p.offerprice.toFixed(0))
                } else {
                    // offerprice = p.price - (p.price*(productData.productoffer/100))
                    // offerprice = parseInt(offerprice.toFixed(0))
                    let pofferprice = p.price * (p.productoffer/100);   //currentofferprice
                    console.log(pofferprice);
                    let uofferprice = p.offerprice + pofferprice;   //updatedofferprice
                    let npofferprice = p.price * (productData.productoffer/100);  //newofferprice
                    productData.offerprice = parseInt(parseInt(uofferprice - npofferprice).toFixed(0));

                    let ctotalOffer = p.totalOffer - parseInt(p.productoffer);
                    ctotalOffer = ctotalOffer + parseInt(productData.productoffer);
                    productData.totalOffer = ctotalOffer
                }
                // productData.offerprice = offerprice;
            } else {
                let pofferprice = p.price * (p.productoffer/100);   //currentofferprice
                console.log(pofferprice);
                let uofferprice = p.offerprice + pofferprice;   //updatedofferprice
                uofferprice = parseInt(uofferprice.toFixed(0));
                productData.offerprice = uofferprice;
                let ctotalOffer = p.totalOffer - parseInt(p.productoffer);
                productData.totalOffer = ctotalOffer
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
                        productoffer: productData.productoffer,
                        offerprice: productData.offerprice,
                        totalOffer: productData.totalOffer
                    }
                }).then((response) => {
                    console.log(id)
                    resolve(id)
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
            let sizes = await db.get().collection(collections.PRODUCT_COLLECTION).find({commonId: commonId}).project({size:1, _id:1}).toArray();
            
            let uniqueSize = [...sizes.reduce((map, obj) => map.set(obj.size, obj), new Map()).values()];
            uniqueSize = uniqueSize.sort();
            console.log(uniqueSize);
            resolve(uniqueSize)
        })
    },

    getAllUniqueProducts: function(){
        return new Promise(async function(resolve, reject){
            db.get().collection(collections.PRODUCT_COLLECTION).find({blocked: false}).toArray().then((res) => {
                console.log(res);
                res.forEach((element, i, a) => {
                    res.forEach((item, index, arr) => {
                        if(item.commonId == element.commonId && index != i) {
                            console.log(true)
                            arr.splice(index, 1);
                        }
                    });
                });
                resolve(res)
            })
        })
    },

    getAllProductsByBrand: function(brand_name) {
        return new Promise(async function(resolve, reject) {
            db.get().collection(collections.PRODUCT_COLLECTION).find({brand_name: brand_name}).toArray().then((res) => {

                resolve(res)
            })
        })
    },

    getAllProductsByBrand_Category:async function(catid) {
        let catDetails = await db.get().collection(collections.CATEGORIES_COLLECTION).findOne({categoryId: catid});
        console.log(catDetails);
        return new Promise(function(resolve, reject) {
            db.get().collection(collections.PRODUCT_COLLECTION).find({brand_name: catDetails.brand, category: catDetails.categoryname}).toArray().then((res) => {
                let obj = {
                    products: res,
                    currentBrand: catDetails.brand
                }
                resolve(obj)
            })
        })
    },

    getFourLatesProduct: async function() {
        return new Promise(function(resolve, reject) {
            
        })
    }
}