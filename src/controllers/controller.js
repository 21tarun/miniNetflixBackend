const sql = require('../db')
const {isValid}=require('../validators/validation')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const crypto = require("crypto");
const { exec } = require('child_process');

let runPythonCode = async (name) => {
    return new Promise(function (resolve, reject) {
        exec(`python  ../main.py "${name}"`, (err, stdout, stderr) => {
        
            if (err) {
              console.error(`exec error: ${err}`);
              return reject({ "error": err })
            }

            
            list=stdout.split("\r\n")
            return resolve(list)
            // console.error(`stderr: ${stderr}`);
    
    
        });



    })
}


const createUser = async function(req,res){
    try{
        const data=req.body
        console.log(data)
        if(!isValid(data.name)) return res.status(400).send({status:false,message:"name is mandatory"})
        if (!(data.name).match(/^[a-zA-Z_ ]+$/)) return res.status(400).send({ status: false, message: "give valid name" });
    
        //-------------email validations------------------------------
        if(!isValid(data.email)) return res.status(400).send({status:false,message:"email is mandatory"})
        if (!validator.isEmail(data.email)) return res.status(400).send({ status: false, message: "please enter valid email address!" })
    
        //-------------email uniqueness------------------------------
        let que = "SELECT * FROM users WHERE email='"+data.email+"'"
        const user=await sql(que)
        if(user.length>0) return res.status(401).send({status:false, message:"email already exist"})
        
    
        // if (!isValid(data.phone)) return res.status(400).send({ status: false, message: "phone is mandatory" });
        // if (!(data.phone.match(/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/))) return res.status(400).send({ status: false, message: "phone number is not valid" })
        // if(data.phone.length==10) data.phone='91'+data.phone
    
        if(!isValid(data.password)) return res.status(400).send({status:false,message:"password is mandatory"})
        if(data.password.length<5 || data.password.length>10) return res.status(400).send({status:false,message:"password length should be in range 5-10"})
    
    
        const Id = crypto.randomBytes(16).toString("hex")
       
    
        const subscription =false
        const isDeleted= false
    
    
    
        const endOfSubs=String(Date.now())
        
        let query="INSERT INTO users VALUES ?"
        var values=[[Id,data.name,data.email,data.password,subscription,endOfSubs,isDeleted]]
        let data1 =await sql(query,[values])
        res.status(201).send({status:true,data:data1})
    }
    catch(err){
        res.status(500).send({status:false,message:err.message})

    }
}

const login = async function(req,res){
    try{
        const data =req.body
        const email =data.email
        const password=data.password
        let query = "SELECT * FROM users WHERE email='"+email+"' AND UserPassword='"+password+"'"
        
        const user=await sql(query)
        console.log(user)
    
        if(user.length==0) return res.status(401).send({status:false, message:"user credential wrong"})
       
    
        let token = jwt.sign({ userId: user[0].Id }, "Secret-key")
        
        res.status(200).send({status:true,message:"you are authorised",userId:user[0].Id,token:token,endOfSubs:user[0].endOfSubs})
    }
    catch(err){
        res.status(500).send({status:false,message:err.message})

    }


}

const emailCheck = async function(req,res){
    try{
        const email =req.body.email
        let query = "SELECT * FROM users WHERE email='"+email+"'"
        const user=await sql(query)
        if(user.length==0) return res.status(401).send({status:false, message:"email not exist"})
        return res.status(401).send({status:true, message:"email exist"})
    }
    catch(err){
        res.status(500).send({status:false,message:err.message})
    }
}


const subscription = async function(req,res){
    try{
        // authentication
        const token = req.headers['x-api-key']
        console.log(token)
        if(!token) return res.status(403).send({status:false,message:"token is missing"})
        let decode=jwt.verify(token,'Secret-key',function(err,decode){
            if(err)return res.status(403).send({status:false,message:"token is not valid"})
            else req.userId=decode.userId
        })


        const amount =req.body.amount
        console.log(amount)
        let endOfSubs
        if(!amount) return res.status(400).send({status:false,message:"select subscription plan"})
        if(amount=='199'){
            endOfSubs=Date.now()+ 1*30*24*60*60*1000
        }
        if(amount=='599'){
            endOfSubs=Date.now()+ 4*30*24*60*60*1000
        }
        if(amount=='799'){
            endOfSubs=Date.now()+ 6*30*24*60*60*1000
        }
       
        let query = "UPDATE users SET endOfSubs='"+endOfSubs+"' WHERE Id='"+req.userId+"'"
        const update=await sql(query)
        if(!update) return res.status(400).send({status:false,message:"try to update again"})

        res.status(200).send({status:true,message:"subscription success",endOfSubs:endOfSubs})

        

    }
    catch(err){
        res.status(500).send({status:false,message:err.message})
    }
}

const getMovies =async function(req,res){
    try{

        
        //atuhentication
        const token = req.headers['x-api-key']
        if(!token) return res.status(403).send({status:false,message:"token is missing"})
        let decode=jwt.verify(token,"Secret-key",function(err,decode){
            if(err)return res.status(403).send({status:false,message:"token is not valid"})
            else req.userId=decode.userId
        })
        
        let query = "SELECT * FROM users WHERE Id='"+req.userId+"'"
    
        const user=await sql(query)
        console.log(user[0].endOfSubs)
        // if(user[0].endOfSubs<Date.now()) return res.status(403).send({status:false,message:"no subscription"})

        

        const currentDate = new Date() 
        const currentYear = currentDate.getFullYear()
        let currentMonth=currentDate.getMonth()+1
        if(currentMonth<=9) currentMonth = "0"+String(currentMonth)
        let currentDay=currentDate.getDate()
        if(currentDay<=9) currentDay = "0"+String(currentDay)
        let date=String(currentYear)+'-'+String(currentMonth)+'-'+String(currentDay)

        //for letest top 5 movies
        query="SELECT Release_Date,Poster_Url,Title,id FROM movies1 WHERE Release_Date<'"+date+"' ORDER BY Release_Date DESC LIMIT 5"
        const latest =await sql(query)

        // top 50 most popular movies
        query="SELECT Poster_Url,Title,id FROM movies1 ORDER BY Popularity DESC LIMIT 50"
        const popular=await sql(query)

        // top 50 most liked movies 
        query="SELECT Poster_Url,Title,id FROM movies1 ORDER BY Vote_Count DESC LIMIT 50"
        const liked=await sql(query)

        // romantic movies 
        query="SELECT Poster_Url,Title,id FROM movies1 WHERE Genre REGEXP 'Romance' LIMIT 50"
        const romantic=await sql(query)

        // Horror movies  
        query="SELECT Poster_Url,Title,id FROM movies1 WHERE Genre REGEXP 'Horror' LIMIT 50"
        const horror=await sql(query)

        // animation movies  
        query="SELECT Poster_Url,Title,id FROM movies1 WHERE Genre REGEXP 'Animation' LIMIT 50"
        const animation=await sql(query) 

        // Science Fiction movies  
        query="SELECT Poster_Url,Title,id FROM movies1 WHERE Genre REGEXP 'Science Fiction' LIMIT 50"
        const fiction=await sql(query) 
        
        // thriller movies  
        query="SELECT Poster_Url,Title,id FROM movies1 WHERE Genre REGEXP 'Thriller' LIMIT 50"
        const thriller=await sql(query)         

        data={
            'latest':latest,
            'popular':popular,
            'liked':liked,
            'romantic':romantic,
            'horror':horror,
            'animation':animation,
            'fiction':fiction,
            'thriller':thriller
        }
        
        res.status(200).send({status:true,movies:"you can watch movies",data:data})

    }
    catch(err){
        res.status(500).send({status:false,message:err})
    }
}

const searchRes =async function(req,res){
    try{
        let searchData=req.body.text
        // search movies  
        query="SELECT Poster_Url,Title,id FROM movies1 WHERE LOWER(Title) REGEXP '"+searchData+"' LIMIT 50"
        const data=await sql(query)     
        res.status(200).send({status:true,message:"success",data:data})
    }
    catch(err){
        res.status(500).send({status:false,message:err})
    }

}

const movieById =async function(req,res){
    try{
        let id=req.params.id
        let query="SELECT * FROM movies1 WHERE id='"+id+"'"
        const movie=await sql(query)  
        if(movie.length==0) return res.status(404).send({status:false,message:'no movie found'})
        res.status(200).send({status:true,message:"success",data:movie[0]})


    }
    catch(err){
        res.status(500).send({status:false,message:err})
    }
}


const getRecommendedMovies =async function(req,res){
    
    let name= req.body.name
    console.log(name)
    if(!name) return res.status(400).send({status:true,message:"name is required for recommendation"})
    

    let list= await runPythonCode(name)


    query="SELECT Poster_Url, Title, id FROM movies1 WHERE Title IN (?)"
    const data=await sql(query, [list]) 
    res.status(200).send({status:true,data:data})

}






module.exports.createUser=createUser
module.exports.login=login
module.exports.emailCheck=emailCheck
module.exports.getMovies=getMovies
module.exports.subscription=subscription
module.exports.searchRes=searchRes
module.exports.movieById=movieById
module.exports.getRecommendedMovies=getRecommendedMovies