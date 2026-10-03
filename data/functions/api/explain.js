const MODEL = '@cf/openai/gpt-oss-20b';

function json(data,status=200){
  return new Response(JSON.stringify(data),{
    status,
    headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}
  });
}

function text(v,max){
  return typeof v==='string' ? v.trim().slice(0,max) : '';
}

export async function onRequestPost(context){
  try{
    if(!context.env.AI)return json({error:'AI binding is not configured.'},503);
    const url=new URL(context.request.url);
    const origin=context.request.headers.get('Origin');
    if(origin && origin!==url.origin)return json({error:'Cross-origin request blocked.'},403);
    const type=context.request.headers.get('content-type')||'';
    if(!type.includes('application/json'))return json({error:'JSON only.'},415);

    const body=await context.request.json();
    const question=text(body.question,1200);
    const answer=text(body.answer,800);
    const subject=text(body.subject,60);
    const grade=Number(body.grade);
    const choices=Array.isArray(body.choices)?body.choices.slice(0,6).map(v=>text(v,300)).filter(Boolean):[];
    if(!question||!answer)return json({error:'Question and answer are required.'},400);

    const user=[
      `対象: 中学${[1,2,3].includes(grade)?grade:'生'} / ${subject||'教科不明'}`,
      `問題: ${question}`,
      choices.length?`選択肢:\n${choices.map((x,i)=>`${i+1}. ${x}`).join('\n')}`:'',
      `正解: ${answer}`
    ].filter(Boolean).join('\n');

    const response=await context.env.AI.run(MODEL,{
      messages:[
        {role:'system',content:'あなたは日本の中学生向け学習アプリの解説者です。与えられた問題と正解だけを根拠に、正確でやさしい日本語で説明してください。読みやすさを最優先し、必ず次の4ブロックをこの順番で出力してください。各ブロックの間には空行を1行入れてください。1行に情報を詰め込みすぎないでください。\n\n【要点】\n正解の意味や結論を1〜2文。\n\n【なぜ？】\nなぜその答えになるのかを2〜4文。必要なら箇条書きを使う。\n\n【覚え方・考え方】\n中学生が覚えやすいコツ、または解き方を1〜3文。\n\n【間違えやすい点】\n似た語句・選択肢との違いを1〜3文。\n\n文章は短く区切り、専門用語を使う場合は簡単に言い換えてください。情報が不足して断定できない場合は推測せず、その旨を明記してください。個人情報を要求しないでください。全体は250〜450字程度にしてください。Markdownの#見出しや表は使わず、箇条書きは「・」を使ってください。'},
        {role:'user',content:user}
      ],
      max_tokens:500,
      temperature:0.2
    });

    const explanation = typeof response==='string'
      ? response
      : (response?.response || response?.result?.response || response?.choices?.[0]?.message?.content || '');
    if(!explanation)return json({error:'AI returned no explanation.'},502);
    return json({explanation:String(explanation).trim().slice(0,2500)});
  }catch(error){
    console.error('AI explanation error',error);
    return json({error:'AI explanation failed.'},500);
  }
}

export function onRequest(){
  return json({error:'Method not allowed.'},405);
}
