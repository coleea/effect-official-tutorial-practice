import * as Effect from '@effect/io/Effect'

const fromValue = Effect.succeed(1)

console.log(Effect.runSync(fromValue));