var db = require('../database/connection');
var collections = require('../database/collections')

module.exports = {
    findOrdersByDay:()=>{
        return new Promise (async(resolve,reject)=>{
            
            let data = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                
                {
                    $match:{ date:{
                            $gte: new Date(new Date() - 60*60*24*1000*7)
                        }
                    }
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                        day: { $dayOfMonth: "$date" },
                        dayOfWeek: { $dayOfWeek: "$date" },
                    }
                },
                {
                    $group:{
                        _id:'$dayOfWeek',
                        count:{$sum:1},
                        detail:{$first:'$$ROOT'}
                    }
                },
                {
                    $sort:{detail:1}
                }
        ]).toArray()
            // console.log(data);
            
            resolve(data)
        })
    }
}