const fnErr = function(err) {
  console.log('[river internal]', err)
}

function captureCurry(capture) {
  return function(err) {
    capture(err)
    return err
  }
}

function captureDamCurry(capture) {
  return function(err) {
    capture(err)
    err.dammed = true
    return err
  }
}

const processCurry = function(process) {
  return function(rt) {
    if(rt instanceof Error && rt.dammed) {
      return rt
    }else {
      return process(rt)
    }
  }
}

const flowCurry = function(captureCurry, fnErr, processCurry, promise, process, capture) {
  const baton = promise.then(processCurry(process)).catch(captureCurry(capture || fnErr))
  return {
    flow: flowCurry.bind(undefined, baton),
    dam: damCurry.bind(undefined, baton)
  }
}.bind(undefined, captureCurry, fnErr, processCurry)

const damCurry = function(captureDamCurry, fnErr, flowCurry, processCurry, promise, process, capture) {
  const baton = promise.then(processCurry(process)).catch(captureDamCurry(capture || fnErr))
  return {
    dam: damCurry.bind(undefined, baton),
    flow: flowCurry.bind(undefined, baton)
  }
}.bind(undefined, captureDamCurry, fnErr, flowCurry, processCurry)


const origin = function(captureCurry, fnErr, flowCurry, rt, capture) {
  let promise = null
  if(rt instanceof Promise) {
    promise = rt.catch(captureCurry(capture || fnErr))
  }else if(typeof(rt) === 'function') {
    try{
      promise = Promise.resolve(rt())
    }catch(err) {
      promise = Promise.reject(err).catch(captureCurry(capture || fnErr))
    }
  }else {
    promise = Promise.resolve(rt)
  }
  return {
    flow: flowCurry.bind(undefined, promise),
    dam: damCurry.bind(undefined, promise)
  }
}.bind(undefined, captureCurry, fnErr, flowCurry)

origin(
  function() {
    // throw new Error('my ball fly away')
    return 'my ball'
  }
)
.dam(
  function(rt) {
    throw new Error('my ball fly away')
    console.log('1 dam-rt -', rt)
  },
  function(err) {
    console.log('1 dam-err -', err)
  }
)
.flow(
  function(rt) {
    console.log('1 rt -', rt)
    return rt
  },
  function(err) {
    console.log('1 err -', err)
  }
)
.dam(
  function(rt) {
    throw new Error('my ball fly away')
    console.log('2 dam-rt -', rt)
  },
  function(err) {
    console.log('2 dam-err -', err)
  }
)
.flow(
  function(rt) {
    console.log('2 rt -', rt)
    return rt
  },
  function(err) {
    console.log('2 err -', err)
  }
)
.flow(
  function(rt) {
    console.log('3 rt -', rt)
    return rt
  },
  function(err) {
    console.log('3 err -', err)
  }
)
.flow(
  function(rt) {
    console.log('4 rt -', rt)
  },
  function(err) {
    console.log('4 err -', err)
  }
)

// async function origin() {

// }

// async function flow() {

// }

// async function dam() {

// }

// async function river(origin, ...args) {
//   const rt = await origin()
// }

// // const fnErr = function(err) {
// //   console.log('[fnErr 4 debug]', err)
// //   return err
// // }

// // const fnFlowCurry = function(err, promise, process, capture) {
// //   if(err instanceof Error) {
// //     return {
// //       flow: fnFlowCurry.bind(undefined, err, promise)
// //     }
// //   }else {
// //     return {
// //       flow: fnFlowCurry.bind(undefined, null, promise.then(process/* , capture || fnErr */).catch(capture))
// //     }
// //   }
// // }

// // const fnDamCurry = function(promise, process, capture) {
// //   return {
// //     flow: fnFlowCurry.bind()
// //   }
// // }

// // const origin = function(rt, capture) {
// //   let promise = null
// //   if(rt instanceof Promise) {
// //     promise = rt.catch(capture || fnErr)
// //   }else if(typeof(rt) === 'function') {
// //     try{
// //       promise = Promise.resolve(rt())
// //     }catch(err) {
// //       promise = Promise.reject(err).catch(capture || fnErr)
// //     }
// //   }else {
// //     promise = Promise.resolve(rt)
// //   }
// //   return {
// //     flow: fnFlowCurry.bind(undefined, null, promise)
// //   }
// // }

// // origin(function() {throw new Error('my err!')})
// //     .flow(
// //       function(rt) {
// //         console.log('1 rt', rt)
// //         return rt
// //       },
// //       function(err) {
// //         console.log('1 err', err)
// //         return err
// //       }
// //     )
// //     .flow(
// //       function(rt) {
// //         console.log('2 rt', rt)
// //         throw new Error('my err 2!')
// //         return rt
// //       },
// //       function(err) {
// //         console.log('2 err', err)
// //         return err
// //       }
// //     )
// //     .flow(
// //       function(rt) {
// //         console.log('3 rt', rt)
// //       },
// //       function(err) {
// //         console.log('3 err', err)
// //       }
// //     )

// // // console.log(
// // //   Object.keys(
    
// // //   )
// // // )

// // // const fnFlow = function(promise, process, capture) {
// // //   return {
// // //     flow: fnFlow.bind(undefined, promise.then(process).catch(capture)),
// // //     dam: fnDam.bind(undefined, promise.then(process).catch(capture))
// // //   }
// // // }

// // // const fnDam = function(promise, process, capture) {
// // //   return {
// // //     flow: fnDam.bind(undefined, promise(process, capture))
// // //   }
// // //   // const rt = promise
// // //   // console.log('fnDam', rt)
// // //   // // if(rt instanceof Error) {
// // //   // //   return {
// // //   // //     flow: fnFlowError.bind(undefined, err)
// // //   // //   }
// // //   // // }
// // //   // return await {
// // //   //   flow: function() {}
// // //   // }
// // // }


// // // const fnFlow = function(promise, process, capture) {
// // //   return promise.then(process).catch(capture || fnErr)
// // // }

// // // // const fnFlow = async function(promise, process, capture) {
// // // //   const rt = await promise
// // // //   if(rt instanceof Error) {
// // // //     console.log('await', rt)
// // // //     return {
// // // //       flow: function(process, capture) {
// // // //         console.log('because previous type is error')
// // // //       }
// // // //     }
// // // //   }
  
// // // // }

// // // const flow = function(promise, process, capture) {
// // //   return {
// // //     flow: fnFlow.bind(undefined, promise)
// // //   }
// // // }

// // // const origin = function(rt, capture) {
// // //   let promise = null
// // //   if(rt instanceof Promise) {
// // //     promise = rt.catch(capture || fnErr)
// // //   }else if(typeof(rt) === 'function') {
// // //     try{
// // //       promise = Promise.resolve(rt())
// // //     }catch(err) {
// // //       promise = Promise.reject(err).catch(capture || fnErr)
// // //     }
// // //   }else {
// // //     promise = Promise.resolve(rt)
// // //   }
// // //   return {
// // //     flow: fnFlow.bind(undefined, promise)
// // //   }
// // // }

// // // origin(
// // //   function() {throw new Error('my error!')}, 
// // //   err => {
// // //     console.log('capture in origin', err)
// // //     return err
// // //   }
// // // )
// // // .flow()

// // // const origin = function(anyType, capture) {
// // //   if(anyType instanceof Promise) {
// // //     return anyType.catch(capture || fnErr)
// // //   }else {
// // //     return Promise.resolve().then(function(anyType) {return anyType}).catch(capture || fnErr)
// // //   }
// // // }

// // // origin(new Error('man made error!')).then(function(rt) {console.log('here:', rt)})

// // // try{
// // //   throw new Error('man made')
// // // }catch(e) {
// // //   console.log('catch', e)
// // // }

// // // const flowCurry = function(promise, process, capture) {
// // //   // console.log(promise, process.toString()); return
// // //   return {
// // //     flow: flowCurry.bind(
// // //       undefined, 
// // //       promise.then(process).catch(capture || fnErr)
// // //     ),
// // //     dam: damCurry.bind(undefined, promise)
// // //   }
// // // }

// // // const damCurry = async function(promise) {
// // //   const rt = await promise
// // //   console.log('dam', rt)
// // // }

// // // const origin = function(flowCurry, damCurry, rt) {
// // //   /*
// // //     判断是否是 promise
// // //   */
// // //   const promise = Promise.resolve().then(function() {return rt}).catch(fnErr)

// // //   return {
// // //     flow: flowCurry.bind(undefined, promise),
// // //     dam: damCurry.bind(undefined, promise)
// // //   }
// // // }.bind(undefined, flowCurry, damCurry)

// // // origin('something')
// // // .flow(function(rt) {
// // //   throw new Error('man made err')
// // //   console.log(rt)
// // //   return rt.toUpperCase()
// // // },function(err) {console.log('my first flow err')}).dam()
// // /*.flow(function(rt) {
// //   throw new Error('man made err 1')
// //   console.log(rt)
// // })
// // .flow(
// //   function(rt) {
// //     throw new Error('man made err 2')
// //     console.log(rt)
// //   },
// //   function(err) {
// //     console.log('my err capture :::', err)
// //   }
// // ) */
