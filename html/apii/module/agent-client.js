(function(window)
{
  let __package = "apii.agent";
  let __name = "Client";

  class AgentClient
  {
    constructor(options)
    {
      this.options=options;
      this.$$={};
    }

    connect()
    {
      let client=this;
      client.socket=io(`${client.options.endpoint}`,{
        path: "/apii/agent",
        withCredentials: true
      });
      client.socket.on("connect", ()=>
      {
        console.info("[APIi]", `connected to agent at ${client.options.endpoint}`);
        console.info("[APIi]", `announcing to agent`);
        client.socket.emit("/apii/announce", {oid: client.options.oid});
      })
      client.socket.on("/apii/announce/ack", (socmsg)=>console.info("[APIi]", `announcing acknowledged by agent`));
      client.socket.on("/apii/receive", (socmsg)=>client.onReceive(socmsg));
      client.socket.on("/apii/fetch", (socmsg)=>client.onFetch(socmsg));
    }

    send(inspection)
    {
      let client=this;
      let impl=($res, $rej)=>
      {
        let oid=zn.shortid();
        inspection["@agentReqId"]=oid;
        client.$$[oid]=$res;
        client.socket.emit("/apii/send", inspection);
      }

      return new Promise(impl);
    }

    onReceive(socmsg)
    {
      let client=this;
      let oid=socmsg["@agentReqId"];
      if(client.$$[oid])
      {
        let $res=client.$$[oid];
        delete client.$$[oid];
        $res(socmsg);
      }
    }

    fetch(url)
    {
      let client=this;
      let impl=($res, $rej)=>
      {
        let oid=zn.shortid();
        let fetchRequest={url: url, "@agentReqId": oid};
        client.$$[oid]=$res;
        client.socket.emit("/apii/fetch", fetchRequest);
      }
      return new Promise(impl);
    }

    onFetch(socmsg)
    {
      let client=this;
      let oid=socmsg["@agentReqId"];
      if(client.$$[oid])
      {
        let $res=client.$$[oid];
        delete client.$$[oid];
        $res(socmsg.res);
      }
    }
  }
  __package.split(".").reduce((a, e) => a[e] = a[e] || {}, window)[__name] = AgentClient;  
  
})(window);