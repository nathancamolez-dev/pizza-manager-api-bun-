import { faker } from "@faker-js/faker";
import { user , restaurant } from "./schema";
import { db } from "./connection";
import chalk from "chalk";

await db.delete(user)
await db.delete(restaurant)

console.log(chalk.yellow("✔️ Database cleared"))


await db.insert(user).values([
  {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role:'customer',
  },
  {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role:'customer',
  },
])

console.log(chalk.yellow("✔️ Customers inserted"))

const [manager] = await db.insert(user).values([
  {
    name: faker.person.fullName(),
    email: 'admin@admin.com',
    role: 'manager',
    
  },
]).returning({ 
  id: user.id
})

console.log(chalk.yellow("✔️ Manager inserted"))


await db.insert(restaurant).values([
  {
    name: faker.company.name(),
    description: faker.lorem.paragraph(),
    managerId: manager.id

    
  },
])

console.log(chalk.yellow("✔️ Restaurant inserted"))

console.log(chalk.greenBright(" ✔️ Seed finished ✔️"))

process.exit()