import * as Effect from '@effect/io/Effect'
import * as Data from '@effect/data/Data'
import * as Random from '@effect/io/Random'
import {pipe} from '@effect/data/Function'
import { tryCatch } from '@effect/io/Effect'

interface FooError extends Data.Case {readonly _tag: "FooError"}   
interface BarError extends Data.Case {readonly _tag: "BarError"}

const FooError = Data.tagged<FooError>("FooError")
const BarError = Data.tagged<BarError>("BarError")
   
const flakyFoo = pipe(
    Random.next(),
    Effect.flatMap((n) =>
      n > 0
        ? Effect.succeed("yay!")
        : Effect.fail(FooError())
    )
)
   
const flakyBar = pipe(  
    Random.next(),
    Effect.flatMap((n) =>
      n > 1
        ? Effect.succeed("yay!")
        : Effect.fail(BarError())
    )
)

const program = pipe(
                      pipe(
                        Random.next(),
                        Effect.flatMap((n) =>
                          n >  1
                            ? Effect.succeed("yay!")
                            : Effect.fail(FooError())
                        )
                      ), 
                      Effect.zipRight(flakyBar),
                      // Effect.zipLeft(
                      //   Effect.succeed(`effect.zipleft`)
                      // ),
                      // Effect.catchTag("FooError", (fooError) => 
                      //   Effect.succeed(`Recovering from ${fooError._tag}`)
                      // ),

                      // Effect.catchAll의 단점은 : 발생한 모든 에러를 수집하지 않음
                      Effect.catchAll((error) => 
                        Effect.succeed(`Recovering from ${JSON.stringify(error)}`)
                      )
                    )

console.log(
      Effect.runSync(program)
);