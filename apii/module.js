/*[merge-start] ==> module/index.js*/(function(window)
{
  let __package = "diagrams.auth";
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
        console.log("[auth] module initialized");
        res();
      }

      return new Promise(impl);
    }
    
  }

  __package.split(".").reduce((a, e) => a[e] = a[e] || {}, window)[__name] = Module;

})(window);

/*[merge-end] <== module/index.js*//*[merge-start] ==> login/view.js*/(function(window)
{
  let __package = "diagrams.auth.view";
  let __name = "Login";

  class View
  {
    constructor(options)
    {
      this.options = options;
      this.eventHandlers = {};
      this.model={};
      //this.actions={};
    }

    init()
    {
      let view=this;

      view.message="Login to app to starting using the diagrams";
      view.setupUI();
      view.setupEventHandlers();
    }
    
    on(eventName, eventHandler)
    {
      let view = this;
      (view.eventHandlers[eventName] = view.eventHandlers[eventName] || []).push(eventHandler);
    }
    
    fireEvent(eventName, event)
    {
      let view = this;
      let evt = event || {};
      evt.source = view;
      (view.eventHandlers[eventName] || []).forEach((eh) => eh(evt));
    }

    setupUI()
    {
      let view=this;
    }

    setupEventHandlers()
    {
      let view=this;

      //view.actions.onlogin=()=>view.onLogin();
    }

    onLogin($event)
    {
      console.log($event);
      let view=this;
      view.message="Successfully logged in";
      view.testMessage="success";
      //view.apply();
    }
  }

  __package.split(".").reduce((a, e) => a[e] = a[e] || {}, window)[__name] = View;

})(window);

/*[merge-end] <== login/view.js*//*[merge-start] ==> login/view.css*//*

Login view css

*//*[merge-end] <== login/view.css*//*[merge-start] ==> logout/view.js*/(function(window)
{
  let __package = "diagrams.auth.view";
  let __name = "Logout";

  class View
  {
    constructor(options)
    {
      this.options = options;
      this.eventHandlers = {};
    }

    init() {}
    
    on(eventName, eventHandler)
    {
      let view = this;
      (view.eventHandlers[eventName] = view.eventHandlers[eventName] || []).push(eventHandler);
    }
    
    fireEvent(eventName, event)
    {
      let view = this;
      let evt = event || {};
      evt.source = view;
      (view.eventHandlers[eventName] || []).forEach((eh) => eh(evt));
    }

    setupUI()
    {
      let view=this;
    }

    setupEventHandlers()
    {
      let view=this;
    }

  }

  __package.split(".").reduce((a, e) => a[e] = a[e] || {}, window)[__name] = View;

})(window);

/*[merge-end] <== logout/view.js*//*[merge-start] ==> logout/view.css*//*

Logout view css

*//*[merge-end] <== logout/view.css*//*[merge-start] ==> welcome/view.js*/(function(window)
{
  let __package = "diagrams.auth.view";
  let __name = "Welcome";

  class View
  {
    constructor(options)
    {
      this.options = options;
      this.eventHandlers = {};
    }

    init() {}
    
    on(eventName, eventHandler)
    {
      let view = this;
      (view.eventHandlers[eventName] = view.eventHandlers[eventName] || []).push(eventHandler);
    }
    
    fireEvent(eventName, event)
    {
      let view = this;
      let evt = event || {};
      evt.source = view;
      (view.eventHandlers[eventName] || []).forEach((eh) => eh(evt));
    }

    setupUI()
    {
      let view=this;
    }

    setupEventHandlers()
    {
      let view=this;
    }

  }

  __package.split(".").reduce((a, e) => a[e] = a[e] || {}, window)[__name] = View;

})(window);

/*[merge-end] <== welcome/view.js*//*[merge-start] ==> welcome/view.css*//*

Welcome view css

*//*[merge-end] <== welcome/view.css*/