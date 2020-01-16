function fnErr(err) {
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
    const dammedError = Object.create(err, {dammed: {value: true}})
    capture(dammedError)
    return dammedError
  }
}

function processCurry(process) {
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

// origin(
//   function() {
//     // throw new Error('my ball fly away')
//     return 'my ball'
//   }
// )
// .dam(
//   function(rt) {
//     // throw new Error('my ball fly away 1')
//     console.log('1 dam-rt -', rt)
//     if(rt.length < 3) {
//       return '< 3'
//     }else if(rt.length >= 3) {
//       return '>= 3'
//     }
//     return rt
//   },
//   function(err) {
//     console.log('1 dam-err -', err)
//   }
// )
// .flow(
//   function(rt) {
//     // throw new Error('my ball fly away 1')
//     console.log('1 rt -', rt)
//     return rt
//   },
//   function(err) {
//     console.log('1 err -', err)
//   }
// )
// .dam(
//   function(rt) {
//     throw new Error('my ball fly away 2')
//     console.log('2 dam-rt -', rt)
//   },
//   function(err) {
//     console.log('2 dam-err -', err)
//   }
// )
// .flow(
//   function(rt) {
//     console.log('2 rt -', rt)
//     return rt
//   },
//   function(err) {
//     console.log('2 err -', err)
//   }
// )
// .flow(
//   function(rt) {
//     console.log('3 rt -', rt)
//     return rt
//   },
//   function(err) {
//     console.log('3 err -', err)
//   }
// )
// .flow(
//   function(rt) {
//     console.log('4 rt -', rt)
//   },
//   function(err) {
//     console.log('4 err -', err)
//   }
// )
