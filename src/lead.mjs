import { createHash, randomUUID } from 'node:crypto';
import schema from '../schemas/lead-event-schema.json' with { type: 'json' };
export const digest = value => createHash('sha256').update(value).digest('hex');
export const hashEmail = value => digest(value.trim().toLowerCase());
export function hashPhone(value){const digits=value.replace(/[^0-9]/g,'');if(digits.length<8||digits.length>15)throw new Error('Country-code phone required');return digest(digits);}
function check(v,s,path='$'){
 const errors=[];
 if(s.const!==undefined&&v!==s.const)errors.push(path+':constant');
 if(s.enum&&!s.enum.includes(v))errors.push(path+':enum');
 if(s.type==='object'){
  if(!v||typeof v!=='object'||Array.isArray(v))return [path+':object'];
  for(const k of s.required??[])if(!Object.hasOwn(v,k))errors.push(path+':required');
  for(const k of Object.keys(v)){if(!Object.hasOwn(s.properties,k))errors.push(path+':unknown');else errors.push(...check(v[k],s.properties[k],path+'.'+k));}
 }else if(s.type==='string'){
  if(typeof v!=='string')errors.push(path+':string');
  else if((s.pattern&&!new RegExp(s.pattern).test(v))||(s.minLength&&v.length<s.minLength)||(s.maxLength&&v.length>s.maxLength))errors.push(path+':format');
 }else if(s.type==='integer'&&(!Number.isSafeInteger(v)||v<(s.minimum??0)))errors.push(path+':integer');
 return errors;
}
export function validateLead(e,now=Math.floor(Date.now()/1000)){
 const errors=check(e,schema);if(errors.length)return errors;
 if(e.event_time>now+60||e.event_time<now-604800)errors.push('timestamp outside project window');
 if(e.consent.ad_user_data!=='granted'&&Object.keys(e.user_data).length)errors.push('identity without advertising consent');
 if(e.consent.ad_storage!=='granted'&&Object.keys(e.attribution).length)errors.push('attribution without storage consent');
 return errors;
}
export function routeLead(e){
 const errors=validateLead(e);if(errors.length)throw new Error(errors.join('; '));
 const ads=['ad_storage','ad_user_data','ad_personalization'].every(k=>e.consent[k]==='granted');
 const metaUser={};if(e.user_data.hashed_email)metaUser.em=[e.user_data.hashed_email];if(e.user_data.hashed_phone)metaUser.ph=[e.user_data.hashed_phone];
 for(const k of ['fbc','fbp'])if(e.attribution[k])metaUser[k]=e.attribution[k];
 return {ga4:e.consent.analytics_storage==='granted'?{name:e.event,params:{event_id:e.event_id,form_id:e.form_id}}:null,meta:ads&&Object.keys(metaUser).length?{data:[{event_name:'Lead',event_time:e.event_time,event_id:e.event_id,action_source:'website',event_source_url:'https://example.invalid/mortgage-demo',user_data:metaUser}]}:null};
}
export function makeDemoLead(){return {schema_version:'1.0.0',event:'generate_lead',event_id:randomUUID(),event_time:Math.floor(Date.now()/1000),form_id:'mortgage_demo',consent:{analytics_storage:'granted',ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'},user_data:{hashed_email:hashEmail('synthetic@example.invalid'),hashed_phone:hashPhone('000000000000')},attribution:{gclid:'SYNTHETIC_CLICK',fbc:'fb.1.1792022400000.SYNTHETIC_CLICK',fbp:'fb.1.1792022400000.0000000000'}};}
