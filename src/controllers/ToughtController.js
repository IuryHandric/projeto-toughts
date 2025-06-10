const Tought = require('../models/Tought')
const User = require('../models/User')


module.exports = class ToughtController {
    static async showToughts(req, res) {
        await res.render('toughts/home')
    }

    static async dashboard(req, res) {

        const userId = req.session.userId;

        const user = await User.findOne({
            where: {
                id: userId},
                // Se trouxer o usuário, aqui dessa forma eu trago todos os pensamentos dele com o include
                include: Tought,
                // plain para trazer os melhores dados para manipulação
                plain: true
        })

        // Verificando se Usuário existe
        if(!user) {
            res.redirect('/login')
        }
        // Map no array para utilização apenas dos valores necessários
        const toughts = user.Toughts.map((result) => result.dataValues)

        console.log(toughts)

        res.render('toughts/dashboard', {toughts})
    }

    static createTought(req, res) {
        res.render('toughts/create')
    }

    // Criando pensamento
    // Pegando UserID a partir da sessão

    static async createToughtSave(req, res) {

        const tought = {
            title: req.body.title.trim(), // Retirnando espaços vazios desnecessários
            UserId: req.session.userId
        }
        // Verificação se foi enviado um texto e se foi passado apenas espaços em branco também.
        if (!tought.title || tought.title.trim() === '') {
            req.flash('message', 'Digite um pensamento antes de enviar!')
            return res.redirect('add')
        }

        try {
            await Tought.create(tought)
            req.flash('message', 'Pensamento criado com sucesso!')

            req.session.save(() => {
                res.redirect('/toughts/dashboard')
            })

        } catch (e) {
            console.log('Verificar erro', e)
        }

    }

}