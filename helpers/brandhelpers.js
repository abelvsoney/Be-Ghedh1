var db = require('../database/connection');
var collections = require('../database/collections');
const { ObjectID } = require('bson');

module.exports ={
    addBrand:function(brandDetails){
        return new Promise (async function(resolve, reject){
            var isThere = await db.get().collection(collections.BRANDS_COLLECTION).findOne({brandname: brandDetails.brandname});
            if(isThere){
                resolve(false)
            } else {
                db.get().collection(collections.BRANDS_COLLECTION).insertOne(brandDetails).then((data) => {
                    resolve(data)
                })
            } 
        })
    },
    getAllBrands:function(){
        return new Promise (async function(resolve, reject){
            let brands = await db.get().collection(collections.BRANDS_COLLECTION).find().toArray();
            resolve(brands)
        })
    },
    deleteBrand:function(userId, brandname){
        return new Promise (async function(resolve, reject){
            db.get().collection(collections.BRANDS_COLLECTION).deleteOne({_id:ObjectID(userId)}).then((response) =>{
                db.get().collection(collections.CATEGORIES_COLLECTION).deleteMany({brand:brandname}).then((response) =>{
                    db.get().collection(collections.PRODUCT_COLLECTION).deleteMany({brand_name: brandname}).then((response) => {
                        resolve(response)
                    })
                })
            })
        })
    }
}