import * as Effect from '@effect/io/Effect'

const promised = Effect.promise(() => {
    return fetch("https://jsonplaceholder.typicode.com/todos/1")
})

Effect.runPromise(promised)
      .then(r => r.json())
      .then(console.log)
      .catch(console.log)