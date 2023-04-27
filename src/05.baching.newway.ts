import { pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import * as Request from "@effect/io/Request"
import * as RequestResolver from "@effect/io/RequestResolver"
 
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

interface GetTodos extends Request.Request<GetTodosError, Todo[]> {
 readonly _tag: "GetTodos"
}
interface GetUserById extends Request.Request<GetUserError, User> {
  readonly _tag: "GetUserById"
  readonly id: number
}
interface SendEmail extends Request.Request<SendEmailError, void> {
  readonly _tag: "SendEmail"
  readonly address: string
  readonly text: string
}

type ApiRequest = GetTodos | GetUserById | SendEmail

const GetTodos = Request.tagged<GetTodos>("GetTodos")
const GetUserById = Request.tagged<GetUserById>("GetUserById")
const SendEmail = Request.tagged<SendEmail>("SendEmail")
 
// we assume we cannot batch GetTodos, we create a normal resolver
const GetTodosResolver = RequestResolver.fromFunctionEffect((request: GetTodos) =>
  Effect.tryCatchPromise(
    () => fetch("https://api.example.demo/todos")
          .then((_) => _.json()) as Promise<Todo[]>,
    () => new GetTodosError()
  )
)

// we assume we can batch GetUserById, we create a batched resolver
const GetUserByIdResolver = RequestResolver.makeBatched((requests: GetUserById[]) =>
  pipe(
    Effect.tryCatchPromise(
      () => fetch("https://api.example.demo/getUserByIdBatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ users: requests.map(({ id }) => ({ id })) }),
      }).then((_) => _.json()) as Promise<User[]>,
      () => new GetUserError()
    ),
    Effect.flatMap((users) => Effect.forEachWithIndex(requests, (request, index) =>
      Request.completeEffect(request, Effect.succeed(users[index]))
    )),
    Effect.catchAll((error) => Effect.forEach(requests, (request) =>
      Request.completeEffect(request, Effect.fail(error))
    ))
  )
)
 

// we assume we can batch SendEmail, we create a batched resolver
const SendEmailResolver = RequestResolver.makeBatched((requests: SendEmail[]) =>
  pipe(
    Effect.tryCatchPromise(
      () => fetch("https://api.example.demo/sendEmailBatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emails: requests.map(({ address, text }) => ({ address, text })) }),
      }).then((_) => _.json()),
      () => new SendEmailError()
    ),
    Effect.flatMap(() => Effect.forEach(requests, (request) =>
      Request.completeEffect(request, Effect.unit())
    )),
    Effect.catchAll((error) => Effect.forEach(requests, (request) =>
      Request.completeEffect(request, Effect.fail(error))
    ))
  )
)