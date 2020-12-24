(function(window)
{
  let __package = "apii.xml";
  let __name = "WSDL";

  class WSDL extends apii.xml.JSDom
  {
    constructor(data)
    {
      super(data);

      this.wsdlImports=[];
      this.schemaImports=[];
    }

    fetch(location)
    {
      let wsdl=this;
      let impl=async($res, $rej)=>
      {
        console.info(`fetching wsdl ==> ${location}`);
        let fetchOutcome=await wsdl.client.fetch(location);
        if(fetchOutcome.res.error)
        {
          $rej(new Error(`An error occured while loading the doc at ${location}. Error: ${fetchOutcome.res.error}`));
          return;
        }
        if(fetchOutcome.res.status.code!=200)
        {
          $rej(new Error(`An error occured while loading the doc at ${location}. Status: ${fetchOutcome.res.status.code}, ${fetchOutcome.res.status.text}`));
          return;
        }
        wsdl.parse(fetchOutcome.res.content);

        if(wsdl.doc.definitions.import) 
        {
          for(let importTag of wsdl.array(wsdl.doc.definitions.import))
          {
            let importedWSDL=new apii.xml.WSDL();
            importedWSDL.client=wsdl.client;
            await importedWSDL.fetch(new URL(importTag["@location"], location).toString())
            wsdl.wsdlImports.push(importedWSDL);
          };
        }

        if(wsdl.doc.definitions.types && wsdl.doc.definitions.types.schema)
        {
          for(let schema of wsdl.array(wsdl.doc.definitions.types.schema))
          {
            for(let importTag of wsdl.array(schema.import))
            {
              let importedSchema=new apii.xml.XSD();
              importedSchema.client=wsdl.client;
              await importedSchema.fetch(new URL(importTag["@schemaLocation"], location).toString());
              wsdl.schemaImports.push(importedSchema);
            };
          };
        }

        $res();
      }
      return new Promise(impl);
    }
  }

  __package.split(".").reduce((a, e) => a[e] = a[e] || {}, window)[__name] = WSDL;

})(window);

