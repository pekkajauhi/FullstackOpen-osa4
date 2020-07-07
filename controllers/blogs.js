const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {username:1, name:1, id:1})
  response.json(blogs.map(blog => blog.toJSON()))
     
  })
  
  blogsRouter.post('/', async (request, response, next) => {
    const body = request.body
    
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)

    console.log(user)
    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes === undefined ? 0 : body.likes,
      user: user._id
     
    })
  try {
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.json(savedBlog.toJSON())
  } catch(exception){
    next(exception)
  }
    
  })

  blogsRouter.delete('/:id', async (request, response, next) => {
  const userInfo = jwt.verify(request.token, process.env.SECRET)
  const blog = await Blog.findById(request.params.id)
  
  try {
    if(userInfo.id.toString() === blog.user.toString()){
      await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
    } else {
      response.status(401).end()
    }
    
  } catch(exception){
    next(exception)
  }
    
  })

  blogsRouter.put('/:id', async (request, response, next) => {
    const body = request.body
  
    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes === undefined ? 0 : body.likes
    }
    
      
      try{
        await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
        response.json(blog)
        console.log('works',blog)
        console.log(request.params.id)
      } catch(exception){
        next(exception)
      }
    
      
      
  })

  module.exports = blogsRouter