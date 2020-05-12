function fn() {
  let obj = {}
  obj.name = 'zdw'
  obj.fun = function() {
    debugger;
    console.log(this.name)
  }
}
fn()
export function hello() {
  return 'hello webpack'
}