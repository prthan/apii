const axios=require('axios');
const logger=require('./logger');
const utils=require('./utils');

let send={};

send.exec=(inspection)=>
{
  let impl=async($res, $rej)=>
  {
    let oid=utils.shortid();
    send.logRequest(oid, inspection);

    let options=
    {
      method: inspection.target.method,
      url: inspection.target.endpoint,
    };

    let headers={};
    inspection.request.headers.forEach((item)=>
    {
      if(item.header && item.header!="") headers[item.header]=item.value;
    });
    options.headers=headers;
    if(['PUT', 'POST', 'DELETE', 'PATCH'].includes(inspection.target.method)) options.data=inspection.request.content;
  
    axios(options)
    .then((res)=>
    {
      send.copyRes(res, inspection);
      send.logResponse(oid, inspection);
      $res(inspection);
    })
    .catch((err)=>
    {
      if(err.response) send.copyRes(err.response, inspection)
      else inspection.response.error=err.message;
      send.logResponse(oid, inspection);
      $res(inspection)
    });
  }
  return new Promise(impl);
}

send.copyRes=(res, inspection)=>
{
  inspection.response.status={code: res.status, text: res.statusText};
  if(typeof(res.data)=="object") inspection.response.content=JSON.stringify(res.data);
  else inspection.response.content=res.data;

  inspection.response.headers=[];
  Object.keys(res.headers).forEach((header)=>inspection.response.headers.push({header: header, value: res.headers[header]}));
}

send.logRequest=(oid, inspection)=>
{
  logger.info(`[${oid}]`, `inspection : ${inspection.oid}`);
  logger.info(`[${oid}]`, `┌───[ Request ]────────────────────────────────────────────────────────────────────┐`);
  utils.wrapText(`${inspection.target.method} ${inspection.target.endpoint}`, 80, 200).forEach((line)=>logger.info(`[${oid}]`, '│', line,'│'));
  if(inspection.request.headers.length>0)
  {
    logger.info(`[${oid}]`, `├──────────────────────┬───────────────────────────────────────────────────────────┤`); 
    send.logHeaders(oid, inspection.request.headers);
    logger.info(`[${oid}]`, `├──────────────────────┴───────────────────────────────────────────────────────────┤`);  
  }
  if(inspection.target.method!="GET")
  {
    if(inspection.request.headers.length==0)
      logger.info(`[${oid}]`, `├──────────────────────────────────────────────────────────────────────────────────┤`); 
    inspection.request.content.split("\n").forEach(line=>utils.wrapText(line, 80, 200).forEach((wline)=>logger.info(`[${oid}]`, '│', wline,'│')));
  }
  logger.info(`[${oid}]`, `└──────────────────────────────────────────────────────────────────────────────────┘`);  
}

send.logResponse=(oid, inspection)=>
{
  logger.info(`[${oid}]`, `┌───[ Response ]───────────────────────────────────────────────────────────────────┐`);
  utils.wrapText(`${inspection.response.status.code} ${inspection.response.status.text}`, 80, 200).forEach(line=>logger.info(`[${oid}]`, '│', line,'│'));
  if(inspection.response.headers.length>0)
  {
    logger.info(`[${oid}]`, `├──────────────────────┬───────────────────────────────────────────────────────────┤`);    
    send.logHeaders(oid, inspection.response.headers);
    logger.info(`[${oid}]`, `├──────────────────────┴───────────────────────────────────────────────────────────┤`);  
  }
  if(inspection.response.headers.length==0)
    logger.info(`[${oid}]`, `├──────────────────────────────────────────────────────────────────────────────────┤`); 
  if(inspection.response.content)
    inspection.response.content.split("\n").forEach(line=>utils.wrapText(line, 80, 200).forEach((wline)=>logger.info(`[${oid}]`, '│', wline,'│')));
  if(inspection.response.error)
    inspection.response.error.split("\n").forEach(line=>utils.wrapText(line, 80, 200).forEach((wline)=>logger.info(`[${oid}]`, '│', wline,'│')));

    logger.info(`[${oid}]`, `└──────────────────────────────────────────────────────────────────────────────────┘`);  
}

send.logHeaders=(oid, headers)=>
{
  headers.forEach((item, i)=>
  {
    let name=item.header;
    let value=item.value;
    
    let nameWrap=utils.wrapText(name, 20, 200);
    let valueWrap=[];
    if(value instanceof Array) value.forEach((v)=>valueWrap.push(...utils.wrapText(v, 57, 200)));
    else valueWrap.push(...utils.wrapText(value, 57, 200))
    let lim=nameWrap.length > valueWrap.length ? nameWrap.length : valueWrap.length;
    for(let i=0;i<lim;i++)
    {
      logger.info(`[${oid}]`, '│', i<nameWrap.length ? nameWrap[i]:"".padEnd(20), '│', i<valueWrap.length? valueWrap[i]:"".padEnd(20), '│');
    }
  })
}
//└ ┐─ ┘┌├┤ │


module.exports=send;