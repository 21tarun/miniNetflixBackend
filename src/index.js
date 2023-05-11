const express =require('express')
const app =express()
const route =require('./routes/route')
const cors=require('cors')

app.use(express.json())
app.use(express.urlencoded());
app.use(cors())






app.use('/',route)

app.listen(4000 , function(){
    console.log("server running on port "+4000)
})












