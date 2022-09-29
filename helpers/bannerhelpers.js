var db = require('../database/connection');
var collections = require('../database/collections');
const { ObjectId } = require('mongodb');


module.exports = {
    addNewBanner: function(bannerData) {
        return new Promise(function(resolve, reject) {
            db.get().collection(collections.BANNER_COLLECTION).insertOne(bannerData).then((response) => {
                resolve(response)
            })
        })   
    },

    getAllBanners: function() {
        return new Promise(function(resolve, reject) {
            db.get().collection(collections.BANNER_COLLECTION).find().toArray().then((response) => {
                resolve(response)
            })
        })
    },

    updateBanner: function (id, bannerData) {
        return new Promise(function(resolve, reject) {
            db.get().collection(collections.BANNER_COLLECTION).updateOne({_id: ObjectId(id)}, {
                $set:{
                    banner_img: bannerData.banner_img,
                    banner_title: bannerData.banner_title,
                    banner_phrase: bannerData.banner_phrase,
                    banner_route: bannerData.banner_route
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    
    getBannerbyId: function(id) {
        return new Promise (function(resolve, reject) {
            db.get().collection(collections.BANNER_COLLECTION).findOne({_id: ObjectId(id)}).then((response) => {
                resolve(response)
            })
        })
    },

    deleteBanner: function(id) {
        return new Promise (function (resolve, reject) {
            db.get().collection(collections.BANNER_COLLECTION).deleteOne({_id: ObjectId(id)}).then((response) => {
                resolve(response)
            })
        })
    }
}