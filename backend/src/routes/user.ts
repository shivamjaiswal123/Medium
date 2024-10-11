import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'

export const userRouter = new Hono<{
    Bindings: {
      DATABASE_URL: String
    }
  }>()

userRouter.post('/signup', async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())
  
      try {
        const body = await c.req.json()
  
        const user = await prisma.user.create({
          data: {
            email: body.email,
            name: body.name,
            password: body.password
          }
        })
    
        const token = await sign({ id: user.id }, c.env.JWT_SECRET)
    
        return c.json({
          jwt: token
        })
      } catch (error) {
          c.status(411)
          return c.text('Something went wrong while signing up', error)
      }
  })
  
  
userRouter.post('/api/v1/signin', async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())
  
      try {
        const body = await c.req.json()
  
        const userExist = await prisma.user.findUnique({
          where: {
              email: body.email,
              password: body.password
          }
        })
    
      if(!userExist){
        c.status(403)
        return c.json({
          error: "User not found !!!"
        })
      }
  
      const token = await sign({ id: userExist.id }, c.env.JWT_SECRET)
  
      return c.json({
        token
      })
  
      } catch (error) {
        c.status(411)
        return c.text('Something went wrong while signing in')
      }
  })
