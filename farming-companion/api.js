// Farming Companion API on the same Railway service as the other OSRS tools.
const requestedNames=["Oak sapling", "Tomatoes(5)", "Willow sapling", "Apples(5)", "Maple sapling", "Oranges(5)", "Yew sapling", "Cactus spine", "Magic sapling", "Coconut", "Apple sapling", "Sweetcorn", "Cooking apple", "Banana sapling", "Banana", "Orange sapling", "Strawberries(5)", "Orange", "Curry sapling", "Bananas(5)", "Curry leaf", "Pineapple sapling", "Watermelon", "Pineapple", "Papaya sapling", "Papaya fruit", "Palm sapling", "Dragonfruit sapling", "Dragonfruit", "Redwood sapling", "Celastrus sapling", "Potato cactus", "Calquat sapling", "Poison ivy berries", "Calquat fruit", "Teak sapling", "Limpwurt root", "Mahogany sapling", "Yanillian hops", "Camphor sapling", "White berries", "Ironwood sapling", "Rosewood sapling", "Celastrus bark", "Ultracompost"];
requestedNames.push(...["Guam seed", "Grimy guam leaf", "Marrentill seed", "Grimy marrentill", "Tarromin seed", "Grimy tarromin", "Harralander seed", "Grimy harralander", "Ranarr seed", "Grimy ranarr weed", "Toadflax seed", "Grimy toadflax", "Irit seed", "Grimy irit leaf", "Avantoe seed", "Grimy avantoe", "Kwuarm seed", "Grimy kwuarm", "Snapdragon seed", "Grimy snapdragon", "Cadantine seed", "Grimy cadantine", "Lantadyme seed", "Grimy lantadyme", "Dwarf weed seed", "Grimy dwarf weed", "Torstol seed", "Grimy torstol"]);
const tagNames=["Serpentine helm", "Fire cape", "Amulet of torture", "Ghrazi rapier", "Fighter torso", "Dragon defender", "Bandos tassets", "Ferocious gloves", "Primordial boots", "Berserker ring (i)", "Divine super combat potion(4)", "Toxic blowpipe", "Dragon dagger(p++)", "Crystal halberd", "Helm of neitiznot", "Berserker helm", "Neitiznot faceguard", "Torva full helm", "Oathplate helm", "Amulet of strength", "Amulet of glory", "Amulet of fury", "Amulet of rancour", "Ardougne cloak 1", "Ardougne cloak 2", "Ardougne cloak 3", "Mixed hide cape", "Infernal cape", "Black d'hide body", "Blood moon chestplate", "Torag's platebody", "Dharok's platebody", "Guthan's platebody", "Verac's brassard", "Karil's leathertop", "Torva platebody", "Oathplate chest", "Black d'hide chaps", "Blood moon tassets", "Torag's platelegs", "Dharok's platelegs", "Guthan's chainskirt", "Verac's plateskirt", "Karil's leatherskirt", "Torva platelegs", "Oathplate legs", "Dragon scimitar", "Zombie axe", "Abyssal whip", "Noxious halberd", "Abyssal tentacle", "Soulreaper axe", "Blade of saeldor", "Scythe of vitur", "Rune defender", "Avernic defender", "Rada's blessing 4", "Holy blessing", "Unholy blessing", "Peaceful blessing", "Honourable blessing", "War blessing", "Ancient blessing", "Combat bracelet", "Barrows gloves", "Climbing boots", "Mixed hide boots", "Dragon boots", "Avernic treads (max)", "Explorer's ring 1", "Explorer's ring 2", "Explorer's ring 3", "Warrior ring (i)", "Ultor ring", "Arkan blade", "Dragon dagger", "Dragon claws", "Burning claws", "Voidwaker", "Rune knife", "Rune dart", "Super combat potion(4)", "Prayer potion(4)", "Antipoison(4)", "Shark", "Hespori seed", "Rake", "Spade", "Seed dibber", "Farming cape", "Construction cape", "Iron axe", "Digsite pendant", "Digsite teleport", "Tai bwo wannai teleport", "Coins", "Ultracompost", "Bottomless compost bucket", "Law rune", "Lava rune", "Mist rune", "Rune pouch", "Stamina potion(4)", "House teleport", "Taverley teleport", "Brimhaven teleport", "Falador teleport", "Lumbridge teleport", "Varrock teleport", "Catherby teleport", "Camelot teleport", "Ardougne teleport", "Civitas illa Fortis teleport", "Skills necklace", "Ring of wealth", "Slayer ring", "Royal seed pod", "Dramen staff", "Lunar staff", "Teleport crystal", "Pendant of ates", "Quetzal whistle", "Farmer's strawhat", "Farmer's jacket", "Farmer's shirt", "Farmer's boro trousers", "Farmer's boots", "Graceful hood", "Graceful cape", "Graceful top", "Graceful legs", "Graceful gloves", "Graceful boots"];
let priceCache=null,priceCacheUntil=0;
const norm=name=>name.toLowerCase().replace(/\s+/g,'');
async function getPrices(){
 if(priceCache&&Date.now()<priceCacheUntil)return priceCache;
 const headers={'user-agent':'YonwisFarmingCompanion/1.0 (https://osrs.nedtelfer.com/farming-companion/)'};
 const base='https://prices.runescape.wiki/api/v1/osrs/';
 const [mapResponse,priceResponse]=await Promise.all([fetch(base+'mapping',{headers}),fetch(base+'latest',{headers})]);
 if(!mapResponse.ok||!priceResponse.ok)throw Error('Price API unavailable');
 const [mapping,latest]=await Promise.all([mapResponse.json(),priceResponse.json()]);
 const byName=new Map(mapping.map(item=>[norm(item.name),item.id]));
 const prices={},itemIds={};
 for(const name of [...requestedNames,...tagNames]){const id=byName.get(norm(name));if(id)itemIds[name]=id}
 for(const name of requestedNames){const id=byName.get(norm(name)),quote=latest.data?.[id];if(quote)prices[name]={buy:quote.high,sell:quote.low,buyTime:quote.highTime,sellTime:quote.lowTime}}
 priceCache={prices,itemIds};priceCacheUntil=Date.now()+300000;return priceCache;
}
function json(res,status,body){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':status===200?'public, max-age=300':'no-store'});res.end(JSON.stringify(body))}
async function handle(req,res,url){
 if(url.pathname==='/farming-companion/api/prices'){try{json(res,200,await getPrices())}catch{json(res,502,{error:'GE prices unavailable'})}return}
 const username=(url.searchParams.get('username')||'').trim();
 if(!/^[A-Za-z0-9 _-]{1,12}$/.test(username))return json(res,400,{error:'Enter a valid OSRS username.'});
 try{
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);let response;
  try{response=await fetch('https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player='+encodeURIComponent(username),{signal:controller.signal,headers:{'user-agent':'YonwisFarmingCompanion/1.0'}})}finally{clearTimeout(timer)}
  if(response.status===404)return json(res,404,{error:'Username not found on the OSRS HiScores.'});
  if(!response.ok)return json(res,502,{error:'HiScores are temporarily unavailable.'});
  const lines=(await response.text()).trim().split(/\r?\n/),level=Number(lines[20]?.split(',')[1]);
  if(!Number.isInteger(level)||level<1||level>99)return json(res,502,{error:'Could not read the Farming level from HiScores.'});
  json(res,200,{username,level});
 }catch{json(res,502,{error:'HiScores lookup timed out. Try again shortly.'})}
}
module.exports={handle};
