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

    generate(indent)
    {
      let dom=this;
      let rootName=Object.keys(dom.doc)[0];
      let nsmap=Object.keys(dom.ns).reduce((a,c)=>{a[dom.ns[c]]=c; return a}, {});
      return dom.generateNode(dom.doc[rootName], rootName, indent, nsmap);
    }

    generateNode(o, name, indent, nsmap, level)
    {
      let dom=this;
      let nl="\n";
      if(!indent)
      {
        indent=0;
        nl="";
      }
      if(!level) level=0;
      let spaces=`${dom.space(level * indent)}`;
      let tags=[];

      let list = o instanceof Array ? o : [o];

      list.forEach((node)=>
      {
        let prefix="";
        let ns="";
        if(nsmap && nsmap[node.$ns]) prefix=nsmap[node.$ns] + ":";
        if(prefix=="" && node.$ns) ns=` xmlns="${node.$ns}"`;
        
        let nsvals="";
        if(level==0 && nsmap) nsvals=Object.keys(nsmap).reduce((a,c)=>a+=` xmlns:${nsmap[c]}="${c}"`, "");


        if(node.$value) tags.push(`${spaces}<${prefix}${name}${ns}${nsvals}${dom.attrs(node)}>${node.$value}</${prefix}${name}>`);
        else
        {
          let openTag=`${spaces}<${prefix}${name}${ns}${nsvals}${dom.attrs(node)}`;
          let closeTag=`</${prefix}${name}>`;

          let childTags=Object.keys(node).filter(x=>x!="$ns"&&x.indexOf("@")!=0)
                                         .reduce((a,c,i)=>
                                         {
                                           return a+=nl+dom.generateNode(node[c], c, indent, nsmap, level + 1)
                                         }, "");
          if(childTags=="") tags.push(`${openTag}/>`);
          else tags.push(`${openTag}>${childTags}${nl}${spaces}${closeTag}`);
        }
      });

      return tags.join(nl);
    }

    
    attrs(obj)
    {
      let attrsText=Object.keys(obj).filter(x=>x.indexOf("@")==0).reduce((a, c)=>a+=` ${c.substring(1)}="${obj[c]}"`, "");
      return attrsText;
    }

    space(x)
    {
      return new Array(x).fill(" ").join("");
    }

    getURL(url, options)
    {
      return JSDom.fetch(url, options);
    }

    static fetch(url, options)
    {
      let impl=($res, $rej)=>
      {
        let res={content: "<data>fetch method not reimplemented</data>", status: {code: 404, text: "Fetch method not implemented"}};
        $res({res: res});
      }
      return new Promise(impl);
    }
  }

  __package.split(".").reduce((a, e) => a[e] = a[e] || {}, window)[__name] = JSDom;

})(window);

