// 内部ファイル（設計資料・検証スクリプト・設定・Functions のソースなど）を公開しないための門番。
// Cloudflare Pages はビルド出力ディレクトリ "." の全ファイルを配信するため、
// 公開してよい静的ファイルは _routes.json の exclude で1ファイルずつ直接配信し、それ以外のパスはすべてここを通る。
// （ディレクトリ単位の exclude は "/icons/..%2fREADME.md" のような細工で迂回されるため使わない）
const BLOCKED_DIRS=/^\/(scripts|docs|functions|transfer|node_modules|\.github|\.git|\.claude)(\/|$)/i;
const BLOCKED_EXT=/\.(md|markdown|py|pyc|toml|sh|bash|ps1|ya?ml|lock|map|bundle|patch|env|ini|cfg|log)$/i;
const BLOCKED_FILES=/^\/(candidates\.json|package\.json|package-lock\.json|_headers|_redirects|_routes\.json|wrangler\.json|wrangler\.jsonc)$/i;
const DOT_SEGMENT=/(^|\/)\.[^/]/;

export function isBlockedPath(pathname){
  let p;
  try{p=decodeURIComponent(pathname);}catch{return true;}
  p=p.replace(/\/{2,}/g,'/');
  if(p.includes('\\')||p.includes('\0'))return true;
  // 「..」「.」を含むパス（%2f などで細工したものを含む）は正規の公開ファイルではないので拒否する。
  if(/(^|\/)\.{1,2}(\/|$)/.test(p))return true;
  return BLOCKED_DIRS.test(p)||BLOCKED_EXT.test(p)||BLOCKED_FILES.test(p)||DOT_SEGMENT.test(p);
}

export async function onRequest(context){
  const url=new URL(context.request.url);
  if(isBlockedPath(url.pathname)){
    return new Response('Not Found',{status:404,headers:{'content-type':'text/plain; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
  }
  return context.next();
}
