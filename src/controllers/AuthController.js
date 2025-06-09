// Import do model User
const User = require('../models/User')
// Import do bcrypt para criptografar as senhas
const bcrypt = require('bcryptjs')

module.exports = class AuthController {
    static login(req, res) {
        res.render('auth/login')
    }
    static register(req, res) {
        res.render('auth/register')
    }

    static async registerPost(req, res) {
        const { name, email, password, confirmpassword } = req.body;

        // Validação da senha
        if(password != confirmpassword){
            // message
            req.flash('message', 'As senhas não estão iguais, tente novamente!')
            res.render('auth/register')

            return;
        }
    }
}