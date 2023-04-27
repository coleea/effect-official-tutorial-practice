import * as Effect from "@effect/io/Effect"
 
interface User {
  readonly _tag: "User"
  readonly id: number
  readonly name: string
  readonly email: string
}
 
class GetUserError {  readonly _tag = "GetUserError"}
 
interface Todo {
  readonly _tag: "Todo"
  readonly id: number
  readonly message: string
  readonly ownerId: number
}
 
class GetTodosError {  readonly _tag = "GetTodosError"} 
class SendEmailError {  readonly _tag = "SendEmailError"}


const getTodos = Effect.tryCatchPromise(
    () => fetch("https://api.example.demo/todos")
            .then(_ => _.json() as Promise<Todo[]>),
    () => new GetTodosError()
  )
   
  const getUserById = (id: number) => Effect.tryCatchPromise(
    () => fetch(`https://api.example.demo/getUserById?id=${id}`)
            .then(_ => _.json() as Promise<User>),
    () => new GetUserError()
  )
   
  const sendEmail = (address: string, text: string) => Effect.tryCatchPromise(
    () => fetch("https://api.example.demo/sendEmail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address, text }),
    }).then(_ => _.json() as Promise<void>),
    () => new SendEmailError()
  )
   
  const sendEmailToUser = (id: number, message: string) => Effect.flatMap(
    getUserById(id),
    (user) => sendEmail(user.email, message)
  )
   
  const notifyOwner = (todo: Todo) => Effect.flatMap(
    getUserById(todo.ownerId),
    (user) => sendEmailToUser(user.id, `hey ${user.name} you got a todo!`)
  )

const program = Effect.flatMap(
    getTodos, 
    Effect.forEachParDiscard(notifyOwner)
)

console.log(
    Effect.runPromise(program)
);

