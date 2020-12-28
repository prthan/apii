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

    fetch(location, options)
    {
      let xsd=this;
      let impl=async($res, $rej)=>
      {
        console.info(`fetching xsd ==> ${location}`);
        let urlres=await xsd.getURL(location, options);
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
        xsd.parse(urlres.content);

        if(xsd.doc.schema.import)
        {
          for(let importTag of xsd.array(xsd.doc.schema.import))
          {
            let importedXSD=new apii.xml.XSD();
            await importedXSD.fetch(new URL(importTag["@schemaLocation"], location).toString());
            xsd.imports.push(importedXSD);
          };
        }
        await xsd.fetchImports(options);
        $res();
      }
      return new Promise(impl);
    }

    fetchImports(options)
    {
      let xsd=this;
      let impl=async($res, $rej)=>
      {
        if(!xsd.doc.schema.import)
        {
          $res();
          return;
        }
        
        for(let importTag of xsd.array(xsd.doc.schema.import))
        {
          let importedXSD=new apii.xml.XSD();
          await importedXSD.fetch(new URL(importTag["@schemaLocation"], location).toString(), options);
          xsd.imports.push(importedXSD);
        };
        $res();
      }

      return new Promise(impl);
    }
  }

  __package.split(".").reduce((a, e) => a[e] = a[e] || {}, window)[__name] = XSD;

})(window);

