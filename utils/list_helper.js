var _ = require('lodash')

const dummy = (blogs) => {
    return 1
  }
  


  const totalLikes = (blogs) => {
      const sum = blogs.map(b => b.likes).reduce((a, b) => a + b, 0)
      const avg = (sum / blogs.length) || 0
      return sum
  }

const favoriteBlog = (blogs) => {
    const maxLikes = Math.max.apply(Math, blogs.map(function(b) { return b.likes; }))
    const favoriteBlog = blogs.filter(b => b.likes === maxLikes)[0]

    return {
        title: favoriteBlog.title,
        author: favoriteBlog.author,
        likes: favoriteBlog.likes
    }

}

const mostBlogs = (blogs) => {
    const result = _(blogs)
    .groupBy(b => b.author)
    .value()
    
    Object.keys(result).map((key, index) => {
        result[key] = result[key].length
    })

    const result2 = Object.keys(result).map((key, index) => {
        return {
             author : key,
             blogs: result[key]
            }
    })

    const maxBlogs = Math.max.apply(Math, result2.map(a => a.blogs ))
    const mostBlogs = result2.filter(a => a.blogs === maxBlogs)[0]
    return(mostBlogs)
}

const mostLikes = (blogs) => {
    const result = _(blogs)
    .groupBy(b => b.author)
    .value()

    const result2 = Object.keys(result).map((key, index) => {
        const numberOfLikes = _.sum(result[key].map(b => b.likes))
        return {
             author : key,
             likes: numberOfLikes
            }
    })

    const maxLikes = Math.max.apply(Math, result2.map(a =>  a.likes))
    const mostLikes = result2.filter(a => a.likes === maxLikes)[0]
    return(mostLikes)
}

  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
  }