const isValid = function(value){
    if(value==null || value ==undefined) return false
    if(typeof(value)=='number') return false
    if(typeof(value)=='string' && value.trim()=="") return false
    else return true
}

module.exports={isValid}