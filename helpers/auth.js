module.exports.checkAuth = (req, res, next) => {
    const userId = req.session.userId

    try {
        if(!userId) {
            res.redirect('/login')
        }
        next()
    } catch (e) {
        console.log('Erro de renderização', e)        
    }


}