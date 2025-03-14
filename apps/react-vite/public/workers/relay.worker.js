!function(){"use strict";const e=self,t=new Map,a=new Map;function o(e){console.log("Unregistering client:",e);const o=a.get(e);if(t.delete(e),a.delete(e),o&&o.port)try{o.port.close()}catch(e){console.error("Error closing port:",e)}n(),console.log(`Tab unregistered. Current tabs: ${a.size}`)}function s(){return Array.from(a.values()).map((e=>({tabId:e.tabId,tabName:e.tabName,lastSeen:e.lastHeartbeat})))}function n(){const e=s();t.forEach((t=>{t.postMessage({type:"TAB_LIST",tabs:e})}))}console.log(`Relay worker started at ${(new Date).toISOString()}`),e.onconnect=function(e){const r=e.ports[0];let c=null,l=!0;console.log("New connection to worker established"),r.onmessage=function(e){const b=e.data;if(l)switch(b.type){case"REGISTER":console.log("Registering tab:",b.tabId,b.tabName),a.has(b.tabId)&&(console.log("Tab already registered, cleaning up old connection"),o(b.tabId)),c=b.tabId;const e={tabId:c,tabName:b.tabName,port:r,lastHeartbeat:Date.now(),isActive:!0};!function(e,a){t.forEach((t=>{t.postMessage({type:"REGISTRATION",tabId:e,tabName:a})}))}(c,b.tabName),t.set(c,r),a.set(c,e),n();break;case"HEARTBEAT":if(b.tabId&&a.has(b.tabId)){const e=a.get(b.tabId);e.lastHeartbeat=Date.now(),a.set(b.tabId,e)}break;case"GET_TAB_LIST":r.postMessage({type:"TAB_LIST",tabs:s()});break;case"REQUEST_ACTION":const i=t.get(b.targetTabId);i&&c?i.postMessage({type:"ACTION_REQUEST",action:b.action,requestId:b.requestId,requestorId:c,payload:b.payload}):c&&r.postMessage({type:"ACTION_ERROR",requestId:b.requestId,error:"Target tab not available"});break;case"ACTION_RESPONSE":const g=t.get(b.requestorId);g&&g.postMessage({type:"ACTION_RESULT",requestId:b.requestId,result:b.result});break;case"UNREGISTER":console.log("Explicit unregister:",b.tabId),b.tabId&&(o(b.tabId),b.tabId===c&&(l=!1))}else console.log("Port is not active, ignoring message")},r.onmessageerror=function(){console.log("Message error on port"),console.log(`Port closed for tab ${c}`),c&&l&&(o(c),l=!1)},r.start()},setInterval((function(){const e=Date.now();let t=!1;a.forEach(((a,s)=>{e-a.lastHeartbeat>15e3&&(console.log(`Stale connection detected for tab ${s}, last seen ${(e-a.lastHeartbeat)/1e3}s ago`),o(s),t=!0)})),t&&n()}),1e4),setInterval((()=>{console.log(`Worker status: ${a.size} active tabs`),a.size>0&&console.log("Active tabs:",Array.from(a.entries()).map((([e,t])=>`${e} (${t.tabName}) - last seen ${(Date.now()-t.lastHeartbeat)/1e3}s ago`)).join(", "))}),1e4)}();
//# sourceMappingURL=relay.worker.js.map
