const mysql =require('mysql')

// var connection =mysql.createConnection({
//     host:'127.0.0.1',
//     port:3306,
//     user: 'root',
//     password: 'tarun1616',
//     database:'miniNetflix' 
// })

var connection =mysql.createConnection({
    host:'bpa6gjv179azmnvmktmj-mysql.services.clever-cloud.com',
    port:3306,
    user: 'u1mtbixgquowjhyv',
    password: 'O7egRgdI6WOwdyeYpVyH',
    database:'bpa6gjv179azmnvmktmj' 
})


connection.connect(function(err){
    if(err){
        console.log('error connecting '+ err.stack);
        return;
    }
    console.log("connected as id "+ connection.threadId)
})

const sql = function (sqlQuery,params){
    return new Promise((resolve,reject)=>{
        connection.query(sqlQuery,params,(err,result)=>{
            if(err){reject(new Error());}
            else{resolve(result)}
        })
    })
}

module.exports=sql