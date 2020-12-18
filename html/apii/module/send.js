(function(window)
{
  let __package = "apii";
  let __name = "Send";

  class Component
  {
    static exec(inspection)
    {
      let impl=async($res, $rej)=>
      {
        let options={method: inspection.target.method};
        if(!["GET", "HEAD"].includes(options.method)) options.body=inspection.request.content;
    
        let headers={};
        inspection.request.headers.forEach((item)=>
        {
          if(item.header && item.header.trim()!="") headers[item.header]=item.value;
        });
        options.headers=headers;
        options.credentials="include";
        options.mode="cors";
    
        fetch(inspection.target.endpoint, options)
        .then((response)=>
        {
          response.text().then((responseText)=>
          {
            let headers=inspection.response.headers=[];
            headers.push();
            for(let item of response.headers.entries())
            {
              headers.push({header: item[0], value: item[1]});
            }
            inspection.response.headers=headers;
            inspection.response.status={code: response.status, text: response.statusText}
            inspection.response.content=responseText;
            $res(inspection);
          });
        })
        .catch((ex)=>
        {
          inspection.response.headers=[];
          inspections.response.status={code: -1, text: "error sending the request"}
          inspection.response.content=JSON.stringify(ex);
          $res(inspection);
        })
      }

      return new Promise(impl);
    }

  }

  __package.split(".").reduce((a, e) => a[e] = a[e] || {}, window)[__name] = Component;

})(window);

