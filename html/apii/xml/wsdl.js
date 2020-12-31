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
        //console.info(`fetching wsdl ==> ${location}`);
        if(options.onprogress) options.onprogress(`fetching wsdl ${location}`);
        let urlres=await wsdl.getURL(location, options);
        if(urlres.error)
        {
          $rej(new Error(`An error occured while loading the doc at ${location}. Error: ${urlres.error.code}, ${urlres.error.message}`));
          return;
        }
        wsdl.parse(urlres.content);
        wsdl["@location"]=location;

        if(!wsdl.doc.definitions)
        {
          $res();
          return;
        }

        for(let importTag of wsdl.array(wsdl.doc.definitions.import))
        {
          let importedWSDL=new apii.xml.WSDL();
          await importedWSDL.fetch(new URL(importTag["@location"], location).toString(), options);
          wsdl.imports.push(importedWSDL);
        };

        let types=wsdl.doc.definitions.types;
        if(types && types.schema)
        {
          let nsmap=Object.keys(wsdl.ns).reduce((a,c)=>{a[wsdl.ns[c]]=c; return a}, {});
          let schemaXML=wsdl.generateNode(types.schema, "schema", 0, nsmap);
          wsdl.types=new apii.xml.XSD(schemaXML);
          wsdl.types["@location"]=location;
          await wsdl.types.fetchImports(location, options);
        }

        let schemaMap={};
        let definitions=[];
        let list=[{t: "wsdl", o: wsdl}];
        while(list.length>0)
        {
          let item=list.shift();
          if(item.t=="wsdl")
          {
            if(item.o.types) list.push({t: "xsd", o: item.o.types});
            item.o.imports.forEach((w)=>list.push({t: "wsdl", o: w}));
            definitions.push(item.o.doc.definitions);
          }
          if(item.t=="xsd")
          {
            schemaMap[item.o["@location"]]=item.o;
            item.o.imports.forEach((x)=>list.push({t: "xsd", o: x}));
          }
        }
        
        wsdl.schemas=Object.values(schemaMap).map(x=>{return {ns: x.ns, doc: x.doc, "@location": x["@location"]}});
        wsdl.definitions=definitions;
        $res();
      }
      return new Promise(impl);
    }

    getSOAPPort()
    {
      let wsdl=this;
      let data={portTypes: [], portTypeOperations: {}};
      let portTypeMap={};
      wsdl.definitions.forEach((definition)=>
      {
        portTypeMap=wsdl.array(definition.portType).reduce((a, pt)=>
        {
          let operationsMap=wsdl.array(pt.operation).reduce((ao, o)=>
          {
            ao[o["@name"]]=o;
            return ao;
          }, {});

          a[definition["@targetNamespace"]+"/"+pt["@name"]]=operationsMap;
          return a;
        }, portTypeMap);
      });

      let bindingAddressMap={};
      wsdl.definitions.forEach((definition)=>
      {
        wsdl.array(definition.service).forEach((ser)=>
        {
          wsdl.array(ser.port).forEach((port)=>
          {
            let bindingNameParts=port["@binding"].split(":");
            let ns=definition["@targetNamespace"];
            if(bindingNameParts.length>1) ns=definition[`@xmlns:${bindingNameParts[0]}`];
            let bindingName=bindingNameParts[bindingNameParts.length-1];
            bindingAddressMap[`${ns}/${bindingName}`]=port.address["@location"];
          });
        });
      });

      let messageElementMap={};
      wsdl.definitions.forEach((definition)=>
      {
        wsdl.array(definition.message).forEach((message)=>
        {
          let messageName=message["@name"];
          let messageNS=definition["@targetNamespace"];
          if(message.part["@name"]=="parameters")
          {
            let elementNameParts=message.part["@element"].split(":");
            let elementNS=definition["@targetNamespace"];
            if(elementNameParts.length>1) elementNS=definition[`@xmlns:${elementNameParts[0]}`];
            let elementName=elementNameParts[elementNameParts.length-1];
            messageElementMap[`${messageNS}/${messageName}`]={ns: elementNS, name: elementName};
          }
        });
      });
      
      wsdl.definitions.forEach((definition)=>
      {
        let soapBindings=wsdl.array(definition.binding).filter(binding=>binding.binding && binding.binding["@transport"]=="http://schemas.xmlsoap.org/soap/http" && binding.binding["$ns"]=="http://schemas.xmlsoap.org/wsdl/soap/");
        soapBindings.forEach((soapBinding)=>
        {
          let endPoint=bindingAddressMap[definition["@targetNamespace"]+"/"+soapBinding["@name"]];
          let portTypeNameParts=soapBinding["@type"].split(":");
          let ns=definition["@targetNamespace"];;
          if(portTypeNameParts.length>1) ns=definition[`@xmlns:${portTypeNameParts[0]}`];
          let portTypeName=portTypeNameParts[portTypeNameParts.length-1];
          data.portTypes.push(portTypeName);
          let portTypeOperationsMap=portTypeMap[`${ns}/${portTypeName}`];
          let portTypeOperations=[];
          
          wsdl.array(soapBinding.operation).forEach((soapOperation)=>
          {
            let operation=portTypeOperationsMap[soapOperation["@name"]];
            let messageNameParts=operation.input["@message"].split(":");
            let messageName=messageNameParts[messageNameParts.length-1];
            let messageNameNS=definition["@targetNamespace"];
            if(messageNameParts.length>1) messageNameNS=definition[`@xmlns:${messageNameParts[0]}`];
            let inputElement=messageElementMap[`${messageNameNS}/${messageName}`];
            portTypeOperations.push({...operation, soapAction: soapOperation.operation["@soapAction"], endPoint: endPoint, inputElement: inputElement});
          })
          data.portTypeOperations[portTypeName]=portTypeOperations;
        })
      });
      return data;
    }
  }

  __package.split(".").reduce((a, e) => a[e] = a[e] || {}, window)[__name] = WSDL;

})(window);

