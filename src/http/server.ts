import chalk from 'chalk'
import Elysia from 'elysia'

const app = new Elysia()

app.listen(3333, () => {
  console.log(chalk.green('Server started on port 3333'))
})
