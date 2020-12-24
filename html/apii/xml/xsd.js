(function(window)
{
  let __package = "apii.xml";
  let __name = "XSD";

  class XSD extends apii.xml.JSDom
  {
    constructor(data)
    {
      super(data);
      this.imports=[];
    }

    addDom(dom)
    {
      let xsd=this;

      Object.keys(dom.doc).forEach((key)=>wsdl.doc[key]=dom.ns[key]);
      Object.keys(dom.ns).forEach((key)=>xsd.ns[key]=dom.ns[key]);

    }

    fetch(location)
    {
      let xsd=this;
      let impl=async($res, $rej)=>
      {
        console.info(`fetching xsd ==> ${location}`);
        let fetchOutcome=await xsd.client.fetch(location);
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
        xsd.parse(fetchOutcome.res.content);

        if(xsd.doc.schema.import)
        {
          for(let importTag of xsd.array(xsd.doc.schema.import))
          {
            let importedXSD=new apii.xml.XSD();
            importedXSD.client=xsd.client;
            await importedXSD.fetch(new URL(importTag["@schemaLocation"], location).toString());
            xsd.imports.push(importedXSD);
          };
        }

        $res();
      }
      return new Promise(impl);
    }
  }

  __package.split(".").reduce((a, e) => a[e] = a[e] || {}, window)[__name] = XSD;

})(window);

