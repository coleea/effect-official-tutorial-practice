import * as Effect from '@effect/io/Effect'
import * as Data from '@effect/data/Data'
import * as Random from '@effect/io/Random'
import {pipe} from '@effect/data/Function'
import { tryCatch } from '@effect/io/Effect'

interface FooError extends Data.Case {
    readonly _tag: "FooError"
}
   
interface BarError extends Data.Case {
    readonly _tag: "BarError"
}

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
      n > 0.5
        ? Effect.succeed("yay!")
        : Effect.fail(BarError())
    )
  )

//   const program = pipe(flakyFoo, Effect.zipRight(flakyBar))
  const program = flakyFoo

  console.log(
      Effect.runSync(program)
  );
  
  
  try {
      Effect.runSync(
          Effect.fail(FooError())
      )
  } catch (error) {
        console.log('에러남');
        
  }