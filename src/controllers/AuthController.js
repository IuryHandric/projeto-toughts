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

        // Checando se o email já existe
        const checkIfUserExists = await User.findOne({where: {email: email}})

        if(checkIfUserExists){
            req.flash('message', 'O e-mail já está em uso!')
            res.render('auth/register')

            return
        }


        // Criando a senha com bcrypt
        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(password, salt)
        // Definindo que password passa a ser hashedPassword
        const user = {
            name,
            email,
            password: hashedPassword
        }

        try {
            const createdUser = await User.create(user)  

            // Inicializando a sessão
            req.session.userId = createdUser.id
            req.flash('message', 'Usuário cadastrado com sucesso!')
            req.session.save(() => {
                res.redirect('/')
            })
            console.log(`Usuário ${name}, cadastrado com sucesso!`)     
        } catch (e) {
            console.log('Erro ao enviar', e)
        }
    }

    static logout(req, res) {
        req.session.destroy();
        res.redirect('/login')
    }

    static async loginPost(req, res) {

        const {email, password} = req.body

        // Verificando se o usuário existe

        const user = await User.findOne({where: {email: email}})

        if(!user) {
            req.flash('message', 'Usuário não encontrado!')
            res.render('auth/login')
        }
        // Checando se a senha pertence ao usuário
       
        const passwordMatch = bcrypt.compareSync(password, user.password)

        if(!passwordMatch) {
            req.flash('message', 'Senha incorreta!')
            res.render('auth/login')
            return
        }

        // Inicializando a sessão

            // Inicializando a sessão
            req.session.userId = user.id
            req.flash('message', 'Autenticação realizada com sucesso!')
            req.session.save(() => {
                res.redirect('/');
            })
    }
    
}