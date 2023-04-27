import * as Effect from '@effect/io/Effect'
import * as nodefs from 'node:fs'

// 이것은 promise-like syntax를 취한다
const asynced = (filename : string) => Effect.async<never, NodeJS.ErrnoException, Buffer>((resume) => {
    nodefs.readFile(filename, (error, data) => {
            if(error) {
                console.log('에러발생');                
                resume(Effect.fail(error))
            } else {
                console.log('성공');                                
                resume(Effect.succeed(data))
            }
    })
})

Effect.runCallback(asynced("todo.txt"), (value) => console.log(Effect.runSync(value).toString()))