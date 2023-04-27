import * as Effect from '@effect/io/Effect'
import * as Data from '@effect/data/Data'
import * as Random from '@effect/io/Random'
import {pipe} from '@effect/data/Function'
// import { tryCatch } from '@effect/io/‰´

interface FooError extends Data.Case {readonly _tag: "FooError"}   
interface BarError extends Data.Case {readonly _tag: "BarError"}

const FooError = Data.tagged<FooError>("FooError")
const BarError = Data.tagged<BarError>("BarError")
   
const flakyBar = pipe(  
    Random.next(),
    Effect.flatMap((n) =>
      n > 0.5
        ? Effect.succeed("yay!")
        : Effect.fail(BarError())
    )
)

const program = pipe(
                      pipe(
                        Random.next(),
                        Effect.flatMap((n) =>
                          n >  0.5
                            ? Effect.succeed("yay!")
                            : Effect.fail(FooError())
                        )
                      ), 
                      Effect.zipRight(flakyBar),                      
                      Effect.catchTags({
                        "FooError" : (error) => Effect.succeed(`recovery from ${error._tag}`),
                        "BarError" : (error) => Effect.succeed(`recovery from ${error._tag}`),
                      })
                    )

console.log(
      Effect.runSync(program)
);