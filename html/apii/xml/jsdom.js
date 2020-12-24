(function(window)
{
  let __package = "apii.xml";
  let __name = "JSDom";

  class JSDom
  {
    constructor(data)
    {
      this.doc=null;
      this.ns={};

      if(data) this.parse(data);
    }

    parse(data)
    {
      let jsdom=this;
      let obj={};
      let tagsPath=[];

      let saxparser=sax.parser(true, {xmlns: true, trim: true});
      saxparser.onerror=(e)=>console.log(e);
      saxparser.onopentag=(node)=>
      {
        let tag={$ns: node.ns[node.prefix]};
        jsdom.setAttributes(tag, node.attributes);
        //let tagName=`${node.prefix ? node.prefix +':' : ''}${node.local}`;
        //let tagName=`{${node.ns[node.prefix]}}${node.local}`;
        let tagName=`${node.local}`;
        if(!obj[tagName]) obj[tagName]=tag;
        else 
        {
          let _tag=obj[tagName];
          if(_tag instanceof Array) _tag.push(tag);
          else obj[tagName]=[_tag, tag];
        }
        tagsPath.push(obj);
        obj=tag;

        Object.keys(node.ns).filter((k)=>k!="").forEach((key)=>jsdom.ns[key]=node.ns[key]);
      }
      saxparser.onclosetag=()=>
      {
        obj=tagsPath.pop();
      }
      saxparser.ontext=(text)=>obj.$value=text;
      saxparser.oncdata=(text)=>obj.$value=text;
      saxparser.write(data).close();
      
      jsdom.doc=obj;
    }

    setAttributes(obj, attrs)
    {
      Object.keys(attrs).forEach((key)=>obj[`@${key}`]=attrs[key].value);
    }

    array(a)
    {
      return a instanceof Array ? a : [a];
    }    
  }

  __package.split(".").reduce((a, e) => a[e] = a[e] || {}, window)[__name] = JSDom;

})(window);

