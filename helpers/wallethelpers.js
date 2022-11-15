var db = require('../database/connection');
var collections = require('../database/collections');
const { ObjectId } = require('mongodb');

module.exports = {
    createWallet: function(userId) {
        return new Promise(function(resolve, reject) {
            let walletobj = {
                userId : ObjectId(userId),
                amount:0,
                transaction:[]
            }
            db.get().collection(collections.WALLET_COLLECTION).insertOne(walletobj).then((res) => {
                resolve(res)
            })
        })
    },
    getUserWallet: function(userId) {
        return new Promise(function(resolve, reject) {
            db.get().collection(collections.WALLET_COLLECTION).findOne({userId: ObjectId(userId)}).then((res) => {
                resolve(res)
            })
        })
    },
    debitWallet: function(userId,orderId, amount) {
        return new Promise(function(resolve, reject) {
            let date = new Date();
            let transactionobj = {
                orderId: orderId,
                amount: -amount,
                date: date
            }
            db.get().collection(collections.WALLET_COLLECTION).updateOne({userId: ObjectId(userId)}, {
                $push:{
                    transaction: transactionobj
                },
                $inc:{
                    amount: -amount
                }
            }).then((res) => {
                resolve(res)
            })
        })
    },
    creditWallet: function(userId,orderId, amount) {
        return new Promise(function(resolve, reject) {
            let date = new Date();
            let transactionobj = {
                orderId: orderId,
                amount: amount,
                date: date
            }
            db.get().collection(collections.WALLET_COLLECTION).updateOne({userId: ObjectId(userId)}, {
                $push:{
                    transaction: transactionobj
                },
                $inc:{
                    amount: amount
                }
            }).then((res) => {
                resolve(res)
            })
        })
    }
}