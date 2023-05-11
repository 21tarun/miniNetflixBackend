const express =require('express')
const router = express.Router()
const controller =require('../controllers/controller')



router.get('/',function(req,res){
    res.json({message:"Home page"})
})
// router.get('/',controller.loginOption)
router.post('/checkEmail',controller.emailCheck)
router.post('/user',controller.createUser)
router.post('/login',controller.login) 
router.get('/movies',controller.getMovies)
router.post('/search',controller.searchRes)
router.put('/subscription',controller.subscription)
router.get('/movieById/:id',controller.movieById)
router.post('/getRecommendedMovies',controller.getRecommendedMovies)


module.exports =router