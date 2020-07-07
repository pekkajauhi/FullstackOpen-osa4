const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const body = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  if(body.username.length > 2 && body.password.length > 2){
    const user = new User({
        username: body.username,
        name: body.name,
        passwordHash,
      })
    
      const savedUser = await user.save()
    
      response.json(savedUser)
  }else{
    response.status(400).send({ error: 'minimum length of username and password is 3' })
  }
  
})

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', {url:1, title:1, author:1, id:1})
    response.json(users.map(u => u.toJSON()))
  })

module.exports = usersRouter