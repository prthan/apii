(function(window)
{
  let __package = "apii.view";
  let __name = "Soap";

  class View extends zn.Base
  {
    constructor(options)
    {
      super(options);
    }

    init()
    {
      let view=this;
      view.setupUI();
      view.setupEventHandlers();
      view.connectToAgent();
      view.test();
    }
    
    setupUI()
    {
      let view=this;
    }

    setupEventHandlers()
    {
      let view=this;

    }

    connectToAgent()
    {
      let view=this;

      let client=new apii.agent.Client({endpoint: "http://localhost:8181", oid: "SOAP-TEST"});
      client.connect();
      
      window.__agentclient=client;

      view.client=client;
    }

    async test()
    {
      let view=this;
      let wsdlURL="https://www.crcind.com/csp/samples/SOAP.Demo.CLS?WSDL=1";
      //let wsdlURL="https://130.61.41.75/soa-infra/services/reseq-poc/Sample/bpelprocess1_client_ep?WSDL";
      let wsdl=new apii.xml.WSDL();
      wsdl.client=view.client;
      await wsdl.fetch(wsdlURL);
      console.log(wsdl);
    }
  }

  __package.split(".").reduce((a, e) => a[e] = a[e] || {}, window)[__name] = View;

})(window);

