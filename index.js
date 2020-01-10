const flowCurry = function(promise, process, capture) {
  // console.log(promise, process.toString()); return
  return {
    flow: flowCurry.bind(
      undefined, 
      promise.then(process).catch(
        capture 
        || function(err) {console.log(err)}
      )
    ),
    dam: damCurry.bind(undefined, promise)
  }
}

const damCurry = async function(promise) {
  const rt = await promise
  console.log('dam', rt)
}

const origin = function(flowCurry, damCurry, rt) {
  /*
    判断是否是 promise
  */
  const promise = Promise.resolve(rt)

  return {
    flow: flowCurry.bind(undefined, promise),
    dam: damCurry.bind(undefined, promise)
  }
}.bind(undefined, flowCurry, damCurry)

origin('something')
.flow(function(rt) {
  throw new Error('man made err')
  console.log(rt)
  return rt.toUpperCase()
},function(err) {console.log('my first flow err')}).dam()
/*.flow(function(rt) {
  throw new Error('man made err 1')
  console.log(rt)
})
.flow(
  function(rt) {
    throw new Error('man made err 2')
    console.log(rt)
  },
  function(err) {
    console.log('my err capture :::', err)
  }
) */
