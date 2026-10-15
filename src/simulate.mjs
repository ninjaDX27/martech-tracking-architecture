import {makeDemoLead,routeLead} from './lead.mjs';
const event=makeDemoLead();console.log(JSON.stringify({mode:'dry-run',event,destinations:routeLead(event)},null,2));
