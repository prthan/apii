(function(window)
{
  let __package = "apii.xml";
  let __name = "Utils";

  class Component
  {
    static createJSDom(data)
    {
      let obj={};
      let tagsPath=[];

      let saxparser=sax.parser(true, {xmlns: true, trim: true});
      saxparser.onerror=(e)=>console.log(e);
      saxparser.onopentag=(node)=>
      {
        let tag={};
        Component.setAttributes(tag, node.attributes);
        let tagName=`${node.prefix ? node.prefix +':' : ''}${node.local}`;
        if(!obj[tagName]) obj[tagName]=tag;
        else 
        {
          let _tag=obj[tagName];
          if(_tag instanceof Array) _tag.push(tag);
          else obj[tagName]=[obj[tagName], tag];
        }
        tagsPath.push(obj);
        obj=tag;
      }
      saxparser.onclosetag=()=>
      {
        obj=tagsPath.pop();
      }
      saxparser.write(data).close();
      return obj;
    }

    static setAttributes(obj, attrs)
    {
      Object.keys(attrs).forEach((key)=>obj[`@${key}`]=attrs[key].value);
    }

    static fetchWSDL(url)
    {
      
    }
    
  }

  __package.split(".").reduce((a, e) => a[e] = a[e] || {}, window)[__name] = Component;

})(window);

