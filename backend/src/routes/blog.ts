import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify } from 'hono/jwt'

export const blogRouter = new Hono<{
    Bindings: {
      DATABASE_URL: String
    }
  }>()

//middleware
blogRouter.use('/*', async (c, next) => {
  try {
    const header = await c.req.header("authorization") || ""
    const response = await verify(header, c.env.JWT_SECRET)
    if(response){
        c.set('userId', response.id)
        await next()
    }else{
      c.status(403)
      return c.json({
        error: "Error occured in token verification"
      })
    }
  } catch (error) {
    c.text('Something went wrong while token verification')
  }
})

blogRouter.post('/', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const body = await c.req.json()
        const authorId = c.get('userId')
        const blog = await prisma.blog.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: authorId
            }
        })

        return c.json({
            id: blog.id
        })
    } catch (error) {
        c.text('Something went wrong while creating post')
    }
})

blogRouter.put('/', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const body = c.req.json()

        const blog = await prisma.blog.update({
            where: {
                id: body.id
            },
            data: {
                title: body.title,
                content: body.content  
            }
        })

        return c.json({
            id: blog.id
        })
    } catch (error) {
        c.text('Something went wrong while updating post')
    }
})

blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        //TODO:: Add Pagination
        const blog = await prisma.blog.findMany()

        return c.json({
           blog
        })
    } catch (error) {
        c.text('Something went wrong while getting post')
    }
})

blogRouter.get('/:id', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const id = c.req.param('id')

        const blog = await prisma.blog.findFirst({
            where: {
                id: id
            },
        })

        return c.json({
           blog
        })
    } catch (error) {
        c.text('Something went wrong while getting post')
    }
})