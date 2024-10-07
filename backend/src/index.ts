import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'


const app = new Hono<{
  Bindings: {
    DATABASE_URL: String
  }
}>()
//middleware
app.use('/api/v1/blog/*', async (c, next) => {
  const header = await c.req.header.authorization || ""
  const response = await verify(header, c.env.JWT_SECRET)
  if(response){
    next()
  }else{
    c.status(403)
    return c.json({
      error: "Error occured in token verification"
    })
  }
})

app.post('/api/v1/signup', async (c) => {
  
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const body = await c.req.json()

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password
      }
    })

    const token = await sign({ id: user.id }, c.env.JWT_SECRET)

  return c.json({
    jwt: token
  })
})


app.post('/api/v1/signin', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

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

})

app.post('/api/v1/blog', (c) => {

})

app.put('/api/v1/blog', (c) => {
  
})

app.get('/api/v1/blog/:id', (c) => {
  
})

export default app
