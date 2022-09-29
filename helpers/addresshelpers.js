var db = require('../database/connection');
var collections = require('../database/collections');
const { ObjectId, ObjectID } = require('mongodb');
require('dotenv').config()

module.exports ={
    addAddress: function(addressDetails, userId) {
        return new Promise (function (resolve, reject){
            addressDetails.userId = userId
            db.get().collection(collections.ADDRESS_COLLECTION).insertOne(addressDetails).then((response) => {
                resolve(response)
            })
        })
    },

    getAllAddress :function() {
        return new Promise (async function(resolve, reject){
            let addresses = await db.get().collection(collections.ADDRESS_COLLECTION).find().toArray()
            resolve(addresses)
        })
    },

    getAddressbyId :function(id) {
        return new Promise(async function(resolve, reject) {
            let address = await db.get().collection(collections.ADDRESS_COLLECTION).findOne({_id:ObjectId(id)})
            resolve(address)
        })
    },

    getAllAddressbyUserId: function(userId) {
        return new Promise(async function(resolve, reject) {
            let addresses = await db.get().collection(collections.ADDRESS_COLLECTION).find({userId:userId}).toArray();
            resolve(addresses)
        })
    },

    editAddress: function(addressData,id) {
        return new Promise(function(resolve, reject) {
            db.get().collection(collections.ADDRESS_COLLECTION).updateOne({_id:ObjectId(id)}, {
                $set:{
                    firstname: addressData.firstname,
                    secondname: addressData.secondname,
                    address: addressData.address,
                    city: addressData.city,
                    state: addressData.state,
                    pincode: addressData.pincode,
                    number: addressData.number
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },

    deleteAddress: function(id) {
        return new Promise(function(resolve, reject) {
            db.get().collection(collections.ADDRESS_COLLECTION).deleteOne({_id:ObjectId(id)}).then((response) => {
                resolve(response)
            })
        })
    }
}