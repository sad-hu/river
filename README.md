# river

developing......


``` javascript

function compose(...fns) {
  return function(...args) {
    return fns.reduceRight(
      function(acc, cur, idx) {
        return [cur(...acc)]
      },
      args
    )[0]
  }
}

console.log(
  compose(
    function(a) {
      a.push('d')
      return a
    },
    function(a) {
      a.pop()
      return a
    },
    function(a) {
      a.push('b')
      return a
    },
    function(a, b) {
      return [a, b]
    }
  )('=', '|')
)

```
