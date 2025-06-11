const Tought = require('../models/Tought')
const User = require('../models/User')


// Criando operador para buscar no sql por like
const {Op} = require('sequelize')


module.exports = class ToughtController {
    static async showToughts(req, res) {

        let search = ''

        if(req.query.search) {
            search = req.query.search
        }

        let order = 'DESC'

        if(req.query.order === 'old') {
            order = 'ASC'
        } else {
            order = 'DESC'
        }

        const toughtData = await Tought.findAll({
            include: User,
            // Criando a função para filtrar a partir do search dentro de %% informa que não importa se tem conteúdo antes ou depois, ele vai trazer os dados que possuem o que foi escrito pelo usuária
            where: {
                title:  {[Op.like]: `%${search}%`}
            },
            order: [['createdAt', order]]
        })

        const toughts = toughtData.map((result) => result.get({ plain: true }))

        // Contando quantos pensamentos foram encontrados pela busca

        let toughtsQty = toughts.length

        if(toughtsQty === 0) {
            toughtsQty = false
        }

        await res.render('toughts/home', { toughts, search, toughtsQty })
    }

    static async dashboard(req, res) {

        const userId = req.session.userId;

        const user = await User.findOne({
            where: {
                id: userId
            },
            // Se trouxer o usuário, aqui dessa forma eu trago todos os pensamentos dele com o include
            include: Tought,
            // plain para trazer os melhores dados para manipulação
            plain: true
        })

        // Verificando se Usuário existe
        if (!user) {
            res.redirect('/login')
        }
        // Map no array para utilização apenas dos valores necessários
        const toughts = user.Toughts.map((result) => result.dataValues)

        let emptyToughts = false

        if (toughts.length === 0) {
            emptyToughts = true
        }

        res.render('toughts/dashboard', { toughts, emptyToughts })
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
                return res.redirect('/toughts/dashboard')
            })

        } catch (e) {
            console.log('Verificar erro', e)
        }

    }
    // Removendo pensamento
    static async removeTought(req, res) {
        const id = req.body.id
        const UserId = req.session.userId

        try {
            await Tought.destroy({ where: { id: id, UserId: UserId } })
            req.flash('message', 'Pensamento criado com sucesso!')

            req.session.save(() => {
                return res.redirect('/toughts/dashboard')
            })
        } catch (e) {
            console.log('Erro ao apagar registro', e)
        }
    }

    static async updateTought(req, res) {
        const id = req.params.id

        const tought = await Tought.findOne({ where: { id: id }, raw: true })

        res.render('toughts/edit', { tought })
    }

    static async updateToughtSave(req, res) {

        const id = req.body.id

        const tought = {
            title: req.body.title
        }

        try {
            await Tought.update(tought, { where: { id: id } })
            req.flash('message', 'Pensamento atualizado com sucesso!')
            req.session.save(() => {
                return res.redirect('/toughts/dashboard')
            })

        } catch (e) {
            console.log('Erro ao atualizar pensamento', e)
        }
    }

}