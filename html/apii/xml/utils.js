(function(window)
{
  let __package = "apii.xml";
  let __name = "Utils";

  class Component
  {
    static fetchDoc(url, type, agentClient)
    {
      let doms=[];
      let list=[{location: url, type: type || "wsdl"}];
      let impl=async($res, $rej)=>
      {
        while(list.length>0)
        {
          let {location, type}=list.shift();
          console.log('fetching', type, location);
          let fetchOutcome=await agentClient.fetch(location);
          if(fetchOutcome.res.error)
          {
            console.info("An error occured while loading the doc at ", location)
            console.error(fetchOutcome.res.error);
            $rej(fetchOutcome.error);
            return;
          }
          if(fetchOutcome.res.status.code!=200)
          {
            console.info("An error occured while loading the doc at ", location);
            console.error(fetchOutcome.res.status);
            $rej(fetchOutcome.res.status);
            return;
          }
          let dom=new apii.xml.JSDom(fetchOutcome.res.content);
          doms.unshift({dom: dom, type: type});

          if(type=="wsdl" && dom.doc.definitions.import) 
          {
            Component.array(dom.import).forEach((importTag)=>
            {
              if(importTag.$ns=='http://schemas.xmlsoap.org/wsdl/')
              {
                list.push({location: new URL(importTag["@location"], location).toString(), type: "wsdl"});
              }
            });
          }

          if(type=="wsdl" && dom.doc.definitions.types && dom.doc.definitions.types.schema)
          {
            Component.array(dom.doc.definitions.types.schema).forEach((schema)=>
            {
              Component.array(schema.import).forEach((importTag)=>
              {
                list.push({location: new URL(importTag["@schemaLocation"], location).toString(), type: "xsd"});
              })
            })
          }

          if(type=="xsd" && dom.doc.schema.import)
          {
            Component.array(dom.doc.schema.import).forEach((importTag)=>
            {
              list.push({location: new URL(importTag["@schemaLocation"], location).toString(), type: "xsd"});
            })
          }
        }
        $res(doms);
      }
      return new Promise(impl);
    }

    static array(a)
    {
      return a instanceof Array ? a : [a];
    }
    
  }

  __package.split(".").reduce((a, e) => a[e] = a[e] || {}, window)[__name] = Component;

})(window);

