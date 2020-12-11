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
      let impl=(res, rej)=>
      {
        console.log("[APIi]","module initialized");
        res();
      }

      return new Promise(impl);
    }
    
  }

  __package.split(".").reduce((a, e) => a[e] = a[e] || {}, window)[__name] = Module;

})(window);

