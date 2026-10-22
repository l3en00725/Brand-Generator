const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createRequire} = require('node:module');
const root = path.resolve(__dirname, '..');
const req = createRequire(path.join(root, 'package.json'));
const ts = req('typescript');
const cache = new Map();
function load(relative, mocks = {}) {
 const file = path.resolve(root, relative);
 if (cache.has(file)) return cache.get(file).exports;
 const module = {exports: {}}; cache.set(file, module);
 const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true,
 }}).outputText;
 const localRequire = id => mocks[id] || (id.startsWith('@/') ? load('src/' + id.slice(2) + '.ts', mocks) : id.startsWith('.') ? load(path.relative(root, path.resolve(path.dirname(file), id + '.ts')), mocks) : req(id));
 const fn = vm.runInThisContext('(function(require,module,exports,process){' + source + '\n})', {filename:file});
 fn(localRequire, module, module.exports, {env: {OPENAI_API_KEY: 'synthetic-not-a-real-key'}});
 return module.exports;
}
(async () => {
 const requests = [];
 globalThis.fetch = async (url, options) => {
  const request = JSON.parse(options.body); requests.push({url:String(url), request});
  const response = String(url).endsWith('/chat/completions')
   ? {id:'synthetic', object:'chat.completion', created:0, model:request.model, choices:[{index:0, message:{role:'assistant',content:'synthetic response'},finish_reason:'stop'}]}
   : {created:0,data:[{b64_json:Buffer.from('synthetic-image').toString('base64')}]};
  return new Response(JSON.stringify(response), {status:200,headers:{'content-type':'application/json'}});
 };
 const ai = load('services/openaiService.ts');
 assert.equal(await ai.chat([{role:'user',content:'synthetic brand'}]), 'synthetic response');
 assert.equal(await ai.generateLogo('synthetic logo'), Buffer.from('synthetic-image').toString('base64'));
 assert.equal(requests.length, 2);
 assert.equal(requests[0].request.messages.at(-1).content, 'synthetic brand');
 assert.ok(requests[1].request.prompt.includes('Single logo only.'));
 const sharp = req('sharp');
 const image = await sharp({create:{width:4,height:4,channels:4,background:'#336699'}}).png().toBuffer();
 const asset = load('services/assetProcessor.ts');
 const strategy = {brandName:'Synthetic',industry:'test',audience:'test',tone:'modern',tagline:'synthetic',colors:{primary:'#336699',secondary:'#112233',accent:'#445566',background:'#ffffff',text:'#000000'},logoPrompts:{A:'a',B:'b',C:'c'}};
 const assets = await asset.deriveAssets(image.toString('base64'), strategy);
 assert.equal((await sharp(assets.get('logos/logo.png')).metadata()).width,512);
 assert.ok(assets.size >= 20);
 const zip = load('services/zipBuilder.ts');
 const archive = await zip.createZipFromAssets(assets, strategy.brandName);
 assert.equal(archive.readUInt32LE(0),0x04034b50);
 assert.ok(archive.includes(Buffer.from('logos/logo.png')));
 const {GoogleAuth} = req('google-auth-library');
 const auth = new GoogleAuth({credentials:{client_email:'synthetic@example.invalid',private_key:'synthetic'},scopes:['https://www.googleapis.com/auth/cloud-platform']});
 const client = await auth.getClient();
 assert.equal(typeof client.getAccessToken, 'function');
 const route = load('src/app/api/chat/route.ts');
 const {Chat} = req('@ai-sdk/react');
 const {DefaultChatTransport} = req('ai');
 let demoCalls = 0;
 const chat = new Chat({transport:new DefaultChatTransport({
  api:'http://synthetic.invalid/api/chat',
  fetch:async (_url, options) => {demoCalls++;return route.POST(new Request('http://synthetic.invalid/api/chat', options));},
 })});
 await chat.sendMessage({text:'Our target audience is synthetic testers'});
 assert.equal(chat.status,'ready');
 assert.equal(chat.messages.length,2);
 const text = chat.messages.at(-1).parts.filter(p=>p.type==='text').map(p=>p.text).join('');
 assert.ok(text.includes('what tone'), text);
 assert.equal(demoCalls,1);
 assert.equal((await route.POST(new Request('http://synthetic.invalid/api/chat',{method:'POST',body:JSON.stringify({messages:null})}))).status,400);
 console.log(JSON.stringify({sdkMockRequests:requests.length, assets:assets.size, archiveBytes:archive.length, googleAuthClient:client.constructor.name,demoConversationMessages:chat.messages.length,demoCalls}));
})().catch(error => {console.error(error);process.exitCode=1;});
