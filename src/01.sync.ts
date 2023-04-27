import * as Effect from '@effect/io/Effect'

const someReturned = Effect.sync(() => {

    console.log("hello, world")
    return 42
})


console.dir(Effect.runSync(someReturned), { depth: Infinity});
