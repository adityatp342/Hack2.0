async function retryRequest(promiseFunc, nrOfRetries) {
    // Copy paste the code in your IDE and start writing your code from here.
    //1. success return
    //2. error ->
    if(nrOfRetries == 0){
        throw new Error("Error")
    }
    // const pro  = promiseFunc()

    return promiseFunc().then((res)=>{
        return res
    }).catch((err)=> {
        nrOfRetries -= 1
        retryRequest(promiseFunc, nrOfRetries)
    })
  }
          
  let hasFailed = false;
  function getUserInfo() {
    return new Promise((resolve, reject) => {
      if(!hasFailed) {
        hasFailed = true;
        reject("Exception!");
      } else {
        resolve("Fetched user!");
      }
    });
  }
  let promise = retryRequest(getUserInfo, 3);
  if(promise) {
    promise.then((result) => console.log(result))
    .catch((error) => console.log("Error!"));
  }
  module.exports.retryRequest = retryRequest;