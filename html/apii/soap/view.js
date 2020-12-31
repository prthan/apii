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
      //let wsdlURL="https://www.crcind.com/csp/samples/SOAP.Demo.CLS?WSDL=1";
      //let wsdlURL="http://www.dneonline.com/calculator.asmx?WSDL";
      //let wsdlURL="https://130.61.41.75/soa-infra/services/reseq-poc/Sample/bpelprocess1_client_ep?WSDL";
      let wsdlURL="https://edpe-test.fin.us2.oraclecloud.com/fscmService/ErpIntegrationService?WSDL";
      apii.xml.JSDom.fetch=(url, options)=>
      {
        return view.client.fetch(url, options);
      }
      let wsdl=new apii.xml.WSDL();
      await wsdl.fetch(wsdlURL, {
        onprogress: (msg)=>console.log(msg)
      });
      console.log(wsdl);
      console.log(wsdl.getSOAPPort());
      let xsd=new apii.xml.XSD();
      xsd.schemas=wsdl.schemas;
      xsd.createSchemaMap();
      console.log(xsd.schemaMap);
      
      let dom=new apii.xml.JSDom();
      dom.ns=wsdl.ns;
      dom.doc=xsd.createObject("getESSJobStatus", "http://xmlns.oracle.com/apps/financials/commonModules/shared/model/erpIntegrationService/types/");
      console.log(dom.generate(2));

      //let dom=new apii.xml.JSDom();
      //console.log(dom.generateNode(wsdl.doc.definitions.types.schema, "schema", 2, nsmap));
      //console.log(wsdl.generate(2));
    }
  }

  __package.split(".").reduce((a, e) => a[e] = a[e] || {}, window)[__name] = View;

})(window);

