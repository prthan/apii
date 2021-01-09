(function(window)
{
  let __package = "apii";
  let __name = "Module";

  class Module
  {
    constructor(options)
    {
      this.options = options;
      this.eventHandlers = {};
    }

    init()
    {
      let module = this;
      
      let impl=async(res, rej)=>
      {
        let swreg=await navigator.serviceWorker.register(zn.env.sw);
        console.info("[APIi]", 'ServiceWorker ==> registered')
        console.info("[APIi]","module initialized");
        res();
      }

      return new Promise(impl);
    }
    
  }

  __package.split(".").reduce((a, e) => a[e] = a[e] || {}, window)[__name] = Module;

})(window);

