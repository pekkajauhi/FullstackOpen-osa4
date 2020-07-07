const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)

const Blog = require('../models/blog')

 

  beforeEach(async () => {
    await Blog.deleteMany({})
  
    const blogObjects = helper.initialBlogs
      .map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })


test('blog ids are returned without underscore', async () => {
   const response = await api
    .get('/api/blogs')

    expect(response.body[0].id)
    .toBeDefined()

})


test('a valid blog can be added ', async () => {
    const newBlog = {  title: "A new blog",
     author: "Donald Trump", 
     url: "http:www.testblog.com", 
     likes: 42 }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    const titles = blogsAtEnd.map(r => r.title)
  
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    expect(titles).toContain(
      'A new blog'
    )
  })


  test('likes gets value 0 if no value given ', async () => {
    const newBlog = {  title: "No likes",
     author: "Vladimir Putin", 
     url: "http:www.russia.com" }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    const addedBlog = blogsAtEnd.filter(b => b.title === 'No likes') 
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    expect(addedBlog[0].likes).toBe(0)
    
  })

  test('blog without title or url is not added', async () => {
    const newBlog = {
      author: 'Sauli Niinistö'
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('a blog can be deleted', async () => {
  
    const blogsAtStart = await helper.blogsInDb()

    const deleteId = blogsAtStart[0].id 

    await api
      .delete('/api/blogs/'+deleteId)
      .expect(204)
  
    const blogsAtEnd = await helper.blogsInDb()
  
  
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)
    
  })


  
describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })


})

afterAll(() => {
  mongoose.connection.close()
})