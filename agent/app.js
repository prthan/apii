const http=require('http');
const io=require('socket.io')(http);
const fs=require('fs');
const logger=require('./logger');
const send=require('./send');
const fetch=require('./fetch');

let app={};

app["@sockets"]={};

app.start=()=>
{
  app.loadConfig();
  let config=global.config;
  app.server=http.createServer()
  app.server.listen(config.listener.port, config.listener.address, function()
  {
    io.attach(app.server, 
    {
      path: config.context,
      cors: 
      {
        origin: config.origin,
        methods: ["GET", "POST"],
        credentials: true
      }
    });
    logger.info(`Agent started. Listening for requests on ${config.listener.address}:${config.listener.port}`);
  });
}

app.loadConfig=()=>
{
  let data=fs.readFileSync("./config.json");
  global.config=JSON.parse(data);
  console.log("------ [ APIi Agent Configuration ] ------");
  console.log(global.config);
}

io.on("connection", (socket)=>
{
  var socid=socket.id;
  app["@sockets"][socid]=socket;
  logger.info(`new client connection received - ${socid}`);

  socket.on("/apii/announce", (socmsg)=>app.onAnnounce(socket, socmsg));
  socket.on("/apii/send", (socmsg)=>app.onSend(socket, socmsg));
  socket.on("/apii/fetch", (socmsg)=>app.onFetch(socket, socmsg));
  socket.on("disconnect",()=>app.onDisconnect(socid))
})

app.onAnnounce=(socket, socmsg)=>
{
  logger.info(`client ${socmsg.oid} connected`);
  socket.emit('/apii/announce/ack', {status: 'ok'});
}

app.onSend=async(socket, socmsg)=>
{
  let inspection=await send.exec(socmsg);
  socket.emit("/apii/receive", inspection);
}

app.onFetch=async(socket, socmsg)=>
{
  let outcome=await fetch.exec(socmsg);
  socket.emit("/apii/fetch", outcome);
}

app.onDisconnect=(socid)=>
{
  logger.info(`client ${socid} disconnected`);
  delete app["@sockets"][socid];
}

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
app.start();