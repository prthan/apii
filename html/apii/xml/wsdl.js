(function(window)
{
  let __package = "apii.xml";
  let __name = "WSDL";

  class WSDL extends apii.xml.JSDom
  {
    constructor(data)
    {
      super(data);

      this.imports=[];
      this.types=null;
    }

    fetch(location, options)
    {
      let wsdl=this;
      let impl=async($res, $rej)=>
      {
        console.info(`fetching wsdl ==> ${location}`);
        let urlres=await wsdl.getURL(location, options);
        if(urlres.error)
        {
          $rej(new Error(`An error occured while loading the doc at ${location}. Error: ${urlres.error}`));
          return;
        }
        if(urlres.status.code!=200)
        {
          $rej(new Error(`An error occured while loading the doc at ${location}. Status: ${urlres.status.code}, ${urlres.status.text}`));
          return;
        }
        wsdl.parse(urlres.content);

        if(!wsdl.doc.definitions)
        {
          $res();
          return;
        }

        if(wsdl.doc.definitions.import) 
        {
          for(let importTag of wsdl.array(wsdl.doc.definitions.import))
          {
            let importedWSDL=new apii.xml.WSDL();
            await importedWSDL.fetch(new URL(importTag["@location"], location).toString())
            wsdl.imports.push(importedWSDL);
          };
        }

        let types=wsdl.doc.definitions.types || wsdl.imports.find(w=>w.doc.definitions.types);
        if(types && types.schema)
        {
          let nsmap=Object.keys(wsdl.ns).reduce((a,c)=>{a[wsdl.ns[c]]=c; return a}, {});
          let schemaXML=wsdl.generateNode(types.schema, "schema", 0, nsmap);
          wsdl.types=new apii.xml.XSD(schemaXML);
          await wsdl.types.fetchImports(options);
        }

        $res();
      }
      return new Promise(impl);
    }
  }

  __package.split(".").reduce((a, e) => a[e] = a[e] || {}, window)[__name] = WSDL;

})(window);

