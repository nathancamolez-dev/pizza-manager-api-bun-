import Elysia from "elysia";


const app = new Elysia()

app.listen(3333, () =>{
  console.log("Server started on port 3333")
} )
