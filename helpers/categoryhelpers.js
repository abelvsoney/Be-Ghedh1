var db = require('../database/connection');
var collections = require('../database/collections');
const { ObjectID } = require('bson');

module.exports = {
    getAllCategories:function(){
        return new Promise (async function(resolve, reject){
            let categories = await db.get().collection(collections.CATEGORIES_COLLECTION).find().toArray();
            resolve(categories)
        })
    },
    addCategory:function(categoryData){
        return new Promise (async function(resolve, reject){
            let categoryId = categoryData.brand+categoryData.categoryname.trim()
            categoryData.categoryId = categoryId
            var isThere = await db.get().collection(collections.CATEGORIES_COLLECTION).findOne({categoryId: categoryData.categoryId});
            if(isThere){
                resolve(false)
            } else {
                db.get().collection(collections.CATEGORIES_COLLECTION).insertOne(categoryData).then((data) => {
                    resolve(data)
                })
            }
        })
    },
    deleteCategory:function(categoryId){
        return new Promise (async function(resolve, reject){
            db.get().collection(collections.CATEGORIES_COLLECTION).findOneAndDelete({categoryId:categoryId}).then((response) =>{
                db.get().collection(collections.PRODUCT_COLLECTION).deleteMany({ $and:[{category: response.value.categoryname}, {brand_name: response.value.brand}] }).then((result) => {
                    resolve(result)
                })   
            })
        })
    },
    getCategorybyBrand:function(brandname){
        return new Promise (async function(resolve, reject){
            let categories = await db.get().collection(collections.CATEGORIES_COLLECTION).find({brand:brandname}).toArray()
            resolve(categories)
        })
    }
}