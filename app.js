const APP_VERSION='0.36.0';
const state={grade:2,subject:null,units:new Set(),quizMaterials:new Set(),count:5,quizTextbookYear:2026,curriculum:null,builtInQuestions:[],questionBank:[],session:[],index:0,score:0,answers:[],sessionContext:null,review:{grade:'all',subject:'all',field:'',units:new Set(),count:5},exam:{editId:null,grade:2,units:new Set(),textbookYear:2026,materials:new Set(),openSubjects:new Set()},mockExam:{planId:null,count:20,minutes:30,lastResultId:null},importGrade:2,importQuestions:[],importPages:[],manageEditId:null,pdfAssetBase:null,pdfWorkerUrl:null,ocrScriptUrl:null,textbookData:null};

const TEXTBOOK_CANDIDATES={
 version:'r7-2025-2028',validYears:[2025,2026,2027,2028],
 japanese:{
  'sanseido':{
   1:[
    ['朝のリレー','poetry'],['竜','literature'],['ペンギンの防寒着','expository'],['クジラの飲み水','expository'],['空中ブランコ乗りのキキ','literature'],['字のない葉書','literature'],['一〇〇〇円の価値を考える','expository'],['竹取物語','classics'],['矛盾―故事成語','classics'],['トロッコ','literature'],['少年の日の思い出','literature']
   ],
   2:[
    ['名づけられた葉','poetry'],['セミロングホームルーム','literature'],['宇宙に行くための素材','expository'],['人間は他の星に住むことができるのか','expository'],['短歌十首','poetry'],['壁に残された伝言','expository'],['味は味覚だけでは決まらない','expository'],['枕草子・徒然草','classics'],['平家物語','classics'],['漢詩の世界','classics'],['小さな手袋','literature'],['走れメロス','literature']
   ],
   3:[
    ['言の森','poetry'],['握手','literature'],['「批判的に読む」とは','expository'],['間の文化','expository'],['俳句十句','poetry'],['海を越えた故郷の味','literature'],['フロン規制の物語','expository'],['万葉集・古今和歌集・新古今和歌集','classics'],['おくのほそ道','classics'],['論語','classics'],['初恋','poetry'],['故郷','literature'],['私とは何か','expository'],['坊っちゃん','literature']
   ]
  },
  'mitsumura':{
   1:[
    ['朝のリレー','poetry'],['はじまりの風','literature'],['ダイコンは大きな根？','expository'],['ちょっと立ち止まって','expository'],['空の詩 三編','poetry'],['大人になれなかった弟たちに……','literature'],['星の花が降るころに','literature'],['「言葉」をもつ鳥、シジュウカラ','expository'],['蓬莱の玉の枝―「竹取物語」から','classics'],['少年の日の思い出','literature']
   ],
   2:[
    ['見えないだけ','poetry'],['アイスプラネット','literature'],['枕草子','classics'],['クマゼミ増加の原因を探る','expository'],['字のない葉書','literature'],['モアイは語る―地球の未来','expository'],['平家物語','classics'],['仁和寺にある法師','classics'],['漢詩の風景','classics'],['君は「最後の晩餐」を知っているか','expository'],['走れメロス','literature']
   ],
   3:[
    ['世界はうつくしいと','poetry'],['握手','literature'],['作られた「物語」を超えて','expository'],['俳句の可能性','poetry'],['故郷','literature'],['人工知能との未来','expository'],['おくのほそ道','classics'],['学びて時にこれを習ふ―「論語」から','classics'],['誰かの代わりに','expository'],['温かいスープ','literature'],['わたしを束ねないで','poetry']
   ]
  },
  'kyoiku-shuppan':{
   1:[
    ['聞くということ','literature'],['桜蝶','literature'],['自分の脳を知っていますか','expository'],['ベンチ','literature'],['森には魔法つかいがいる','expository'],['昔話と古典―箱に入った桃太郎―','classics'],['物語の始まり―竹取物語―','classics'],['故事成語―中国の名言―','classics'],['河童と蛙','poetry'],['オツベルと象','literature'],['少年の日の思い出','literature']
   ],
   2:[
    ['虹の足','poetry'],['タオル','literature'],['日本の花火の楽しみ','expository'],['水の山 富士山','expository'],['夢を跳ぶ','literature'],['紙の建築','expository'],['敦盛の最期―平家物語―','classics'],['随筆の味わい―枕草子・徒然草―','classics'],['二千五百年前からのメッセージ―孔子の言葉―','classics'],['短歌の味わい','poetry'],['夏の葬列','literature'],['走れメロス','literature']
   ],
   3:[
    ['春に','poetry'],['立ってくる春','literature'],['なぜ物語が必要なのか','expository'],['ＡＩは哲学できるか','expository'],['問いかける言葉','expository'],['旅への思い―芭蕉と「おくのほそ道」―','classics'],['和歌の調べ―万葉集・古今和歌集・新古今和歌集―','classics'],['風景と心情―漢詩を味わう―','classics'],['俳句の味わい','poetry'],['初恋','poetry'],['故郷','literature'],['バースデイ・ガール','literature']
   ]
  }
 },
 english:{
  'mitsumura':{
   1:['Unit 1 Here We Go!','Unit 2 School Activities','Unit 3 Enjoy the Summer','Unit 4 Our New Friend','Unit 5 Hi, David!','Unit 6 Cheer Up, Tina','Unit 7 The New Year in Japan','Unit 8 Getting Ready for the Party'],
   2:["Unit 1 Hajin's Diary",'Unit 2 Basketball Tournament','Unit 3 Plans for the Summer','Unit 4 Tour in Singapore','Unit 5 How Do We Stay Safe?','Unit 6 Guide Dogs','Unit 7 Working Together','Unit 8 Performing a Play'],
   3:['Unit 1 Virtual Safari Tour','Unit 2 Our School Trip','Unit 3 Lessons From Hiroshima','Unit 4 AI Technology and Language','Unit 5 My Dreams for the Future','Unit 6 The Chorus Contest',"Unit 7 Tina's Speech",'Unit 8 Goodbye, Tina']
  },
  'sanseido':{
   1:['Lesson 1 About Me','Lesson 2 My Hero','Lesson 3 My Treasure','Lesson 4 My Summer Plans',"Lesson 5 Ms. Brown's Family",'Lesson 6 School Life in the U.S.A.','Lesson 7 Athletes with Spirit','Lesson 8 Discover Japan','Lesson 9 Emergency Food'],
   2:['Lesson 1 Meet New Friends','Lesson 2 Fun with Books','Lesson 3 My Dream','Lesson 4','Lesson 5','Lesson 6','Lesson 7','Lesson 8'],
   3:['Lesson 1 Join Us','Lesson 2 The Power of Music','Lesson 3 Cranes for Peace','Lesson 4 Bollywood Movies','Lesson 5 Translating Culture','Lesson 6 Being Fair','Lesson 7 Design for Change','Lesson 8 For Our Future']
  },
  'tokyo-shoseki':{
   1:['Unit 0','Unit 1','Unit 2','Unit 3','Unit 4','Unit 5','Unit 6','Unit 7','Unit 8'],
   2:['Unit 0','Unit 1','Unit 2','Unit 3','Unit 4','Unit 5','Unit 6','Unit 7'],
   3:['Unit 0 Discover a New Side of Classmates','Unit 1 What is special about Japanese pop culture?','Unit 2 How do you choose your clothes?','Unit 3 How can we save animals?','Unit 4 How can we help each other in a disaster?','Unit 5 What makes a good leader?','Unit 6 What does it mean to be a global citizen?']
  },
  'kairyudo':{
   1:['Get Ready 1-6','PROGRAM 1','PROGRAM 2','PROGRAM 3','PROGRAM 4','PROGRAM 5','PROGRAM 6','PROGRAM 7','PROGRAM 8'],
   2:['PROGRAM 1 New Start','PROGRAM 2','PROGRAM 3','PROGRAM 4','PROGRAM 5','PROGRAM 6','PROGRAM 7','PROGRAM 8'],
   3:['PROGRAM 1 Japanese Bentos Are Interesting!','PROGRAM 2 Good Night. Sleep Tight.','PROGRAM 3 Hot Sport Today','PROGRAM 4 Sign Languages, Not Just Gestures!','PROGRAM 5 The Story of Chocolate','PROGRAM 6 The Great Pacific Garbage Patch','PROGRAM 7 Robots Can Improve Quality of Life']
  }
 }
};

const TEXTBOOK_PAGE_RANGES={
 japanese:{
  sanseido:{
   1:{
    '朝のリレー':'pp.22〜25',
    '竜':'pp.26〜35',
    'ペンギンの防寒着':'pp.44〜47',
    'クジラの飲み水':'pp.48〜55',
    '空中ブランコ乗りのキキ':'pp.66〜77',
    '字のない葉書':'pp.80〜85',
    '一〇〇〇円の価値を考える':'pp.98〜105',
    '竹取物語':'pp.118〜131',
    '矛盾―故事成語':'pp.134〜137',
    'トロッコ':'pp.172〜183',
    '少年の日の思い出':'pp.206〜219'
   },
   2:{
    '名づけられた葉':'pp.22〜25',
    'セミロングホームルーム':'pp.26〜35',
    '宇宙に行くための素材':'pp.44〜47',
    '人間は他の星に住むことができるのか':'pp.48〜55',
    '短歌十首':'pp.68〜72',
    '壁に残された伝言':'pp.80〜87',
    '味は味覚だけでは決まらない':'pp.92〜99',
    '枕草子・徒然草':'pp.112〜119',
    '平家物語':'pp.120〜133',
    '漢詩の世界':'pp.136〜139',
    '小さな手袋':'pp.170〜181',
    '走れメロス':'pp.208〜225'
   },
   3:{
    '言の森':'pp.22〜25',
    '握手':'pp.28〜41',
    '「批判的に読む」とは':'pp.52〜55',
    '間の文化':'pp.56〜63',
    '俳句十句':'pp.76〜80',
    '海を越えた故郷の味':'pp.88〜95',
    'フロン規制の物語':'pp.100〜109',
    '万葉集・古今和歌集・新古今和歌集':'pp.118〜127',
    'おくのほそ道':'pp.130〜139',
    '論語':'pp.142〜144',
    '初恋':'pp.166〜168',
    '故郷':'pp.172〜189',
    '私とは何か':'pp.194〜201',
    '坊っちゃん':'pp.202〜215'
   }
  }
 },
 english:{
  mitsumura:{
   1:{
    'Unit 1 Here We Go!':'pp.26〜35','Unit 2 School Activities':'pp.36〜44','Unit 3 Enjoy the Summer':'pp.46〜54','Unit 4 Our New Friend':'pp.60〜69','Unit 5 Hi, David!':'pp.72〜81','Unit 6 Cheer Up, Tina':'pp.84〜93','Unit 7 The New Year in Japan':'pp.100〜111','Unit 8 Getting Ready for the Party':'pp.114〜123'
   },
   2:{
    "Unit 1 Hajin's Diary":'pp.8〜17','Unit 2 Basketball Tournament':'pp.19〜27','Unit 3 Plans for the Summer':'pp.31〜39','Unit 4 Tour in Singapore':'pp.49〜57','Unit 5 How Do We Stay Safe?':'pp.59〜67','Unit 6 Guide Dogs':'pp.71〜79','Unit 7 Working Together':'pp.91〜99','Unit 8 Performing a Play':'pp.101〜109'
   },
   3:{
    'Unit 1 Virtual Safari Tour':'pp.8〜17','Unit 2 Our School Trip':'pp.19〜27','Unit 3 Lessons From Hiroshima':'pp.29〜37','Unit 4 AI Technology and Language':'pp.47〜55','Unit 5 My Dreams for the Future':'pp.61〜69','Unit 6 The Chorus Contest':'pp.71〜79',"Unit 7 Tina's Speech":'pp.85〜91','Unit 8 Goodbye, Tina':'pp.97〜103'
   }
  }
 }
};
function textbookPageRange(subjectId,publisher,grade,title){return TEXTBOOK_PAGE_RANGES?.[subjectId]?.[publisher]?.[Number(grade)]?.[title]||'';}

// 令和7年度以降の教科書で、公開資料から確認できた大単元の参照ページ。
// 社会・理科は学校設定中の出版社に一致する場合だけ表示する。
const TEXTBOOK_UNIT_PAGE_RANGES={
 social:{
  teikoku:{
   'social/geography/world-overview':'pp.2〜13',
   'social/geography/world-regions':'pp.45〜127',
   'social/geography/japan-overview':'pp.14〜25',
   'social/geography/japan-regions':'pp.166〜282',
   'social/geography/regional-study':'pp.128〜139 / pp.283〜293',
   'social/history/ancient':'pp.15〜62',
   'social/history/medieval':'pp.63〜104',
   'social/history/early-modern':'pp.105〜160',
   'social/history/modern':'pp.161〜271',
   'social/history/contemporary':'pp.275〜306'
  },
  'tokyo-shoseki':{
   'social/history/ancient':'pp.22〜63',
   'social/history/medieval':'pp.64〜97',
   'social/history/early-modern':'pp.98〜143',
   'social/history/modern':'pp.144〜243',
   'social/civics/modern-society':'pp.8〜29'
  }
 },
 science:{
  keirinkan:{
   'science/biology/plants-animals':'pp.18〜61',
   'science/earth/earth-change':'pp.62〜125',
   'science/chemistry/substances':'pp.134〜197',
   'science/physics/light-sound-force':'pp.198〜255',
   'science/biology/cells-body':'pp.2〜67',
   'science/earth/weather':'pp.68〜131',
   'science/chemistry/chemical-change':'pp.138〜207',
   'science/physics/electricity':'pp.208〜281',
   'science/biology/reproduction-genetics':'pp.2〜45',
   'science/earth/earth-space':'pp.46〜99',
   'science/chemistry/ions':'pp.104〜169',
   'science/physics/motion-energy':'pp.170〜243',
   'science/environment/nature-human':'pp.244〜307'
  },
  'tokyo-shoseki':{
   'science/biology/plants-animals':'pp.10〜69',
   'science/chemistry/substances':'pp.70〜137',
   'science/physics/light-sound-force':'pp.138〜187',
   'science/earth/earth-change':'pp.188〜241',
   'science/chemistry/chemical-change':'pp.12〜85',
   'science/biology/cells-body':'pp.86〜165',
   'science/earth/weather':'pp.166〜227',
   'science/physics/electricity':'pp.228〜289',
   'science/chemistry/ions':'pp.8〜71',
   'science/biology/reproduction-genetics':'pp.72〜125',
   'science/physics/motion-energy':'pp.126〜187',
   'science/earth/earth-space':'pp.188〜245',
   'science/environment/nature-human':'pp.246〜307'
  }
 }
};
function textbookUnitPageRange(subjectId,publisher,fieldId,unitId){
 const key=unitKey(subjectId,fieldId,unitId);
 return TEXTBOOK_UNIT_PAGE_RANGES?.[subjectId]?.[publisher]?.[key]||'';
}

function japaneseMaterialUnitKey(kind){return `japanese/reading/${kind||'literature'}`;}
function englishCandidateUnitKeys(title,grade){
 const keys=['english/communication/reading','english/communication/conversation'];
 const t=String(title).toLowerCase();
 if(grade===1){keys.push('english/language/basic-sentences');if(/7|8|9|past|new year|party|emergency/.test(t))keys.push('english/language/past-progressive');}
 if(grade===2){if(/1|diary|new start/.test(t))keys.push('english/language/past-progressive');if(/2|3|dream|plans/.test(t))keys.push('english/language/infinitive-gerund');if(/3|4|5/.test(t))keys.push('english/language/future-modal');if(/7|8|performing/.test(t))keys.push('english/language/comparison-passive');}
 if(grade===3){if(/unit 1|lesson 1|program 1/.test(t))keys.push('english/language/comparison-passive');if(/unit 2|unit 3|lesson 2|lesson 3|program 2|program 3/.test(t))keys.push('english/language/present-perfect');if(/unit 4|unit 5|unit 6|lesson 4|lesson 5|lesson 6|program 4|program 5|program 6/.test(t))keys.push('english/language/relative-clauses');if(/unit 7|lesson 7|program 7/.test(t))keys.push('english/language/conditional');if(/unit 8|lesson 8|program 8/.test(t))keys.push('english/communication/writing');}
 return [...new Set(keys)];
}
function textbookCandidateRows(subjectId,publisher,grade,year){
 if(!TEXTBOOK_CANDIDATES.validYears.includes(Number(year)))return[];
 const raw=TEXTBOOK_CANDIDATES?.[subjectId]?.[publisher]?.[Number(grade)]||[];
 if(subjectId==='japanese')return raw.map((x,i)=>({id:`j-${publisher}-${grade}-${i}`,subject:subjectId,publisher,grade:Number(grade),title:x[0],pages:textbookPageRange(subjectId,publisher,grade,x[0]),unitKeys:[japaneseMaterialUnitKey(x[1])]}));
 if(subjectId==='english')return raw.map((title,i)=>({id:`e-${publisher}-${grade}-${i}`,subject:subjectId,publisher,grade:Number(grade),title,pages:textbookPageRange(subjectId,publisher,grade,title),unitKeys:englishCandidateUnitKeys(title,Number(grade))}));
 return[];
}

const SHIZUOKA_TEXTBOOK_FALLBACK={"version":"2026-10-shizuoka-r7-r10-all-subjects","prefecture":"静岡県","validFrom":2025,"validTo":2028,"scope":"市町立中学校","source":"静岡県教育委員会 中学校教科用図書一覧（令和7～10年度使用）","publishers":{"tokyo-shoseki":{"name":"東京書籍","short":"東書"},"sanseido":{"name":"三省堂","short":"三省堂"},"mitsumura":{"name":"光村図書","short":"光村"},"kyoiku-shuppan":{"name":"教育出版","short":"教出"},"teikoku":{"name":"帝国書院","short":"帝国"},"gakko-tosho":{"name":"学校図書","short":"学図"},"keirinkan":{"name":"啓林館","short":"啓林館"},"kyoiku-geijutsusha":{"name":"教育芸術社","short":"教芸"},"nihon-bunkyo":{"name":"日本文教出版","short":"日文"},"kairyudo":{"name":"開隆堂出版","short":"開隆堂"},"taishukan":{"name":"大修館書店","short":"大修館"},"gakken":{"name":"Gakken","short":"学研"}},"subjects":{"japanese":{"name":"国語","icon":"📕","parts":{"language":"国語","handwriting":"書写"}},"social":{"name":"社会","icon":"🌍","parts":{"geography":"地理","history":"歴史","civics":"公民","atlas":"地図"}},"math":{"name":"数学","icon":"📘","parts":{"main":"数学"}},"science":{"name":"理科","icon":"🔬","parts":{"main":"理科"}},"music":{"name":"音楽","icon":"🎵","parts":{"general":"一般","instrumental":"器楽合奏"}},"art":{"name":"美術","icon":"🎨","parts":{"main":"美術"}},"pe":{"name":"保健体育","icon":"🏃","parts":{"main":"保健体育"}},"tech-home":{"name":"技術・家庭","icon":"🛠️","parts":{"technology":"技術","home":"家庭"}},"english":{"name":"英語","icon":"🔤","parts":{"main":"英語"}}},"districts":[{"id":"kamo","name":"賀茂","municipalities":["下田市","東伊豆町","河津町","南伊豆町","松崎町","西伊豆町"],"adoptions":{"japanese":{"language":"sanseido","handwriting":"mitsumura"},"social":{"geography":"tokyo-shoseki","history":"tokyo-shoseki","civics":"tokyo-shoseki","atlas":"teikoku"},"math":{"main":"gakko-tosho"},"science":{"main":"tokyo-shoseki"},"music":{"general":"kyoiku-geijutsusha","instrumental":"kyoiku-geijutsusha"},"art":{"main":"nihon-bunkyo"},"pe":{"main":"tokyo-shoseki"},"tech-home":{"technology":"kairyudo","home":"kairyudo"},"english":{"main":"tokyo-shoseki"}}},{"id":"tagata","name":"田方","municipalities":["三島市","熱海市","伊東市","伊豆市","伊豆の国市","函南町"],"adoptions":{"japanese":{"language":"mitsumura","handwriting":"mitsumura"},"social":{"geography":"tokyo-shoseki","history":"tokyo-shoseki","civics":"nihon-bunkyo","atlas":"teikoku"},"math":{"main":"gakko-tosho"},"science":{"main":"tokyo-shoseki"},"music":{"general":"kyoiku-shuppan","instrumental":"kyoiku-shuppan"},"art":{"main":"nihon-bunkyo"},"pe":{"main":"tokyo-shoseki"},"tech-home":{"technology":"kairyudo","home":"kairyudo"},"english":{"main":"kairyudo"}}},{"id":"sunto-numazu","name":"駿東沼津","municipalities":["沼津市","裾野市","御殿場市","清水町","長泉町","小山町"],"adoptions":{"japanese":{"language":"sanseido","handwriting":"tokyo-shoseki"},"social":{"geography":"tokyo-shoseki","history":"tokyo-shoseki","civics":"tokyo-shoseki","atlas":"teikoku"},"math":{"main":"gakko-tosho"},"science":{"main":"keirinkan"},"music":{"general":"kyoiku-geijutsusha","instrumental":"kyoiku-geijutsusha"},"art":{"main":"kairyudo"},"pe":{"main":"tokyo-shoseki"},"tech-home":{"technology":"kairyudo","home":"kairyudo"},"english":{"main":"mitsumura"}}},{"id":"fuji","name":"富士","municipalities":["富士市","富士宮市"],"adoptions":{"japanese":{"language":"kyoiku-shuppan","handwriting":"kyoiku-shuppan"},"social":{"geography":"kyoiku-shuppan","history":"kyoiku-shuppan","civics":"kyoiku-shuppan","atlas":"teikoku"},"math":{"main":"gakko-tosho"},"science":{"main":"keirinkan"},"music":{"general":"kyoiku-geijutsusha","instrumental":"kyoiku-geijutsusha"},"art":{"main":"kairyudo"},"pe":{"main":"tokyo-shoseki"},"tech-home":{"technology":"kairyudo","home":"kairyudo"},"english":{"main":"tokyo-shoseki"}}},{"id":"shizuoka","name":"静岡","municipalities":["静岡市"],"adoptions":{"japanese":{"language":"sanseido","handwriting":"mitsumura"},"social":{"geography":"teikoku","history":"teikoku","civics":"tokyo-shoseki","atlas":"teikoku"},"math":{"main":"keirinkan"},"science":{"main":"keirinkan"},"music":{"general":"kyoiku-geijutsusha","instrumental":"kyoiku-geijutsusha"},"art":{"main":"mitsumura"},"pe":{"main":"tokyo-shoseki"},"tech-home":{"technology":"kairyudo","home":"kairyudo"},"english":{"main":"mitsumura"}}},{"id":"shida","name":"志太","municipalities":["焼津市","藤枝市","島田市"],"adoptions":{"japanese":{"language":"kyoiku-shuppan","handwriting":"kyoiku-shuppan"},"social":{"geography":"kyoiku-shuppan","history":"kyoiku-shuppan","civics":"tokyo-shoseki","atlas":"teikoku"},"math":{"main":"gakko-tosho"},"science":{"main":"keirinkan"},"music":{"general":"kyoiku-geijutsusha","instrumental":"kyoiku-geijutsusha"},"art":{"main":"nihon-bunkyo"},"pe":{"main":"tokyo-shoseki"},"tech-home":{"technology":"kairyudo","home":"kairyudo"},"english":{"main":"sanseido"}}},{"id":"haibara","name":"榛原","municipalities":["牧之原市","吉田町","川根本町"],"adoptions":{"japanese":{"language":"mitsumura","handwriting":"kyoiku-shuppan"},"social":{"geography":"teikoku","history":"teikoku","civics":"teikoku","atlas":"teikoku"},"math":{"main":"gakko-tosho"},"science":{"main":"keirinkan"},"music":{"general":"kyoiku-geijutsusha","instrumental":"kyoiku-geijutsusha"},"art":{"main":"kairyudo"},"pe":{"main":"taishukan"},"tech-home":{"technology":"kairyudo","home":"kairyudo"},"english":{"main":"tokyo-shoseki"}}},{"id":"ogasa","name":"小笠","municipalities":["掛川市","御前崎市","菊川市"],"adoptions":{"japanese":{"language":"mitsumura","handwriting":"kyoiku-shuppan"},"social":{"geography":"tokyo-shoseki","history":"tokyo-shoseki","civics":"tokyo-shoseki","atlas":"teikoku"},"math":{"main":"gakko-tosho"},"science":{"main":"tokyo-shoseki"},"music":{"general":"kyoiku-geijutsusha","instrumental":"kyoiku-geijutsusha"},"art":{"main":"nihon-bunkyo"},"pe":{"main":"gakken"},"tech-home":{"technology":"tokyo-shoseki","home":"tokyo-shoseki"},"english":{"main":"mitsumura"}}},{"id":"iwata-shuchi","name":"磐田周智","municipalities":["森町","袋井市","磐田市"],"adoptions":{"japanese":{"language":"mitsumura","handwriting":"mitsumura"},"social":{"geography":"tokyo-shoseki","history":"tokyo-shoseki","civics":"tokyo-shoseki","atlas":"teikoku"},"math":{"main":"gakko-tosho"},"science":{"main":"tokyo-shoseki"},"music":{"general":"kyoiku-geijutsusha","instrumental":"kyoiku-geijutsusha"},"art":{"main":"nihon-bunkyo"},"pe":{"main":"taishukan"},"tech-home":{"technology":"kairyudo","home":"kairyudo"},"english":{"main":"kairyudo"}}},{"id":"hamamatsu","name":"浜松","municipalities":["浜松市"],"adoptions":{"japanese":{"language":"mitsumura","handwriting":"mitsumura"},"social":{"geography":"teikoku","history":"teikoku","civics":"teikoku","atlas":"teikoku"},"math":{"main":"kyoiku-shuppan"},"science":{"main":"tokyo-shoseki"},"music":{"general":"kyoiku-geijutsusha","instrumental":"kyoiku-geijutsusha"},"art":{"main":"nihon-bunkyo"},"pe":{"main":"gakken"},"tech-home":{"technology":"kairyudo","home":"kairyudo"},"english":{"main":"mitsumura"}}},{"id":"kosai","name":"湖西","municipalities":["湖西市"],"adoptions":{"japanese":{"language":"mitsumura","handwriting":"mitsumura"},"social":{"geography":"teikoku","history":"teikoku","civics":"teikoku","atlas":"teikoku"},"math":{"main":"kyoiku-shuppan"},"science":{"main":"tokyo-shoseki"},"music":{"general":"kyoiku-geijutsusha","instrumental":"kyoiku-geijutsusha"},"art":{"main":"mitsumura"},"pe":{"main":"tokyo-shoseki"},"tech-home":{"technology":"tokyo-shoseki","home":"tokyo-shoseki"},"english":{"main":"mitsumura"}}}]};
const views=[...document.querySelectorAll('.view')];
let cameraStream=null;
let facingMode='environment';
let importedObjectUrls=[];

function showView(id){
  views.forEach(v=>v.classList.toggle('active',v.id===id));
  document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===id));
  window.scrollTo({top:0,behavior:'instant'});
}
function goHome(){stopCamera();stopMockTimer();showView('homeView');renderDailyPlanPreview()}

document.querySelectorAll('[data-back]').forEach(b=>b.onclick=goHome);
document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>showView(b.dataset.nav));
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>handleAction(b.dataset.action));
function handleAction(action){
 if(action==='quiz'){showView('quizView');renderQuiz();}
 else if(action==='exam'){openExamPlans();}
 else if(action==='daily'){startDailyStudy();}
 else if(action==='import'){showView('importView');}
 else if(action==='review'){openReview();}
 else if(action==='stats'){openStats();}
 else if(action==='manage'){openManage();}
 else if(action==='backup'){openBackup();}
 else if(action==='textbooks'){openTextbookSettings();}
 else alert('この機能は今後追加します。');
}

async function init(){
 state.textbookData=SHIZUOKA_TEXTBOOK_FALLBACK;
 migrateTextbookPreference();
 initSchoolTextbookSettings();
 try{
   // index.html を直接開いた場合でも動くよう、同梱JSデータを優先する。
   if(window.CURRICULUM_DATA && window.QUESTION_DATA){
     state.curriculum=window.CURRICULUM_DATA;
     state.builtInQuestions=[...(window.QUESTION_DATA.questions||[])];refreshQuestionBank();
     renderQuiz();fillImportSubjects();fillManageSubjects();renderExamPlanList();renderDailyPlanPreview();
     document.getElementById('dataVersion').textContent=`アプリ ${APP_VERSION} / 単元 ${state.curriculum.version} / 問題 ${window.QUESTION_DATA.version}`;
   }else{
     const [cr,qr]=await Promise.all([fetch('data/curriculum.json'),fetch('data/questions.json')]);
     if(!cr.ok||!qr.ok)throw new Error('data load failed');
     state.curriculum=await cr.json();
     const qdata=await qr.json();
     state.builtInQuestions=[...(qdata.questions||[])];refreshQuestionBank();
     renderQuiz();fillImportSubjects();fillManageSubjects();renderExamPlanList();renderDailyPlanPreview();
     document.getElementById('dataVersion').textContent=`アプリ ${APP_VERSION} / 単元 ${state.curriculum.version} / 問題 ${qdata.version}`;
   }
 }catch(error){
   console.error(error);
   document.getElementById('selectionSummary').textContent='学習データを読み込めませんでした。';
 }
 document.getElementById('streakDays').textContent=localStorage.getItem('streakDays')||0;
}
function renderQuiz(){if(!state.curriculum)return;renderGrades();renderSubjects();renderSubjectTextbookPanel();renderQuizTextbookCandidates();renderQuizSelectedMaterials();renderUnits();updateSummary();}
function renderGrades(){const el=document.getElementById('gradeChoices');el.innerHTML='';[1,2,3].forEach(g=>{const b=document.createElement('button');b.className='chip'+(state.grade===g?' selected':'');b.textContent=`中${g}`;b.onclick=()=>{state.grade=g;state.units.clear();state.quizMaterials.clear();renderQuiz()};el.append(b)})}
function renderSubjects(){const el=document.getElementById('subjectChoices');el.innerHTML='';state.curriculum.subjects.forEach(s=>{const b=document.createElement('button');b.className='subject-btn'+(state.subject===s.id?' selected':'');b.innerHTML=`<span>${s.icon}</span><strong>${s.name}</strong>`;b.onclick=()=>{state.subject=s.id;state.units.clear();state.quizMaterials.clear();renderQuiz()};el.append(b)})}
function loadSchoolTextbookPreference(){
 try{const p=JSON.parse(localStorage.getItem('schoolTextbookPreference')||'{}')||{};if(!p.overrides||typeof p.overrides!=='object')p.overrides={};return p}catch{return{district:'',overrides:{}}}
}
function saveSchoolTextbookPreference(pref){if(!pref.overrides||typeof pref.overrides!=='object')pref.overrides={};localStorage.setItem('schoolTextbookPreference',JSON.stringify(pref));}
function migrateTextbookPreference(){
 if(localStorage.getItem('schoolTextbookPreference'))return;
 try{const old=JSON.parse(localStorage.getItem('japaneseTextbookPreference')||'{}');if(old?.district)saveSchoolTextbookPreference({district:old.district});}catch{}
}
function selectedTextbookDistrict(){const id=loadSchoolTextbookPreference().district||'';return state.textbookData?.districts?.find(d=>d.id===id)||null;}
function publisherLabel(id){return state.textbookData?.publishers?.[id]?.name||id||'';}
function fieldIdForUnit(subjectId,unitId){const sub=state.curriculum?.subjects?.find(s=>s.id===subjectId);return sub?.fields?.find(f=>f.units?.some(u=>u.id===unitId))?.id||'';}
function subjectTextbookPart(q){
 if(q?.textbookComponent)return q.textbookComponent;
 const field=q?.field||fieldIdForUnit(q?.subject,q?.unit);
 if(q?.subject==='social'&&['geography','history','civics'].includes(field))return field;
 if(q?.subject==='tech-home'&&['technology','home'].includes(field))return field;
 if(q?.subject==='japanese')return 'language';
 if(q?.subject==='music')return 'general';
 return 'main';
}
function districtAdoption(subjectId){return selectedTextbookDistrict()?.adoptions?.[subjectId]||null;}
function subjectAdoption(subjectId){
 const base={...(districtAdoption(subjectId)||{})};const pref=loadSchoolTextbookPreference();const ov=pref.overrides?.[subjectId]||{};
 Object.entries(ov).forEach(([part,pub])=>{if(pub)base[part]=pub;});return Object.keys(base).length?base:null;
}
function isManualTextbook(subjectId,part){return !!loadSchoolTextbookPreference().overrides?.[subjectId]?.[part];}
function availablePublishersForPart(subjectId,part){
 const ids=new Set();for(const d of state.textbookData?.districts||[]){const v=d.adoptions?.[subjectId]?.[part];if(v)ids.add(v)}
 const current=subjectAdoption(subjectId)?.[part];if(current)ids.add(current);return [...ids].sort((a,b)=>publisherLabel(a).localeCompare(publisherLabel(b),'ja'));
}
function setTextbookOverride(subjectId,part,publisher){
 const pref=loadSchoolTextbookPreference();pref.overrides=pref.overrides||{};pref.overrides[subjectId]=pref.overrides[subjectId]||{};
 if(publisher)pref.overrides[subjectId][part]=publisher;else delete pref.overrides[subjectId][part];
 if(!Object.keys(pref.overrides[subjectId]).length)delete pref.overrides[subjectId];saveSchoolTextbookPreference(pref);
 renderTextbookSettings();renderSubjectTextbookPanel();renderUnits();updateSummary();
}
function clearAllTextbookOverrides(){const pref=loadSchoolTextbookPreference();pref.overrides={};saveSchoolTextbookPreference(pref);renderTextbookSettings();renderSubjectTextbookPanel();renderUnits();updateSummary();}
function matchesSelectedTextbook(q){
 const tagged=q?.textbookPublisher||q?.publisher||'common';
 if(tagged==='common'||!tagged)return true;
 const adoption=subjectAdoption(q?.subject);if(!adoption)return true;
 const selected=adoption[subjectTextbookPart(q)];return !selected||tagged===selected;
}
function textbookSummaryItems(subjectId){
 const data=state.textbookData, adoption=subjectAdoption(subjectId), subject=data?.subjects?.[subjectId];if(!adoption||!subject)return[];
 return Object.entries(adoption).map(([part,publisher])=>({partId:part,part:subject.parts?.[part]||part,publisher,publisherName:publisherLabel(publisher),manual:isManualTextbook(subjectId,part)}));
}
function renderSubjectTextbookPanel(){
 const card=document.getElementById('subjectTextbookCard');if(!card)return;
 const district=selectedTextbookDistrict(), items=state.subject?textbookSummaryItems(state.subject):[];
 card.hidden=!state.subject;if(!state.subject)return;
 const subject=state.textbookData?.subjects?.[state.subject];
 document.getElementById('subjectTextbookTitle').textContent=`${subject?.name||'この教科'}の教科書`;
 const lead=document.getElementById('subjectTextbookLead');
 lead.textContent=district?`${district.name}地区の令和7〜10年度採択結果`:'採択地区を設定すると、この教科の教科書会社を自動表示します。';
 const list=document.getElementById('subjectTextbookList');
 list.innerHTML=items.length?items.map(x=>`<span class="textbook-chip${x.manual?' manual':''}"><small>${escapeHtml(x.part)}</small><strong>${escapeHtml(x.publisherName)}${x.manual?'（手動）':''}</strong></span>`).join(''):'<span class="help">教科書設定がまだありません。</span>';
}
function initSchoolTextbookSettings(){
 const sel=document.getElementById('schoolDistrict');if(!sel||!state.textbookData)return;
 sel.innerHTML='<option value="">採択地区を選択</option>'+state.textbookData.districts.map(d=>`<option value="${d.id}">${d.name}地区</option>`).join('');
 sel.value=loadSchoolTextbookPreference().district||'';
 sel.onchange=()=>{saveSchoolTextbookPreference({district:sel.value||'',overrides:{}});renderTextbookSettings();renderSubjectTextbookPanel();renderUnits();updateSummary();};
}
function openTextbookSettings(){showView('textbookView');initSchoolTextbookSettings();renderTextbookSettings();}
function renderTextbookSettings(){
 const d=selectedTextbookDistrict(), mun=document.getElementById('schoolDistrictMunicipalities'), grid=document.getElementById('allTextbookGrid'), jpHost=document.getElementById('japaneseTextbookHost'), status=document.getElementById('textbookSettingStatus');
 const pref=loadSchoolTextbookPreference();const manualCount=Object.values(pref.overrides||{}).reduce((n,x)=>n+Object.keys(x||{}).length,0);
 if(mun)mun.textContent=d?`対象市町：${d.municipalities.join('・')}`:'静岡県の採択地区を選んでください。手動設定だけでも利用できます。';
 if(status)status.textContent=d?`${d.name}地区を基準に設定中${manualCount?`・手動変更 ${manualCount}件`:''}`:(manualCount?`地区未設定・手動変更 ${manualCount}件`:'地区を選ぶと9教科をまとめて設定します。');
 const reset=document.getElementById('resetTextbookOverrides');if(reset){reset.hidden=!manualCount;reset.onclick=()=>{if(confirm('手動で変更した教科書をすべて地区の自動設定へ戻しますか？'))clearAllTextbookOverrides();};}
 if(!grid||!jpHost)return;
 const renderCard=(sid,sub)=>{
  const base=d?.adoptions?.[sid]||{};const effective=subjectAdoption(sid)||{};const partIds=Object.keys(sub.parts||{});
  const parts=partIds.map(part=>{
   const auto=base[part]||'';const current=effective[part]||'';const manual=isManualTextbook(sid,part);const pubs=availablePublishersForPart(sid,part);
   const autoLabel=auto?`自動（${publisherLabel(auto)}）`:'自動（未設定）';
   const opts=[`<option value="">${escapeHtml(autoLabel)}</option>`].concat(pubs.map(pub=>`<option value="${escapeAttr(pub)}" ${manual&&current===pub?'selected':''}>${escapeHtml(publisherLabel(pub))}</option>`)).join('');
   return `<div class="textbook-part textbook-part-edit"><span>${escapeHtml(sub.parts?.[part]||part)}</span><div><select data-textbook-subject="${sid}" data-textbook-part="${part}">${opts}</select>${manual?'<small class="manual-note">手動設定</small>':''}</div></div>`;
  }).join('');
  return `<article class="textbook-subject-card" data-textbook-card="${sid}"><h3><span>${sub.icon||''}</span>${escapeHtml(sub.name)}</h3>${parts}</article>`;
 };
 const entries=Object.entries(state.textbookData.subjects||{});
 const jp=entries.find(([sid])=>sid==='japanese');
 jpHost.innerHTML=jp?renderCard(jp[0],jp[1]):'';
 grid.innerHTML=entries.filter(([sid])=>sid!=='japanese').map(([sid,sub])=>renderCard(sid,sub)).join('');
 document.querySelectorAll('[data-textbook-subject]').forEach(sel=>{sel.onchange=()=>setTextbookOverride(sel.dataset.textbookSubject,sel.dataset.textbookPart,sel.value);});
}

function loadTextbookStudyRanges(){try{const x=JSON.parse(localStorage.getItem('textbookStudyRanges')||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
function saveTextbookStudyRanges(items){localStorage.setItem('textbookStudyRanges',JSON.stringify(items.slice(-200)));}
function rangePublisher(subjectId){const part=subjectId==='japanese'?'language':'main';return subjectAdoption(subjectId)?.[part]||'';}
function rangeEligibleUnits(subjectId,grade){const sub=state.curriculum?.subjects?.find(s=>s.id===subjectId);const out=[];(sub?.fields||[]).forEach(f=>(f.units||[]).filter(u=>u.grades.includes(Number(grade))).forEach(u=>out.push({key:unitKey(subjectId,f.id,u.id),field:f.name,unit:u.name})));return out;}
function renderTextbookRangeManager(){
 const subjectSel=document.getElementById('rangeSubject'),gradeSel=document.getElementById('rangeGrade');if(!subjectSel||!gradeSel||!state.curriculum)return;
 const sid=subjectSel.value||'japanese',grade=Number(gradeSel.value||2),publisher=rangePublisher(sid);const pub=document.getElementById('rangePublisher');
 if(pub)pub.textContent=publisher?`現在の教科書：${publisherLabel(publisher)} / 中${grade}`:`現在の教科書が未設定です。先に採択地区または手動設定を選んでください。`;
 const choices=document.getElementById('rangeUnitChoices');if(choices){choices.innerHTML='';for(const x of rangeEligibleUnits(sid,grade)){const label=document.createElement('label');label.className='range-unit-item';label.innerHTML=`<input type="checkbox" value="${escapeAttr(x.key)}"><span><strong>${escapeHtml(x.unit)}</strong><small>${escapeHtml(x.field)}</small></span>`;choices.append(label)}}
 const list=document.getElementById('textbookRangeList');if(list){const rows=loadTextbookStudyRanges().filter(x=>x.subject===sid&&Number(x.grade)===grade&&(!publisher||x.publisher===publisher));list.innerHTML=rows.length?rows.map(x=>`<div class="textbook-range-row"><div><strong>${escapeHtml(x.title)}</strong><small>${escapeHtml(publisherLabel(x.publisher))}${x.pages?`・${escapeHtml(x.pages)}`:''}・関連単元 ${x.unitKeys?.length||0}件</small></div><button class="secondary" type="button" data-delete-range="${escapeAttr(x.id)}">削除</button></div>`).join(''):'<p class="help">この教科・学年・教科書の教材プリセットはまだありません。</p>';list.querySelectorAll('[data-delete-range]').forEach(b=>b.onclick=()=>{if(!confirm('この教材 / Unitプリセットを削除しますか？'))return;saveTextbookStudyRanges(loadTextbookStudyRanges().filter(x=>x.id!==b.dataset.deleteRange));});}
}
function saveCurrentTextbookRange(){
 const sid=document.getElementById('rangeSubject')?.value||'',grade=Number(document.getElementById('rangeGrade')?.value||0),title=document.getElementById('rangeTitle')?.value.trim()||'',pages=document.getElementById('rangePages')?.value.trim()||'',publisher=rangePublisher(sid),status=document.getElementById('rangeStatus');
 const unitKeys=[...document.querySelectorAll('#rangeUnitChoices input:checked')].map(x=>x.value);
 if(!publisher){if(status)status.textContent='先にこの教科の教科書会社を設定してください。';return}if(!title){if(status)status.textContent='教材名 / Unit名を入力してください。';return}if(!unitKeys.length){if(status)status.textContent='関連する単元を1つ以上選んでください。';return}
 const items=loadTextbookStudyRanges();items.push({id:`range-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,subject:sid,grade,publisher,title,pages,unitKeys,createdAt:new Date().toISOString()});saveTextbookStudyRanges(items);
 document.getElementById('rangeTitle').value='';document.getElementById('rangePages').value='';if(status)status.textContent='登録しました。小テスト画面から教材名を押して一括選択できます。';
}
function renderTextbookRangeQuickPresets(){
 const card=document.getElementById('textbookRangeQuickCard'),list=document.getElementById('textbookRangeQuickList');if(!card||!list)return;const sid=state.subject;
 if(!['japanese','english'].includes(sid)){card.hidden=true;return}const publisher=rangePublisher(sid);const rows=loadTextbookStudyRanges().filter(x=>x.subject===sid&&Number(x.grade)===Number(state.grade)&&(!publisher||x.publisher===publisher));card.hidden=!rows.length;if(!rows.length){list.innerHTML='';return}
 list.innerHTML=rows.map(x=>`<button class="range-quick-btn" type="button" data-range-id="${escapeAttr(x.id)}"><strong>${escapeHtml(x.title)}</strong><small>${x.pages?`${escapeHtml(x.pages)}・`:''}${x.unitKeys?.length||0}単元</small></button>`).join('');
 list.querySelectorAll('[data-range-id]').forEach(b=>b.onclick=()=>{const r=loadTextbookStudyRanges().find(x=>x.id===b.dataset.rangeId);if(!r)return;state.units.clear();for(const key of r.unitKeys||[]){if(key.startsWith(`${state.subject}/`))state.units.add(key)}renderUnits();updateSummary();document.getElementById('selectionSummary').textContent=`「${r.title}」の関連単元を選択しました。`;});
}
function currentQuizCandidateRows(){
 const sid=state.subject;if(!['japanese','english'].includes(sid))return[];
 return textbookCandidateRows(sid,rangePublisher(sid),state.grade,Number(state.quizTextbookYear||2026));
}
function renderQuizSelectedMaterials(){
 const card=document.getElementById('quizSelectedMaterialsCard'),host=document.getElementById('quizSelectedMaterials');if(!card||!host)return;
 const rows=currentQuizCandidateRows().filter(r=>state.quizMaterials.has(r.id));
 card.hidden=!rows.length;host.innerHTML='';
 rows.forEach(r=>{const item=document.createElement('div');item.className='selected-material-item';item.innerHTML=`<span><strong>${escapeHtml(r.title)}</strong><small>${escapeHtml(publisherLabel(rangePublisher(state.subject)))}・中${state.grade}${r.pages?`・${escapeHtml(r.pages)}`:''}</small></span><button type="button" class="secondary" data-remove-material="${escapeAttr(r.id)}">解除</button>`;host.append(item);});
 host.querySelectorAll('[data-remove-material]').forEach(b=>b.onclick=()=>toggleQuizMaterial(b.dataset.removeMaterial,false));
}
function toggleQuizMaterial(id,forceAdd=null){
 const rows=currentQuizCandidateRows(),r=rows.find(x=>x.id===id);if(!r)return;
 const shouldAdd=forceAdd===null?!state.quizMaterials.has(id):!!forceAdd;
 if(shouldAdd){state.quizMaterials.add(id);for(const k of r.unitKeys||[])if(k.startsWith(`${state.subject}/`))state.units.add(k);}
 else{state.quizMaterials.delete(id);const protectedKeys=new Set(rows.filter(x=>state.quizMaterials.has(x.id)).flatMap(x=>x.unitKeys||[]));for(const k of r.unitKeys||[])if(!protectedKeys.has(k))state.units.delete(k);}
 renderQuizTextbookCandidates();renderQuizSelectedMaterials();renderUnits();updateSummary();
}
function materialTitleById(id){
 for(const sid of ['japanese','english'])for(const [pub] of Object.entries(TEXTBOOK_CANDIDATES[sid]||{}))for(const g of [1,2,3]){const row=textbookCandidateRows(sid,pub,g,2026).find(x=>x.id===id);if(row)return row.title;}
 return id;
}
function questionMaterialIds(q){
 const raw=Array.isArray(q?.materialIds)?q.materialIds:(q?.materialId?[q.materialId]:[]);
 return [...new Set(raw.filter(Boolean).map(String))];
}
function questionMatchesMaterials(q,materialIds){
 const selected=materialIds instanceof Set?materialIds:new Set(materialIds||[]);
 const tagged=questionMaterialIds(q);
 if(!tagged.length)return true;
 if(!selected.size)return false;
 return tagged.some(id=>selected.has(id));
}
function materialPriorityOrder(pool,materialIds){
 const selected=materialIds instanceof Set?materialIds:new Set(materialIds||[]);
 if(!selected.size)return smartQuestionOrder(pool.filter(q=>questionMaterialIds(q).length===0));
 const dedicated=pool.filter(q=>questionMaterialIds(q).some(id=>selected.has(id)));
 const common=pool.filter(q=>questionMaterialIds(q).length===0);
 return [...smartQuestionOrder(dedicated),...smartQuestionOrder(common)];
}
function pickQuestionsForMaterials(pool,count,materialIds){
 const ordered=materialPriorityOrder(pool,materialIds);
 return count==='all'?ordered:ordered.slice(0,Math.min(Number(count)||0,ordered.length));
}
function materialRowsFor(subject,grade,publisher,year=2026){
 if(!['japanese','english'].includes(subject)||!publisher)return[];
 return textbookCandidateRows(subject,publisher,Number(grade),Number(year)||2026);
}
function materialOptionsHtml(subject,grade,publisher,selected=''){
 const rows=materialRowsFor(subject,grade,publisher,2026);
 return '<option value="">教材 / Unitを指定しない</option>'+rows.map(r=>`<option value="${escapeAttr(r.id)}" ${r.id===selected?'selected':''}>${escapeHtml(r.title)}</option>`).join('');
}
function renderQuizTextbookCandidates(){
 const card=document.getElementById('quizTextbookCandidateCard'),host=document.getElementById('quizTextbookCandidates'),yearSel=document.getElementById('quizTextbookYear');
 if(!card||!host)return;
 const sid=state.subject;
 if(!['japanese','english'].includes(sid)){card.hidden=true;host.innerHTML='';return;}
 card.hidden=false;
 const year=Number(state.quizTextbookYear||2026);if(yearSel)yearSel.value=String(year);
 const publisher=rangePublisher(sid);const sub=state.curriculum?.subjects?.find(x=>x.id===sid);const rows=textbookCandidateRows(sid,publisher,state.grade,year);
 host.innerHTML='';
 const block=document.createElement('article');block.className='exam-textbook-candidate-card';
 const yearLabel=`令和${year-2018}年度`;const pubName=publisher?publisherLabel(publisher):'未設定';
 block.innerHTML=`<div class="exam-textbook-candidate-head"><div><strong>${sub?.icon||''} ${sub?.name||sid}</strong><small>${yearLabel}・${escapeHtml(pubName)}・中${state.grade}</small></div></div><div class="exam-textbook-candidate-list"></div>`;
 const list=block.querySelector('.exam-textbook-candidate-list');
 if(!publisher){list.innerHTML='<p class="help">教科書会社が未設定です。先に「教科書設定」で採択地区または出版社を設定してください。</p>';}
 else if(!rows.length){list.innerHTML='<p class="help">この年度・出版社・学年の候補データはまだありません。下の分野・単元から選択できます。</p>';}
 else rows.forEach(r=>{
   const selected=state.quizMaterials.has(r.id);
   const b=document.createElement('button');b.type='button';b.className='exam-material-btn'+(selected?' selected':'');
   b.innerHTML=`<strong>${escapeHtml(r.title)}</strong><small>${r.pages?`${escapeHtml(r.pages)}・`:''}${selected?'選択済み・もう一度押すと解除':'範囲に追加'}</small>`;
   b.onclick=()=>{toggleQuizMaterial(r.id);document.getElementById('selectionSummary').textContent=selected?`「${r.title}」を教材範囲から解除しました。`:`「${r.title}」を教材範囲に追加しました。`;};
   list.append(b);
 });
 host.append(block);
}
document.getElementById('quizTextbookYear')?.addEventListener('change',e=>{state.quizTextbookYear=Number(e.target.value||2026);state.quizMaterials.clear();renderQuizTextbookCandidates();renderQuizSelectedMaterials();updateSummary();});

function unitKey(subjectId,fieldId,unitId){return `${subjectId}/${fieldId}/${unitId}`}
function renderUnits(){
 const el=document.getElementById('unitChoices');el.innerHTML='';
 if(!state.subject){el.innerHTML='<p class="help">先に教科を選んでください。</p>';return}
 const subject=state.curriculum.subjects.find(s=>s.id===state.subject);
 const q=(document.getElementById('unitSearch')?.value||'').trim().toLowerCase();
 subject.fields.forEach(f=>{
   const fieldUnits=f.units.filter(u=>u.grades.includes(state.grade));
   if(!fieldUnits.length)return;
   const visibleUnits=fieldUnits.filter(u=>{const label=`${f.name} ${u.name} ${(u.topics||[]).join(' ')}`;return !q||label.toLowerCase().includes(q)});
   if(!visibleUnits.length)return;
   const group=document.createElement('div');group.className='unit-group';
   const head=document.createElement('div');head.className='unit-group-head';
   const title=document.createElement('h4');title.textContent=f.name;head.append(title);
   const fieldKeys=visibleUnits.map(u=>unitKey(subject.id,f.id,u.id));
   const allSelected=fieldKeys.every(k=>state.units.has(k));
   const bulk=document.createElement('button');bulk.type='button';bulk.className='unit-bulk-btn';bulk.textContent=allSelected?'この分野をすべて解除':'この分野をすべて選択';
   bulk.onclick=()=>{if(allSelected)fieldKeys.forEach(k=>state.units.delete(k));else fieldKeys.forEach(k=>state.units.add(k));renderUnits();updateSummary();};
   head.append(bulk);group.append(head);
   visibleUnits.forEach(u=>{
     const key=unitKey(subject.id,f.id,u.id);
     const available=state.questionBank.filter(x=>x.subject===subject.id&&x.unit===u.id&&x.grades.includes(state.grade)&&matchesSelectedTextbook(x)).length;
     const row=document.createElement('label');row.className='unit-item';
     row.innerHTML=`<input type="checkbox" ${state.units.has(key)?'checked':''}><span><strong>${u.name}</strong><small>${(u.topics||[]).join('・')}</small><em>${available?`${available}問収録`:'問題追加予定'}</em></span>`;
     row.querySelector('input').onchange=e=>{e.target.checked?state.units.add(key):state.units.delete(key);renderUnits();updateSummary()};group.append(row);
   });
   el.append(group);
 });
 if(!el.children.length)el.innerHTML='<p class="help">検索条件に一致する単元がありません。</p>';
}
function selectedUnitIds(){return [...state.units].map(k=>k.split('/')[2]);}
function availableQuestions(){
 if(!state.subject)return[];
 const ids=new Set(selectedUnitIds());
 return state.questionBank.filter(q=>q.subject===state.subject&&ids.has(q.unit)&&q.grades.includes(state.grade)&&matchesSelectedTextbook(q)&&questionMatchesMaterials(q,state.quizMaterials));
}

function questionDifficulty(q){const d=Number(q?.difficulty)||1;return Math.max(1,Math.min(3,d));}
function difficultyLabel(q){return({1:'基礎',2:'標準',3:'応用'})[questionDifficulty(q)]||'基礎';}
function questionAttemptStats(){
 const map=new Map();
 for(const h of studyHistory()){
  for(const a of h.answerResults||[]){
   const x=map.get(a.questionId)||{attempts:0,correct:0,lastAt:null};
   x.attempts++;if(a.correct)x.correct++;const at=a.answeredAt||h.at;if(at&&(!x.lastAt||new Date(at)>new Date(x.lastAt)))x.lastAt=at;map.set(a.questionId,x);
  }
 }
 return map;
}
function unitAccuracyMap(){
 const qmap=new Map(state.questionBank.map(q=>[q.id,q])),groups=new Map();
 for(const h of studyHistory())for(const a of h.answerResults||[]){const q=qmap.get(a.questionId);if(!q)continue;const key=`${q.subject}/${q.unit}`;const x=groups.get(key)||{total:0,correct:0};x.total++;if(a.correct)x.correct++;groups.set(key,x);}
 const out=new Map();for(const [k,x] of groups)out.set(k,x.total?x.correct/x.total:null);return out;
}
function smartQuestionOrder(pool){
 const attempts=questionAttemptStats(), mastery=unitAccuracyMap();
 const missed=new Map((JSON.parse(localStorage.getItem('missedQuestions')||'[]')||[]).map(x=>[x.questionId,x]));
 const now=Date.now();
 return [...pool].map(q=>{
  const st=attempts.get(q.id)||{attempts:0,correct:0,lastAt:null};const acc=mastery.get(`${q.subject}/${q.unit}`);
  const target=acc==null?1:acc<0.6?1:acc<0.8?2:3;const diff=questionDifficulty(q);
  let score=0;
  if(missed.has(q.id))score+=58+Math.min(12,(missed.get(q.id).count||1)*2);
  if(!st.attempts)score+=42;
  score+=Math.max(0,14-Math.abs(diff-target)*7);
  if(st.lastAt){const days=Math.max(0,(now-new Date(st.lastAt).getTime())/86400000);score+=Math.min(18,days);if(days<1)score-=38;else if(days<3)score-=20;else if(days<7)score-=8;}
  score-=Math.min(12,st.attempts*2);
  score+=Math.random()*5;
  return{q,score};
 }).sort((a,b)=>b.score-a.score).map(x=>x.q);
}
function pickSmartQuestions(pool,count){const ordered=smartQuestionOrder(pool);return count==='all'?ordered:ordered.slice(0,Math.min(Number(count)||0,ordered.length));}
function updateSummary(){
 const s=state.curriculum?.subjects.find(x=>x.id===state.subject);const n=availableQuestions().length;
 const district=selectedTextbookDistrict();const book=district?`・${district.name}地区`:'';const mats=[...state.quizMaterials].map(materialTitleById);const matText=mats.length?`・教材/Unit ${mats.length}件（${mats.map(x=>`「${x}」`).join('、')}）`:'';document.getElementById('selectionSummary').textContent=s?`中${state.grade}・${s.name}${book}・${state.units.size}単元${matText} / 現在${n}問出題可能`:'学年・教科・単元を選んでください。';
}
document.getElementById('unitSearch').addEventListener('input',renderUnits);
document.getElementById('countChoices').addEventListener('click',e=>{const b=e.target.closest('[data-count]');if(!b)return;document.querySelectorAll('[data-count]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');state.count=b.dataset.count==='all'?'all':Number(b.dataset.count);updateSummary()});
document.getElementById('startQuiz').onclick=()=>{
 if(!state.subject||!state.units.size){alert('教科と単元を選んでください。');return}
 const pool=availableQuestions();if(!pool.length){alert('選んだ単元には、まだ問題が登録されていません。別の単元を選ぶか、紙テストから問題を追加してください。');return}
 const limit=state.count==='all'?'all':Math.min(state.count,pool.length);
 state.session=pickQuestionsForMaterials(pool,limit,state.quizMaterials);state.index=0;state.score=0;state.answers=[];state.sessionContext={mode:'quiz',materials:[...state.quizMaterials],textbookYear:state.quizTextbookYear};
 localStorage.setItem('lastQuizSelection',JSON.stringify({grade:state.grade,subject:state.subject,units:[...state.units],count:state.count,textbookYear:state.quizTextbookYear,materials:[...state.quizMaterials]}));
 showView('playView');renderQuestion();
};

function materialRowById(id){
 for(const sid of ['japanese','english'])for(const [pub] of Object.entries(TEXTBOOK_CANDIDATES[sid]||{}))for(const g of [1,2,3]){const row=textbookCandidateRows(sid,pub,g,2026).find(x=>x.id===id);if(row)return row;}
 return null;
}
function unitReferenceForQuestion(q){
 if(!['social','science'].includes(q?.subject))return null;
 const field=q.field||fieldIdForUnit(q.subject,q.unit);if(!field)return null;
 const adoption=subjectAdoption(q.subject);const part=subjectTextbookPart({...q,field});const publisher=adoption?.[part]||'';if(!publisher)return null;
 const pages=textbookUnitPageRange(q.subject,publisher,field,q.unit);if(!pages)return null;
 const sub=state.curriculum?.subjects?.find(s=>s.id===q.subject);const unit=sub?.fields?.find(f=>f.id===field)?.units?.find(u=>u.id===q.unit);
 return{id:`unit-ref-${q.subject}-${field}-${q.unit}`,subject:q.subject,publisher,grade:Number(state.grade||q.grades?.[0]||0),title:unit?.name||q.unit,pages,unitKeys:[unitKey(q.subject,field,q.unit)]};
}
function referenceMaterialsForQuestion(q){
 const direct=questionMaterialIds(q).map(materialRowById).filter(Boolean);
 if(direct.length)return direct;
 const selected=(state.sessionContext?.materials||[]).map(materialRowById).filter(Boolean);
 if(selected.length){
  const field=q.field||fieldIdForUnit(q.subject,q.unit);const key=unitKey(q.subject,field,q.unit);
  const matched=selected.filter(r=>r.subject===q.subject&&Number(r.grade)===Number(q.grades?.[0]||state.grade)&&((r.unitKeys||[]).includes(key)));
  if(matched.length)return matched;
 }
 const unitRef=unitReferenceForQuestion(q);return unitRef?[unitRef]:[];
}
function renderReferencePages(q){
 const box=document.getElementById('referencePageBox');if(!box)return;
 const rows=referenceMaterialsForQuestion(q);if(!rows.length){box.hidden=true;box.innerHTML='';return;}
 const items=rows.slice(0,3).map(r=>`<div><strong>📖 ${escapeHtml(r.title)}</strong><span>${escapeHtml(publisherLabel(r.publisher))}・中${r.grade}${r.pages?`・${escapeHtml(r.pages)}`:'・ページ情報未登録'}</span></div>`).join('');
 box.innerHTML=`<p>教科書参照</p>${items}`;box.hidden=false;
}
function renderQuestion(){
 if(state.sessionContext?.mode==='mockExam'){renderMockExamQuestion();return;}
 const q=state.session[state.index];if(!q){finishQuiz();return}
 const s=state.curriculum.subjects.find(x=>x.id===q.subject);
 document.getElementById('quizProgress').textContent=`${state.index+1} / ${state.session.length}`;
 document.getElementById('quizSubject').textContent=`${s?.icon||''} ${s?.name||''} ・ ${difficultyLabel(q)}`;
 renderReferencePages(q);
 document.getElementById('questionText').textContent=q.question;
 document.getElementById('answerArea').innerHTML='';document.getElementById('feedback').hidden=true;document.getElementById('nextQuestion').hidden=true;document.getElementById('dontKnow').disabled=false;
 const area=document.getElementById('answerArea');
 if(q.type==='choice'){
   (q.choices||[]).forEach((c,i)=>{const b=document.createElement('button');b.className='answer-btn';b.textContent=c;b.onclick=()=>gradeChoiceAnswer(i,b);area.append(b)});
 }else if(q.type==='multi'){
   renderMultiAnswer(area,q,false);
 }else if(q.type==='reorder'){
   renderReorderAnswer(area,q,false);
 }else if(q.type==='fill'){
   renderFillAnswer(area,q,false);
 }else if(q.type==='word'){
   const input=document.createElement('input');input.type='text';input.className='answer-input';input.placeholder='答えを入力';input.autocomplete='off';
   const submit=document.createElement('button');submit.className='primary';submit.type='button';submit.textContent='答える';submit.onclick=()=>gradeWordAnswer(input.value);
   input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();submit.click()}});area.append(input,submit);setTimeout(()=>input.focus(),0);
 }else if(q.type==='text'){
   const ta=document.createElement('textarea');ta.rows=5;ta.className='answer-textarea';ta.placeholder='文章で答えを書いてください。';
   const check=document.createElement('button');check.className='primary';check.type='button';check.textContent='模範解答を確認';check.onclick=()=>showTextSelfCheck(ta.value);area.append(ta,check);
 }else{
   area.innerHTML='<p class="help">この問題形式にはまだ対応していません。</p>';
 }
}
function finishAnswer(correct,dontKnow=false,answerLabel=''){
 const q=state.session[state.index];if(correct)state.score++;
 state.answers.push({questionId:q.id,correct,dontKnow,answeredAt:new Date().toISOString()});
 document.getElementById('dontKnow').disabled=true;
 const fb=document.getElementById('feedback');fb.hidden=false;fb.className='feedback '+(correct?'ok':'ng');
 const label=answerLabel||formatCorrectAnswer(q);fb.innerHTML=`<strong>${correct?'正解！':'復習しよう'}</strong><p>答え：${escapeHtml(label)}</p><p>${escapeHtml(q.explanation||'')}</p>`;appendAiExplanationControl(fb,q);
 document.getElementById('nextQuestion').hidden=false;if(!correct)saveMissed(q,dontKnow);
}
function formatCorrectAnswer(q){
 if(q.type==='choice')return q.choices?.[q.answer]??'';
 if(q.type==='multi')return (q.answers||[]).map(i=>q.choices?.[i]).filter(Boolean).join(' / ');
 if(q.type==='reorder')return reorderCorrectText(q);
 if(q.type==='fill')return (q.blanks||[]).map((a,i)=>`（${i+1}）${(Array.isArray(a)?a:[a]).filter(Boolean).join(' / ')}`).join('　');
 if(q.type==='word')return acceptedTextAnswers(q).join(' / ');
 return q.modelAnswer||q.answerText||'';
}
function renderAiExplanation(target,text){
 target.replaceChildren();
 const normalized=String(text||'').replace(/\r\n?/g,'\n').trim();
 if(!normalized){target.textContent='AI解説を取得できませんでした。';return;}
 const lines=normalized.split('\n');
 let list=null;
 for(const raw of lines){
  const line=raw.trim();
  if(!line){list=null;continue;}
  if(/^【[^】]+】$/.test(line)){
   list=null;const h=document.createElement('h4');h.className='ai-section-title';h.textContent=line;target.append(h);continue;
  }
  if(/^[・•-]\s*/.test(line)){
   if(!list){list=document.createElement('ul');list.className='ai-bullet-list';target.append(list)}
   const li=document.createElement('li');li.textContent=line.replace(/^[・•-]\s*/,'');list.append(li);continue;
  }
  list=null;const p=document.createElement('p');p.textContent=line;target.append(p);
 }
}
function appendAiExplanationControl(host,q){
 const wrap=document.createElement('div');wrap.className='ai-explain-box';
 const btn=document.createElement('button');btn.type='button';btn.className='secondary ai-explain-btn';btn.textContent='✨ AIで詳しく解説';
 const note=document.createElement('p');note.className='ai-privacy-note';note.textContent='押したときだけ、問題文と正解をCloudflare Workers AIへ送信します。氏名・テスト名・学習履歴は送信しません。';
 const out=document.createElement('div');out.className='ai-explain-result';out.hidden=true;
 btn.onclick=async()=>{
  btn.disabled=true;btn.textContent='AIが考えています…';out.hidden=false;out.textContent='解説を作成しています。';
  try{
   const subject=state.curriculum?.subjects.find(x=>x.id===q.subject)?.name||'';
   const payload={grade:Number(q.grades?.[0]||state.grade||2),subject,question:String(q.question||'').slice(0,1200),answer:String(formatCorrectAnswer(q)||'').slice(0,800),choices:Array.isArray(q.choices)?q.choices.slice(0,8).map(x=>String(x).slice(0,300)):(Array.isArray(q.items)?q.items.slice(0,12).map(x=>String(x).slice(0,200)):[])};
   const res=await fetch('/api/explain',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
   const data=await res.json().catch(()=>({}));
   if(!res.ok)throw new Error(data.error||`HTTP ${res.status}`);
   renderAiExplanation(out,data.explanation||'AI解説を取得できませんでした。');
   btn.textContent='AI解説を更新';btn.disabled=false;
  }catch(err){
   console.error(err);out.textContent='AI解説を取得できませんでした。通常の解説を利用してください。';btn.textContent='もう一度試す';btn.disabled=false;
  }
 };
 wrap.append(btn,note,out);host.append(wrap);
}

function reorderCorrectText(q){const items=q.items||[];const order=Array.isArray(q.answerOrder)&&q.answerOrder.length?q.answerOrder:items.map((_,i)=>i);return order.map(i=>items[i]).filter(x=>x!=null).join(' ').replace(/\s+([.,!?;:])/g,'$1');}
function renderMultiAnswer(area,q,mock=false){
 const selected=new Set();const note=document.createElement('p');note.className='answer-instruction';note.textContent='正しいものをすべて選んでください。';area.append(note);
 const list=document.createElement('div');list.className='multi-choice-list';
 (q.choices||[]).forEach((c,i)=>{const label=document.createElement('label');label.className='multi-choice-item';const input=document.createElement('input');input.type='checkbox';input.value=String(i);const span=document.createElement('span');span.textContent=c;input.onchange=()=>{input.checked?selected.add(i):selected.delete(i)};label.append(input,span);list.append(label)});area.append(list);
 const submit=document.createElement('button');submit.className='primary wide';submit.type='button';submit.textContent=mock?'解答して次へ':'答える';submit.onclick=()=>mock?submitMockAnswer({multi:[...selected],answerLabel:[...selected].map(i=>q.choices?.[i]).join(' / ')}):gradeMultiAnswer([...selected]);area.append(submit);
}
function renderReorderAnswer(area,q,mock=false){
 const answer=[];const note=document.createElement('p');note.className='answer-instruction';note.textContent='語句を正しい順番に並べてください。';const built=document.createElement('div');built.className='reorder-built';built.setAttribute('aria-live','polite');const pool=document.createElement('div');pool.className='reorder-pool';const tokens=(q.items||[]).map((text,i)=>({text,i})).sort(()=>Math.random()-.5);
 const refresh=()=>{built.innerHTML='';answer.forEach((idx,pos)=>{const b=document.createElement('button');b.type='button';b.className='reorder-token selected';b.textContent=q.items[idx];b.title='押すと戻します';b.onclick=()=>{answer.splice(pos,1);refresh()};built.append(b)});pool.innerHTML='';tokens.filter(t=>!answer.includes(t.i)).forEach(t=>{const b=document.createElement('button');b.type='button';b.className='reorder-token';b.textContent=t.text;b.onclick=()=>{answer.push(t.i);refresh()};pool.append(b)});if(!answer.length)built.innerHTML='<span class="reorder-placeholder">ここに並べた答えが表示されます</span>';};
 area.append(note,built,pool);refresh();const actions=document.createElement('div');actions.className='reorder-actions';const reset=document.createElement('button');reset.type='button';reset.className='secondary';reset.textContent='やり直す';reset.onclick=()=>{answer.splice(0);refresh()};const submit=document.createElement('button');submit.type='button';submit.className='primary';submit.textContent=mock?'解答して次へ':'答える';submit.onclick=()=>mock?submitMockAnswer({order:[...answer],answerLabel:answer.map(i=>q.items?.[i]).join(' ')}):gradeReorderAnswer([...answer]);actions.append(reset,submit);area.append(actions);
}
function renderFillAnswer(area,q,mock=false){
 const blanks=(q.blanks||[]).map(a=>Array.isArray(a)?a:[a]);const note=document.createElement('p');note.className='answer-instruction';note.textContent=blanks.length>1?'空欄ごとに答えを入力してください。':'空欄に入る答えを入力してください。';area.append(note);const inputs=[];
 blanks.forEach((_,i)=>{const label=document.createElement('label');label.className='fill-label';label.innerHTML=`<span>（${i+1}）</span>`;const input=document.createElement('input');input.type='text';input.className='answer-input';input.placeholder=`空欄 ${i+1}`;input.autocomplete='off';label.append(input);area.append(label);inputs.push(input)});
 const submit=document.createElement('button');submit.className='primary wide';submit.type='button';submit.textContent=mock?'解答して次へ':'答える';submit.onclick=()=>{const values=inputs.map(x=>x.value);mock?submitMockAnswer({fills:values,answerLabel:values.join(' / ')}):gradeFillAnswer(values)};inputs.forEach(inp=>inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&inputs.length===1){e.preventDefault();submit.click()}}));area.append(submit);setTimeout(()=>inputs[0]?.focus(),0);
}
function gradeMultiAnswer(values,dontKnow=false){const q=state.session[state.index];const a=[...(q.answers||[])].map(Number).sort((x,y)=>x-y),b=[...values].map(Number).sort((x,y)=>x-y);const correct=!dontKnow&&a.length===b.length&&a.every((x,i)=>x===b[i]);document.querySelectorAll('#answerArea input,#answerArea button').forEach(x=>x.disabled=true);finishAnswer(correct,dontKnow);}
function gradeReorderAnswer(values,dontKnow=false){const q=state.session[state.index];const a=Array.isArray(q.answerOrder)&&q.answerOrder.length?q.answerOrder:(q.items||[]).map((_,i)=>i);const correct=!dontKnow&&a.length===values.length&&a.every((x,i)=>Number(x)===Number(values[i]));document.querySelectorAll('#answerArea button').forEach(x=>x.disabled=true);finishAnswer(correct,dontKnow);}
function gradeFillAnswer(values,dontKnow=false){const q=state.session[state.index];const blanks=q.blanks||[];const correct=!dontKnow&&blanks.length===values.length&&blanks.every((a,i)=>(Array.isArray(a)?a:[a]).filter(Boolean).some(v=>normalizeText(v)===normalizeText(values[i])));document.querySelectorAll('#answerArea input,#answerArea button').forEach(x=>x.disabled=true);finishAnswer(correct,dontKnow);}
function gradeChoiceAnswer(answer,button=null,dontKnow=false){const q=state.session[state.index];const correct=!dontKnow&&answer===q.answer;document.querySelectorAll('.answer-btn').forEach((b,i)=>{b.disabled=true;if(i===q.answer)b.classList.add('correct');if(button===b&&!correct)b.classList.add('wrong')});finishAnswer(correct,dontKnow);}
function gradeWordAnswer(value,dontKnow=false){const q=state.session[state.index];const correct=!dontKnow&&acceptedTextAnswers(q).some(a=>normalizeText(a)===normalizeText(value));document.querySelectorAll('#answerArea input,#answerArea button').forEach(x=>x.disabled=true);finishAnswer(correct,dontKnow);}
function showTextSelfCheck(userText){const q=state.session[state.index];document.querySelectorAll('#answerArea textarea,#answerArea button').forEach(x=>x.disabled=true);document.getElementById('dontKnow').disabled=true;const fb=document.getElementById('feedback');fb.hidden=false;fb.className='feedback';fb.innerHTML=`<strong>模範解答</strong><p>${escapeHtml(q.modelAnswer||q.answerText||'')}</p><p>${escapeHtml(q.explanation||'')}</p><p class="help">自分の答えと比べて判定してください。</p><div class="self-check-row"><button id="selfOk" class="primary" type="button">できた</button><button id="selfNg" class="secondary" type="button">できなかった</button></div>`;appendAiExplanationControl(fb,q);document.getElementById('selfOk').onclick=()=>{fb.querySelector('.self-check-row').remove();finishAnswer(true,false)};document.getElementById('selfNg').onclick=()=>{fb.querySelector('.self-check-row').remove();finishAnswer(false,false)};}
function gradeAnswer(answer,button=null,dontKnow=false){const q=state.session[state.index];if(q.type==='choice')gradeChoiceAnswer(answer,button,dontKnow);else if(q.type==='multi')gradeMultiAnswer([],dontKnow);else if(q.type==='reorder')gradeReorderAnswer([],dontKnow);else if(q.type==='fill')gradeFillAnswer([],dontKnow);else if(q.type==='word')gradeWordAnswer('',dontKnow);else finishAnswer(false,true);}
function saveMissed(q,dontKnow){const arr=JSON.parse(localStorage.getItem('missedQuestions')||'[]');const old=arr.find(x=>x.questionId===q.id);if(old){old.count=(old.count||1)+1;old.lastAt=new Date().toISOString();old.dontKnow=old.dontKnow||dontKnow}else arr.push({questionId:q.id,count:1,lastAt:new Date().toISOString(),dontKnow});localStorage.setItem('missedQuestions',JSON.stringify(arr));}
document.getElementById('dontKnow').onclick=()=>{if(state.sessionContext?.mode==='mockExam')submitMockAnswer({dontKnow:true});else gradeAnswer(null,null,true)};
document.getElementById('nextQuestion').onclick=()=>{state.index++;renderQuestion()};
document.getElementById('quitQuiz').onclick=()=>{const label=state.sessionContext?.mode==='mockExam'?'模擬テスト':'小テスト';if(confirm(`この${label}を終了しますか？`))goHome()};
function finishQuiz(){
 if(state.sessionContext?.mode==='mockExam'){finishMockExam(false);return;}
 document.getElementById('mockResultDetails').hidden=true;
 document.getElementById('resultEyebrow').textContent=state.sessionContext?.mode==='mockReview'?'模擬テスト復習完了':'小テスト完了';document.getElementById('retryQuiz').textContent='もう一度挑戦';document.getElementById('backHomeResult').textContent='ホームへ戻る';
 const total=state.session.length;const rate=total?Math.round(state.score/total*100):0;
 document.getElementById('resultScore').textContent=`${state.score} / ${total}`;document.getElementById('resultRate').textContent=`正答率 ${rate}%`;
 const history=JSON.parse(localStorage.getItem('studyHistory')||'[]');history.push({at:new Date().toISOString(),grade:state.grade,subject:state.subject,total,score:state.score,rate,mode:state.sessionContext?.mode||'quiz',examId:state.sessionContext?.examId||null,materials:state.sessionContext?.materials||[],textbookYear:state.sessionContext?.textbookYear||null,questionIds:state.session.map(q=>q.id),answerResults:state.answers.map(a=>({questionId:a.questionId,correct:!!a.correct,dontKnow:!!a.dontKnow,answeredAt:a.answeredAt}))});localStorage.setItem('studyHistory',JSON.stringify(history.slice(-300)));
 if(state.sessionContext?.examId){const logs=loadExamStudyLogs();logs.push({id:crypto.randomUUID?.()||String(Date.now()),examId:state.sessionContext.examId,at:new Date().toISOString(),questionIds:state.session.map(q=>q.id),score:state.score,total,rate});localStorage.setItem('examStudyLogs',JSON.stringify(logs.slice(-300)));}
 updateStreak();showView('resultView');
}
function updateStreak(){const today=new Date().toISOString().slice(0,10);const last=localStorage.getItem('lastStudyDate');let streak=Number(localStorage.getItem('streakDays')||0);if(last!==today){const y=new Date();y.setDate(y.getDate()-1);streak=last===y.toISOString().slice(0,10)?streak+1:1;localStorage.setItem('lastStudyDate',today);localStorage.setItem('streakDays',streak)}document.getElementById('streakDays').textContent=streak;renderDailyPlanPreview();}
document.getElementById('backHomeResult').onclick=()=>{if(state.sessionContext?.mode==='mockExamHistory'){openStats();return;}goHome();};
document.getElementById('retryQuiz').onclick=()=>{if(state.sessionContext?.mode==='mockExam'||state.sessionContext?.mode==='mockExamHistory'){const id=state.sessionContext?.resultId||state.mockExam.lastResultId;if(id){startMockExamRetry(id);return;}openMockExamSetup(state.sessionContext?.examId);return;}state.index=0;state.score=0;state.answers=[];state.session=[...state.session].sort(()=>Math.random()-.5);showView('playView');renderQuestion()};
function loadCustomQuestions(){
 try{return JSON.parse(localStorage.getItem('customQuestions')||'[]')}catch{return []}
}
function saveCustomQuestions(items){localStorage.setItem('customQuestions',JSON.stringify(items));refreshQuestionBank();}
function refreshQuestionBank(){state.questionBank=[...state.builtInQuestions,...loadCustomQuestions()];}
function normalizeText(v){return String(v??'').normalize('NFKC').trim().replace(/\s+/g,'').toLowerCase();}
function acceptedTextAnswers(q){return (q.answers?.length?q.answers:[q.answerText]).filter(Boolean);}
function getMissedPool(){
 const missed=JSON.parse(localStorage.getItem('missedQuestions')||'[]');
 const ids=new Set(missed.map(x=>x.questionId));
 return state.questionBank.filter(q=>ids.has(q.id));
}
function openReview(){
 if(!getMissedPool().length){alert('まだ復習する問題はありません。小テストで間違えた問題がここにたまります。');return}
 state.review.units.clear();showView('reviewView');renderReviewFilters();
}
function renderReviewFilters(){
 const pool=getMissedPool();
 const ge=document.getElementById('reviewGradeChoices');ge.innerHTML='';
 ['all',1,2,3].forEach(g=>{const b=document.createElement('button');b.className='chip'+(state.review.grade===g?' selected':'');b.textContent=g==='all'?'すべて':`中${g}`;b.onclick=()=>{state.review.grade=g;state.review.subject='all';state.review.field='';state.review.units.clear();renderReviewFilters()};ge.append(b)});
 const byGrade=pool.filter(q=>state.review.grade==='all'||q.grades.includes(state.review.grade));
 const se=document.getElementById('reviewSubjectChoices');se.innerHTML='';
 const all=document.createElement('button');all.className='subject-btn'+(state.review.subject==='all'?' selected':'');all.innerHTML='<span>📚</span><strong>すべて</strong>';all.onclick=()=>{state.review.subject='all';state.review.field='';state.review.units.clear();renderReviewFilters()};se.append(all);
 state.curriculum.subjects.filter(sub=>byGrade.some(q=>q.subject===sub.id)).forEach(sub=>{const b=document.createElement('button');b.className='subject-btn'+(state.review.subject===sub.id?' selected':'');b.innerHTML=`<span>${sub.icon}</span><strong>${sub.name}</strong>`;b.onclick=()=>{state.review.subject=sub.id;state.review.field='';state.review.units.clear();renderReviewFilters()};se.append(b)});
 renderReviewFieldAndUnits();updateReviewSummary();
}
function renderReviewFieldAndUnits(){
 const fs=document.getElementById('reviewField');fs.innerHTML='<option value="">すべての分野</option>';
 const ue=document.getElementById('reviewUnitChoices');ue.innerHTML='';
 if(state.review.subject==='all'){ue.innerHTML='<p class="help">教科を選ぶと、分野・単元でも絞れます。</p>';return}
 const sub=state.curriculum.subjects.find(s=>s.id===state.review.subject);if(!sub)return;
 const relevantFields=sub.fields.filter(f=>f.units.some(u=>getMissedPool().some(q=>q.subject===sub.id&&q.unit===u.id&&(state.review.grade==='all'||q.grades.includes(state.review.grade)))));
 relevantFields.forEach(f=>{const o=document.createElement('option');o.value=f.id;o.textContent=f.name;fs.append(o)});fs.value=state.review.field;
 const fields=state.review.field?relevantFields.filter(f=>f.id===state.review.field):relevantFields;
 fields.forEach(f=>f.units.forEach(u=>{const count=getMissedPool().filter(q=>q.subject===sub.id&&q.unit===u.id&&(state.review.grade==='all'||q.grades.includes(state.review.grade))).length;if(!count)return;const key=unitKey(sub.id,f.id,u.id);const row=document.createElement('label');row.className='unit-item';row.innerHTML=`<input type="checkbox" ${state.review.units.has(key)?'checked':''}><span><strong>${u.name}</strong><small>${f.name}</small><em>${count}問</em></span>`;row.querySelector('input').onchange=e=>{e.target.checked?state.review.units.add(key):state.review.units.delete(key);updateReviewSummary()};ue.append(row)}));
 if(!ue.children.length)ue.innerHTML='<p class="help">この条件に復習問題はありません。</p>';
}
document.getElementById('reviewField').addEventListener('change',e=>{state.review.field=e.target.value;state.review.units.clear();renderReviewFieldAndUnits();updateReviewSummary()});
document.getElementById('reviewCountChoices').addEventListener('click',e=>{const b=e.target.closest('[data-review-count]');if(!b)return;document.querySelectorAll('[data-review-count]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');state.review.count=b.dataset.reviewCount==='all'?'all':Number(b.dataset.reviewCount);updateReviewSummary()});
function filteredReviewPool(){
 let pool=getMissedPool().filter(q=>state.review.grade==='all'||q.grades.includes(state.review.grade));
 if(state.review.subject!=='all')pool=pool.filter(q=>q.subject===state.review.subject);
 if(state.review.field&&state.review.subject!=='all'){const sub=state.curriculum.subjects.find(s=>s.id===state.review.subject);const f=sub?.fields.find(x=>x.id===state.review.field);const ids=new Set((f?.units||[]).map(u=>u.id));pool=pool.filter(q=>ids.has(q.unit))}
 if(state.review.units.size){const ids=new Set([...state.review.units].map(k=>k.split('/')[2]));pool=pool.filter(q=>ids.has(q.unit))}
 return pool;
}
function updateReviewSummary(){const n=filteredReviewPool().length;document.getElementById('reviewSummary').textContent=`現在 ${n}問が条件に一致しています。`;}
document.getElementById('startFilteredReview').onclick=()=>{const pool=filteredReviewPool();if(!pool.length){alert('この条件に復習問題はありません。');return}const limit=state.review.count==='all'?'all':Math.min(state.review.count,pool.length);state.session=pickSmartQuestions(pool,limit);state.index=0;state.score=0;state.answers=[];state.sessionContext={mode:'review'};showView('playView');renderQuestion();};


function loadExamPlans(){try{return JSON.parse(localStorage.getItem('examPlans')||'[]')}catch{return[]}}
function saveExamPlans(items){localStorage.setItem('examPlans',JSON.stringify(items));renderExamPlanList();renderDailyPlanPreview();}
function loadExamStudyLogs(){try{return JSON.parse(localStorage.getItem('examStudyLogs')||'[]')}catch{return[]}}
function dateOnlyLocal(d=new Date()){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`;}
function daysUntil(dateStr){if(!dateStr)return null;const [y,m,d]=dateStr.split('-').map(Number);const target=new Date(y,m-1,d);const now=new Date();const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());return Math.round((target-today)/86400000);}
function examUnitIds(plan){return new Set((plan.units||[]).map(k=>k.split('/')[2]));}
function examQuestionPool(plan){const ids=examUnitIds(plan),materials=new Set(plan.materials||[]);return state.questionBank.filter(q=>ids.has(q.unit)&&q.grades.includes(plan.grade)&&matchesSelectedTextbook(q)&&questionMatchesMaterials(q,materials));}
function subjectForUnitKey(key){return key.split('/')[0];}
function examSubjectCount(plan){return new Set((plan.units||[]).map(subjectForUnitKey)).size;}
function examProgress(plan){
 const pool=examQuestionPool(plan);if(!pool.length)return{attempted:0,total:0,percent:0};
 const ids=new Set(pool.map(q=>q.id));const attempted=new Set();loadExamStudyLogs().filter(x=>x.examId===plan.id).forEach(l=>(l.questionIds||[]).forEach(id=>{if(ids.has(id))attempted.add(id)}));
 return{attempted:attempted.size,total:pool.length,percent:Math.round(attempted.size/pool.length*100)};
}
function openExamPlans(){showView('examView');renderExamPlanList();}
function renderExamPlanList(){
 const el=document.getElementById('examPlanList');if(!el||!state.curriculum)return;const plans=loadExamPlans().sort((a,b)=>String(a.date).localeCompare(String(b.date)));el.innerHTML='';
 if(!plans.length){el.innerHTML='<div class="empty-card"><strong>まだ定期テストが登録されていません</strong><p>テスト日と範囲を登録すると、今日やる問題を自動で作れます。</p></div>';return}
 plans.forEach(plan=>{const days=daysUntil(plan.date);const prog=examProgress(plan);const card=document.createElement('article');card.className='exam-plan-card';
  const dayLabel=days===0?'今日':days>0?`あと${days}日`:`${Math.abs(days)}日前に終了`;
  card.innerHTML=`<div class="exam-plan-top"><div><p class="eyebrow">${escapeHtml(plan.date||'日付未設定')}</p><h3>${escapeHtml(plan.name||'定期テスト')}</h3></div><span class="exam-countdown ${days<0?'past':''}">${dayLabel}</span></div><p class="help">中${plan.grade}・${examSubjectCount(plan)}教科・${(plan.units||[]).length}単元${(plan.materials||[]).length?`・教材/Unit ${(plan.materials||[]).map(materialTitleById).map(x=>`「${escapeHtml(x)}」`).join('、')}`:''}</p><div class="progress-track"><span style="width:${prog.percent}%"></span></div><p class="exam-progress">このテスト向け学習 ${prog.attempted}/${prog.total}問</p><div class="exam-card-actions"><button class="primary exam-study" type="button">今日の学習を始める</button><button class="secondary exam-mock" type="button">模擬テスト</button><button class="secondary exam-edit" type="button">編集</button><button class="secondary exam-delete" type="button">削除</button></div>`;
  card.querySelector('.exam-study').disabled=days<0;card.querySelector('.exam-study').onclick=()=>startExamStudy(plan.id);card.querySelector('.exam-mock').onclick=()=>openMockExamSetup(plan.id);card.querySelector('.exam-edit').onclick=()=>openExamEditor(plan.id);card.querySelector('.exam-delete').onclick=()=>deleteExamPlan(plan.id);el.append(card);
 });
}
function openExamEditor(id=null){
 const existing=id?loadExamPlans().find(x=>x.id===id):null;const nowYear=new Date().getFullYear();state.exam.editId=id;state.exam.grade=existing?.grade||2;state.exam.units=new Set(existing?.units||[]);state.exam.textbookYear=Number(existing?.textbookYear||((nowYear>=2025&&nowYear<=2028)?nowYear:2025));state.exam.materials=new Set(existing?.materials||[]);state.exam.openSubjects=new Set();showView('examEditView');
 document.getElementById('examEditTitle').textContent=existing?'テストを編集':'テストを登録';document.getElementById('examName').value=existing?.name||'';document.getElementById('examDate').value=existing?.date||'';const y=document.getElementById('examTextbookYear');if(y)y.value=String(state.exam.textbookYear);renderExamGrades();renderExamTextbookCandidates();renderExamRanges();updateExamEditSummary();
}
function renderExamGrades(){const el=document.getElementById('examGradeChoices');el.innerHTML='';[1,2,3].forEach(g=>{const b=document.createElement('button');b.className='chip'+(state.exam.grade===g?' selected':'');b.textContent=`中${g}`;b.onclick=()=>{state.exam.grade=g;state.exam.units.clear();state.exam.materials.clear();state.exam.openSubjects.clear();renderExamGrades();renderExamTextbookCandidates();renderExamRanges();updateExamEditSummary()};el.append(b)})}

function renderExamTextbookCandidates(){
 const host=document.getElementById('examTextbookCandidates');if(!host)return;host.innerHTML='';
 const year=Number(state.exam.textbookYear||2025);
 for(const sid of ['japanese','english']){
  const publisher=rangePublisher(sid);const sub=state.curriculum?.subjects?.find(x=>x.id===sid);const rows=textbookCandidateRows(sid,publisher,state.exam.grade,year);
  const card=document.createElement('article');card.className='exam-textbook-candidate-card';
  const yearLabel=`令和${year-2018}年度`;const pubName=publisher?publisherLabel(publisher):'未設定';
  card.innerHTML=`<div class="exam-textbook-candidate-head"><div><strong>${sub?.icon||''} ${sub?.name||sid}</strong><small>${yearLabel}・${escapeHtml(pubName)}・中${state.exam.grade}</small></div></div><div class="exam-textbook-candidate-list"></div>`;
  const list=card.querySelector('.exam-textbook-candidate-list');
  if(!publisher){list.innerHTML='<p class="help">教科書会社が未設定です。先に「教科書設定」で採択地区または出版社を設定してください。</p>';}
  else if(!rows.length){list.innerHTML='<p class="help">この年度・出版社・学年の候補データはまだ登録されていません。下の単元一覧から選択できます。</p>';}
  else rows.forEach(r=>{const selected=state.exam.materials.has(r.id);const b=document.createElement('button');b.type='button';b.className='exam-material-btn'+(selected?' selected':'');b.innerHTML=`<strong>${escapeHtml(r.title)}</strong><small>${r.pages?`${escapeHtml(r.pages)}・`:''}${selected?'追加済み':'範囲に追加'}</small>`;b.onclick=()=>{state.exam.materials.add(r.id);for(const k of r.unitKeys)state.exam.units.add(k);renderExamTextbookCandidates();renderExamRanges();updateExamEditSummary();};list.append(b)});
  host.append(card);
 }
}
document.getElementById('examTextbookYear')?.addEventListener('change',e=>{state.exam.textbookYear=Number(e.target.value||2025);state.exam.materials.clear();renderExamTextbookCandidates();updateExamEditSummary();});
document.getElementById('examDate')?.addEventListener('change',e=>{const y=Number(String(e.target.value||'').slice(0,4));if(TEXTBOOK_CANDIDATES.validYears.includes(y)){state.exam.textbookYear=y;const sel=document.getElementById('examTextbookYear');if(sel)sel.value=String(y);state.exam.materials.clear();renderExamTextbookCandidates();updateExamEditSummary();}});

function renderExamRanges(){
 const el=document.getElementById('examRangeChoices');el.innerHTML='';state.curriculum.subjects.forEach(sub=>{
  const allUnits=[];sub.fields.forEach(f=>f.units.filter(u=>u.grades.includes(state.exam.grade)).forEach(u=>allUnits.push({field:f,unit:u})));if(!allUnits.length)return;
  const details=document.createElement('details');details.className='exam-subject-group';details.open=state.exam.openSubjects.has(sub.id);const selected=allUnits.filter(x=>state.exam.units.has(unitKey(sub.id,x.field.id,x.unit.id))).length;
  details.innerHTML=`<summary><span>${sub.icon} <strong>${sub.name}</strong></span><em>${selected}/${allUnits.length}単元</em></summary><div class="exam-unit-grid"></div>`;
  details.addEventListener('toggle',()=>{if(details.open)state.exam.openSubjects.add(sub.id);else state.exam.openSubjects.delete(sub.id);});
  const grid=details.querySelector('.exam-unit-grid');
  sub.fields.forEach(field=>{
    const fieldUnits=field.units.filter(u=>u.grades.includes(state.exam.grade));if(!fieldUnits.length)return;
    const fieldWrap=document.createElement('div');fieldWrap.className='exam-field-group';
    const fieldHead=document.createElement('div');fieldHead.className='unit-group-head';const h=document.createElement('strong');h.textContent=field.name;fieldHead.append(h);
    const keys=fieldUnits.map(u=>unitKey(sub.id,field.id,u.id));const allFieldSelected=keys.every(k=>state.exam.units.has(k));
    const bulk=document.createElement('button');bulk.type='button';bulk.className='unit-bulk-btn';bulk.textContent=allFieldSelected?'分野をすべて解除':'分野をすべて選択';
    bulk.onclick=e=>{e.preventDefault();e.stopPropagation();state.exam.openSubjects.add(sub.id);if(allFieldSelected)keys.forEach(k=>state.exam.units.delete(k));else keys.forEach(k=>state.exam.units.add(k));renderExamRanges();updateExamEditSummary();};fieldHead.append(bulk);fieldWrap.append(fieldHead);
    fieldUnits.forEach(unit=>{const key=unitKey(sub.id,field.id,unit.id);const available=state.questionBank.filter(q=>q.subject===sub.id&&q.unit===unit.id&&q.grades.includes(state.exam.grade)&&matchesSelectedTextbook(q)).length;const row=document.createElement('label');row.className='unit-item';row.innerHTML=`<input type="checkbox" ${state.exam.units.has(key)?'checked':''}><span><strong>${unit.name}</strong><small>${field.name}</small><em>${available}問</em></span>`;row.querySelector('input').onchange=e=>{state.exam.openSubjects.add(sub.id);e.target.checked?state.exam.units.add(key):state.exam.units.delete(key);renderExamRanges();updateExamEditSummary()};fieldWrap.append(row)});
    grid.append(fieldWrap);
  });
  el.append(details);
 });
}
function updateExamEditSummary(){const el=document.getElementById('examEditSummary');if(!el)return;const subjectCount=new Set([...state.exam.units].map(subjectForUnitKey)).size;const ids=new Set([...state.exam.units].map(k=>k.split('/')[2]));const qCount=state.questionBank.filter(q=>ids.has(q.unit)&&q.grades.includes(state.exam.grade)).length;el.textContent=`${subjectCount}教科・${state.exam.units.size}単元を選択${state.exam.materials.size?` / 教材・Unit候補 ${state.exam.materials.size}件`:''} / 現在${qCount}問出題可能`;}
function saveCurrentExamPlan(){const name=document.getElementById('examName').value.trim();const date=document.getElementById('examDate').value;if(!name){alert('テスト名を入力してください。');return}if(!date){alert('テスト日を選んでください。');return}if(!state.exam.units.size){alert('出題範囲を1単元以上選んでください。');return}let plans=loadExamPlans();const item={id:state.exam.editId||crypto.randomUUID?.()||String(Date.now()),name,date,grade:state.exam.grade,units:[...state.exam.units],textbookYear:state.exam.textbookYear,materials:[...state.exam.materials],updatedAt:new Date().toISOString()};const i=plans.findIndex(x=>x.id===item.id);if(i>=0)plans[i]={...plans[i],...item};else plans.push({...item,createdAt:new Date().toISOString()});saveExamPlans(plans);state.exam.editId=null;openExamPlans();}
function deleteExamPlan(id){const p=loadExamPlans().find(x=>x.id===id);if(!p)return;if(!confirm(`「${p.name}」を削除しますか？`))return;saveExamPlans(loadExamPlans().filter(x=>x.id!==id));localStorage.setItem('examStudyLogs',JSON.stringify(loadExamStudyLogs().filter(x=>x.examId!==id)));}
function buildExamSession(plan,count=20){
 const pool=examQuestionPool(plan);if(!pool.length)return[];return pickQuestionsForMaterials(pool,Math.min(count,pool.length),new Set(plan.materials||[]));
}

let mockTimerId=null;
function loadMockExamResults(){try{return JSON.parse(localStorage.getItem('mockExamResults')||'[]')}catch{return[]}}
function saveMockExamResult(item){const arr=loadMockExamResults();arr.push(item);localStorage.setItem('mockExamResults',JSON.stringify(arr.slice(-100)));}
function findMockExamResult(id){return loadMockExamResults().find(x=>x.id===id)||null;}
function mockQuestionPoints(result,qid){
 if(result?.pointsByQuestion&&Number.isFinite(Number(result.pointsByQuestion[qid])))return Number(result.pointsByQuestion[qid]);
 const n=Math.max(1,(result?.questionIds||[]).length),base=Math.floor(100/n),rem=100-base*n,idx=(result?.questionIds||[]).indexOf(qid);return base+(idx>=0&&idx<rem?1:0);
}
function mockWrongQuestionIds(result){const answerMap=new Map((result?.answers||[]).map(a=>[a.questionId,a]));return (result?.questionIds||[]).filter(id=>!answerMap.get(id)?.correct);}
function mockAttemptChain(result){if(!result)return[];const root=result.rootAttemptId||result.id;return loadMockExamResults().filter(x=>(x.rootAttemptId||x.id)===root).sort((a,b)=>new Date(a.at)-new Date(b.at));}
function mockPreviousAttempt(result){const chain=mockAttemptChain(result),i=chain.findIndex(x=>x.id===result.id);return i>0?chain[i-1]:null;}
function mockGrowthText(result){const prev=mockPreviousAttempt(result);if(!prev)return'';const diff=Number(result.score||0)-Number(prev.score||0);return `前回 ${Number(prev.score)||0}点 → 今回 ${Number(result.score)||0}点（${diff>0?'+':''}${diff}点）`;}
function questionInfoLabel(q){const info=statsUnitInfo(q);return info?`${info.subject.name}：${info.unit.name}`:(state.curriculum?.subjects.find(s=>s.id===q?.subject)?.name||q?.subject||'');}
function relatedQuestionsForMockResult(result,limit=12){
 const wrongIds=mockWrongQuestionIds(result),wrongQs=wrongIds.map(id=>state.questionBank.find(q=>q.id===id)).filter(Boolean);if(!wrongQs.length)return[];
 const plan=loadExamPlans().find(x=>x.id===result.examId);const source=plan?examQuestionPool(plan):state.questionBank.filter(q=>q.grades?.includes(Number(result.grade)||state.grade));
 const wrongSet=new Set(wrongIds),used=new Set(),out=[];
 const units=[];wrongQs.forEach(q=>{const key=`${q.subject}/${q.unit}`;if(!units.some(x=>x.key===key))units.push({key,subject:q.subject,unit:q.unit});});
 for(const u of units){const candidates=smartQuestionOrder(source.filter(q=>q.subject===u.subject&&q.unit===u.unit&&!wrongSet.has(q.id)&&!used.has(q.id)));if(candidates[0]){out.push(candidates[0]);used.add(candidates[0].id);}}
 if(out.length<limit){for(const q of smartQuestionOrder(source.filter(q=>wrongQs.some(w=>w.subject===q.subject&&w.unit===q.unit)&&!wrongSet.has(q.id)&&!used.has(q.id)))){out.push(q);used.add(q.id);if(out.length>=limit)break;}}
 return out.slice(0,limit);
}
function startMockMistakeReview(resultId,includeSimilar=false){
 const result=findMockExamResult(resultId);if(!result)return;const wrongIds=mockWrongQuestionIds(result);const wrong=wrongIds.map(id=>state.questionBank.find(q=>q.id===id)).filter(Boolean);if(!wrong.length){alert('この模擬テストには間違いがありません。');return;}
 const similar=includeSimilar?relatedQuestionsForMockResult(result,Math.min(12,wrong.length)):[];state.session=[...wrong,...similar];state.index=0;state.score=0;state.answers=[];state.grade=Number(result.grade)||state.grade;state.subject=null;
 state.sessionContext={mode:'mockReview',examId:result.examId,sourceMockResultId:result.id,reviewKind:includeSimilar?'similar':'mistakes',materials:[],textbookYear:null};showView('playView');renderQuestion();
}
function startMockExamRetry(resultId){
 const result=findMockExamResult(resultId);if(!result)return;const session=(result.questionIds||[]).map(id=>state.questionBank.find(q=>q.id===id)).filter(Boolean);if(!session.length){alert('再挑戦できる問題が見つかりません。');return;}
 const points={};session.forEach(q=>points[q.id]=mockQuestionPoints(result,q.id));const minutes=Number(result.minutes)||30;
 state.session=session;state.index=0;state.score=0;state.answers=[];state.grade=Number(result.grade)||state.grade;state.subject=null;state.mockExam.lastResultId=result.id;
 state.sessionContext={mode:'mockExam',examId:result.examId,examName:result.examName,materials:result.materials||[],textbookYear:result.textbookYear||null,points,minutes,startedAt:new Date().toISOString(),deadline:Date.now()+minutes*60000,retryOf:result.id,rootAttemptId:result.rootAttemptId||result.id};document.getElementById('mockResultDetails').hidden=true;showView('playView');startMockTimer();renderQuestion();
}
function stopMockTimer(){if(mockTimerId){clearInterval(mockTimerId);mockTimerId=null;}const box=document.getElementById('mockTimerBox');if(box)box.hidden=true;}
function mockExamAutoPool(plan){return examQuestionPool(plan).filter(q=>['choice','word','multi','reorder','fill'].includes(q.type));}
function balancedMockQuestions(plan,count){
 const pool=mockExamAutoPool(plan);if(!pool.length)return[];
 const n=Math.min(count==='all'?pool.length:Number(count)||20,pool.length);
 const materials=new Set(plan.materials||[]),preferred=materialPriorityOrder(pool,materials);
 const typeOrder=['choice','fill','reorder','multi','word'];
 const typeRatio={choice:.35,fill:.20,reorder:.15,multi:.15,word:.15};
 const typeTarget={};let assigned=0;
 typeOrder.forEach(t=>{typeTarget[t]=Math.floor(n*typeRatio[t]);assigned+=typeTarget[t];});
 const fractions=typeOrder.map((t,i)=>({t,f:n*typeRatio[t]-Math.floor(n*typeRatio[t]),i})).sort((a,b)=>b.f-a.f||a.i-b.i);
 for(let i=0;i<n-assigned;i++)typeTarget[fractions[i%fractions.length].t]++;
 const diffTarget={1:Math.round(n*.3),2:Math.round(n*.5),3:0};diffTarget[3]=Math.max(0,n-diffTarget[1]-diffTarget[2]);
 const selected=[],used=new Set(),subjectCount={},diffCount={1:0,2:0,3:0};
 const preferredIndex=new Map(preferred.map((q,i)=>[q.id,i]));
 const pickOne=(candidates)=>{
  const available=candidates.filter(q=>!used.has(q.id));if(!available.length)return null;
  const minSub=Math.min(...available.map(q=>subjectCount[q.subject]||0));
  const needDiff=available.filter(q=>(diffCount[questionDifficulty(q)]||0)<(diffTarget[questionDifficulty(q)]||0));
  const base=needDiff.length?needDiff:available;
  const minBaseSub=Math.min(...base.map(q=>subjectCount[q.subject]||0));
  const balanced=base.filter(q=>(subjectCount[q.subject]||0)===minBaseSub);
  balanced.sort((a,b)=>(preferredIndex.get(a.id)??99999)-(preferredIndex.get(b.id)??99999));
  return balanced[0]||base.find(q=>(subjectCount[q.subject]||0)===minSub)||base[0];
 };
 const add=(q)=>{if(!q||used.has(q.id)||selected.length>=n)return false;selected.push(q);used.add(q.id);subjectCount[q.subject]=(subjectCount[q.subject]||0)+1;const d=questionDifficulty(q);diffCount[d]=(diffCount[d]||0)+1;return true;};
 for(const t of typeOrder){for(let i=0;i<typeTarget[t]&&selected.length<n;i++){const q=pickOne(preferred.filter(x=>x.type===t));if(!add(q))break;}}
 while(selected.length<n){const q=pickOne(preferred);if(!add(q))break;}
 return selected.slice(0,n).sort(()=>Math.random()-.5);
}
function mockTypeMixText(n){
 const ratios=[['単一選択',.35],['穴埋め',.20],['並べ替え',.15],['複数選択',.15],['短答',.15]];
 const vals=ratios.map(([name,r])=>({name,r,count:Math.floor(n*r),frac:n*r-Math.floor(n*r)}));let assigned=vals.reduce((s,x)=>s+x.count,0);
 vals.slice().sort((a,b)=>b.frac-a.frac).forEach(x=>{if(assigned<n){x.count++;assigned++;}});
 return vals.filter(x=>x.count).map(x=>`${x.name}${x.count}問`).join('・');
}
function openMockExamSetup(id){
 const plan=loadExamPlans().find(x=>x.id===id);if(!plan)return;
 state.mockExam.planId=id;state.mockExam.count=20;state.mockExam.minutes=30;showView('mockExamSetupView');
 const pool=mockExamAutoPool(plan);const total=examQuestionPool(plan).length;
 document.getElementById('mockExamName').textContent=plan.name||'定期テスト';
 document.getElementById('mockExamMeta').textContent=`中${plan.grade}・${examSubjectCount(plan)}教科・${(plan.units||[]).length}単元 / 自動採点可能 ${pool.length}問（範囲全体 ${total}問）`;
 renderMockSetupChoices();updateMockSetupSummary();
}
function renderMockSetupChoices(){
 document.querySelectorAll('[data-mock-count]').forEach(b=>b.classList.toggle('selected',String(state.mockExam.count)===b.dataset.mockCount));
 document.querySelectorAll('[data-mock-minutes]').forEach(b=>b.classList.toggle('selected',String(state.mockExam.minutes)===b.dataset.mockMinutes));
}
function updateMockSetupSummary(){
 const plan=loadExamPlans().find(x=>x.id===state.mockExam.planId);if(!plan)return;const pool=mockExamAutoPool(plan);const wanted=state.mockExam.count==='all'?pool.length:Math.min(Number(state.mockExam.count)||20,pool.length);
 const el=document.getElementById('mockExamSetupSummary');el.textContent=`${wanted}問・${state.mockExam.minutes}分・100点満点 / 基礎30%・標準50%・応用20%を目安に調整。形式目安：${mockTypeMixText(wanted)}。不足する形式は他形式で補います。`;
}
function startMockExam(){
 const plan=loadExamPlans().find(x=>x.id===state.mockExam.planId);if(!plan)return;const session=balancedMockQuestions(plan,state.mockExam.count);
 if(!session.length){alert('この範囲には自動採点できる問題がありません。');return;}
 const base=Math.floor(100/session.length),rem=100-base*session.length;const points={};session.forEach((q,i)=>points[q.id]=base+(i<rem?1:0));
 state.session=session;state.index=0;state.score=0;state.answers=[];state.grade=plan.grade;state.subject=null;
 state.sessionContext={mode:'mockExam',examId:plan.id,examName:plan.name,materials:plan.materials||[],textbookYear:plan.textbookYear||null,points,minutes:state.mockExam.minutes,startedAt:new Date().toISOString(),deadline:Date.now()+state.mockExam.minutes*60000};
 document.getElementById('mockResultDetails').hidden=true;showView('playView');startMockTimer();renderQuestion();
}
function startMockTimer(){stopMockTimer();const box=document.getElementById('mockTimerBox');if(box)box.hidden=false;const tick=()=>{const left=Math.max(0,(state.sessionContext?.deadline||0)-Date.now());const sec=Math.ceil(left/1000),m=Math.floor(sec/60),s=sec%60;const label=document.getElementById('mockTimer');if(label)label.textContent=`残り ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;if(left<=0){stopMockTimer();finishMockExam(true);}};tick();mockTimerId=setInterval(tick,1000);}
function renderMockExamQuestion(){
 const q=state.session[state.index];if(!q){finishMockExam(false);return;}const s=state.curriculum.subjects.find(x=>x.id===q.subject);const pts=state.sessionContext?.points?.[q.id]||0;
 document.getElementById('quizProgress').textContent=`${state.index+1} / ${state.session.length} ・ ${pts}点`;
 document.getElementById('quizSubject').textContent=`${s?.icon||''} ${s?.name||''} ・ ${difficultyLabel(q)} ・ 模擬テスト`;
 renderReferencePages(q);document.getElementById('questionText').textContent=q.question;document.getElementById('answerArea').innerHTML='';document.getElementById('feedback').hidden=true;document.getElementById('nextQuestion').hidden=true;document.getElementById('dontKnow').disabled=false;
 const area=document.getElementById('answerArea');
 if(q.type==='choice'){
  (q.choices||[]).forEach((c,i)=>{const b=document.createElement('button');b.className='answer-btn';b.textContent=c;b.onclick=()=>submitMockAnswer({choice:i,answerLabel:c});area.append(b)});
 }else if(q.type==='multi')renderMultiAnswer(area,q,true);
 else if(q.type==='reorder')renderReorderAnswer(area,q,true);
 else if(q.type==='fill')renderFillAnswer(area,q,true);
 else{
  const input=document.createElement('input');input.type='text';input.className='answer-input';input.placeholder='答えを入力';input.autocomplete='off';const submit=document.createElement('button');submit.className='primary';submit.type='button';submit.textContent='解答して次へ';submit.onclick=()=>submitMockAnswer({text:input.value,answerLabel:input.value});input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();submit.click()}});area.append(input,submit);setTimeout(()=>input.focus(),0);
 }
}
function submitMockAnswer({choice=null,text='',multi=[],order=[],fills=[],answerLabel='',dontKnow=false}={}){
 const q=state.session[state.index];if(!q)return;let correct=false;
 if(!dontKnow){
  if(q.type==='choice')correct=choice===q.answer;
  else if(q.type==='multi'){const a=[...(q.answers||[])].map(Number).sort((x,y)=>x-y),b=[...multi].map(Number).sort((x,y)=>x-y);correct=a.length===b.length&&a.every((x,i)=>x===b[i]);}
  else if(q.type==='reorder'){const a=Array.isArray(q.answerOrder)&&q.answerOrder.length?q.answerOrder:(q.items||[]).map((_,i)=>i);correct=a.length===order.length&&a.every((x,i)=>Number(x)===Number(order[i]));}
  else if(q.type==='fill'){const blanks=q.blanks||[];correct=blanks.length===fills.length&&blanks.every((a,i)=>(Array.isArray(a)?a:[a]).filter(Boolean).some(v=>normalizeText(v)===normalizeText(fills[i])));}
  else correct=acceptedTextAnswers(q).some(a=>normalizeText(a)===normalizeText(text));
 }
 const pts=state.sessionContext?.points?.[q.id]||0;if(correct)state.score+=pts;
 state.answers.push({questionId:q.id,correct,dontKnow,answer:answerLabel,points:correct?pts:0,maxPoints:pts,answeredAt:new Date().toISOString()});if(!correct)saveMissed(q,dontKnow);
 state.index++;renderQuestion();
}
function mockSubjectBreakdown(){
 const map={};state.session.forEach(q=>{const sub=state.curriculum.subjects.find(s=>s.id===q.subject);const a=state.answers.find(x=>x.questionId===q.id);const row=map[q.subject]??={name:sub?.name||q.subject,icon:sub?.icon||'',correct:0,total:0,points:0,max:0};row.total++;row.max+=state.sessionContext?.points?.[q.id]||0;if(a?.correct)row.correct++;row.points+=a?.points||0;map[q.subject]=row;});return Object.values(map);
}
function mockWeakUnits(){
 const map={};state.session.forEach(q=>{const a=state.answers.find(x=>x.questionId===q.id);if(a?.correct)return;const sub=state.curriculum.subjects.find(s=>s.id===q.subject);const field=q.field||fieldIdForUnit(q.subject,q.unit);const unit=sub?.fields?.find(f=>f.id===field)?.units?.find(u=>u.id===q.unit);const key=`${q.subject}/${q.unit}`;map[key]??={label:`${sub?.name||q.subject}：${unit?.name||q.unit}`,miss:0};map[key].miss++;});return Object.values(map).sort((a,b)=>b.miss-a.miss).slice(0,5);
}
function renderMockResultDetails(result,{historical=false}={}){
 const qmap=new Map(state.questionBank.map(q=>[q.id,q])),answerMap=new Map((result.answers||[]).map(a=>[a.questionId,a]));
 const breakdownMap={};for(const qid of result.questionIds||[]){const q=qmap.get(qid);if(!q)continue;const sub=state.curriculum.subjects.find(s=>s.id===q.subject);const a=answerMap.get(qid);const row=breakdownMap[q.subject]??={name:sub?.name||q.subject,icon:sub?.icon||'',correct:0,total:0,points:0,max:0};const max=mockQuestionPoints(result,qid);row.total++;row.max+=max;if(a?.correct)row.correct++;row.points+=a?.correct?(Number(a.points)||max):0;breakdownMap[q.subject]=row;}
 const breakdown=Object.values(breakdownMap),weakMap={};for(const qid of mockWrongQuestionIds(result)){const q=qmap.get(qid);if(!q)continue;const key=`${q.subject}/${q.unit}`;weakMap[key]??={label:questionInfoLabel(q),miss:0};weakMap[key].miss++;}const weak=Object.values(weakMap).sort((a,b)=>b.miss-a.miss).slice(0,5);
 const growth=mockGrowthText(result),wrongCount=mockWrongQuestionIds(result).length,similarCount=relatedQuestionsForMockResult(result,Math.min(12,Math.max(1,wrongCount))).length;const chain=mockAttemptChain(result);
 const box=document.getElementById('mockResultDetails');box.hidden=false;box.innerHTML=`${growth?`<div class="mock-growth"><strong>📈 ${escapeHtml(growth)}</strong>${Number(result.score)>Number(mockPreviousAttempt(result)?.score||0)?'<span>成長しています！</span>':''}</div>`:''}<div class="mock-result-grid">${breakdown.map(r=>`<div class="mock-result-stat"><strong>${r.icon} ${escapeHtml(r.name)}</strong><span>${r.points}/${r.max}点</span><small>${r.correct}/${r.total}問正解</small></div>`).join('')}</div><div class="mock-analysis"><h3>復習優先</h3>${weak.length?weak.map(x=>`<p>・${escapeHtml(x.label)} <strong>${x.miss}問ミス</strong></p>`).join(''):'<p>全問正解です。この範囲はよく仕上がっています。</p>'}</div>${chain.length>1?`<div class="mock-attempt-chain"><strong>挑戦履歴</strong><span>${chain.map((x,i)=>`${i+1}回目 ${x.score}点`).join(' → ')}</span></div>`:''}<div class="mock-result-actions">${wrongCount?`<button class="primary" type="button" data-mock-review="mistakes">このテストの間違いだけ復習</button>`:''}${wrongCount&&similarCount?`<button class="secondary" type="button" data-mock-review="similar">間違えた単元の類題も解く（${similarCount}問）</button>`:''}</div><details class="mock-review"><summary>問題ごとの結果を見る</summary>${(result.questionIds||[]).map((qid,i)=>{const q=qmap.get(qid);if(!q)return'';const a=answerMap.get(qid);const sub=state.curriculum.subjects.find(s=>s.id===q.subject);return `<article class="mock-review-item ${a?.correct?'ok':'ng'}"><strong>問${i+1} ${sub?.icon||''} ${escapeHtml(sub?.name||'')} ${mockQuestionPoints(result,qid)}点</strong><p>${escapeHtml(q.question)}</p><p>あなたの答え：${escapeHtml(a?.answer||'未解答')}</p><p>正解：${escapeHtml(formatCorrectAnswer(q))}</p><small>${escapeHtml(q.explanation||'')}</small></article>`}).join('')}</details>`;
 box.querySelector('[data-mock-review="mistakes"]')?.addEventListener('click',()=>startMockMistakeReview(result.id,false));box.querySelector('[data-mock-review="similar"]')?.addEventListener('click',()=>startMockMistakeReview(result.id,true));
 if(historical){document.getElementById('retryQuiz').textContent='この模擬テストに再挑戦';document.getElementById('backHomeResult').textContent='学習記録へ戻る';}
}
function finishMockExam(timeUp=false){
 if(state.sessionContext?.mode!=='mockExam')return;stopMockTimer();const total=state.session.length,correct=state.answers.filter(a=>a.correct).length,score=Math.round(state.score),rate=total?Math.round(correct/total*100):0;const unanswered=Math.max(0,total-state.answers.length);
 const item={id:crypto.randomUUID?.()||String(Date.now()),examId:state.sessionContext.examId,examName:state.sessionContext.examName,at:new Date().toISOString(),grade:state.grade,score,totalPoints:100,correct,total,rate,timeUp,minutes:state.sessionContext.minutes,questionIds:state.session.map(q=>q.id),pointsByQuestion:{...(state.sessionContext.points||{})},answers:state.answers,materials:state.sessionContext.materials||[],textbookYear:state.sessionContext.textbookYear||null,retryOf:state.sessionContext.retryOf||null,rootAttemptId:state.sessionContext.rootAttemptId||null};if(!item.rootAttemptId)item.rootAttemptId=item.id;saveMockExamResult(item);state.mockExam.lastResultId=item.id;state.sessionContext.resultId=item.id;state.sessionContext.rootAttemptId=item.rootAttemptId;
 document.getElementById('resultEyebrow').textContent=timeUp?'時間終了・模擬テスト完了':'模擬テスト完了';document.getElementById('resultScore').textContent=`${score} / 100点`;document.getElementById('resultRate').textContent=`${correct}/${total}問正解・正答率 ${rate}%${unanswered?`・未解答 ${unanswered}問`:''}`;document.getElementById('retryQuiz').textContent='同じ問題に再挑戦';document.getElementById('backHomeResult').textContent='ホームへ戻る';renderMockResultDetails(item);
 const history=JSON.parse(localStorage.getItem('studyHistory')||'[]');history.push({at:item.at,grade:state.grade,subject:null,total,score:correct,rate,mode:'mockExam',examId:item.examId,materials:item.materials||[],textbookYear:item.textbookYear||null,questionIds:item.questionIds,answerResults:state.answers.map(a=>({questionId:a.questionId,correct:!!a.correct,dontKnow:!!a.dontKnow,answeredAt:a.answeredAt}))});localStorage.setItem('studyHistory',JSON.stringify(history.slice(-300)));
 const logs=loadExamStudyLogs();logs.push({id:item.id,examId:item.examId,at:item.at,questionIds:state.answers.map(a=>a.questionId),score:correct,total,rate});localStorage.setItem('examStudyLogs',JSON.stringify(logs.slice(-300)));updateStreak();showView('resultView');
}
function openStoredMockResult(id){const result=findMockExamResult(id);if(!result)return;stopMockTimer();state.mockExam.lastResultId=result.id;state.sessionContext={mode:'mockExamHistory',examId:result.examId,resultId:result.id};document.getElementById('resultEyebrow').textContent='過去の模擬テスト';document.getElementById('resultScore').textContent=`${Number(result.score)||0} / 100点`;document.getElementById('resultRate').textContent=`${Number(result.correct)||0}/${Number(result.total)||0}問正解・正答率 ${Number(result.rate)||0}%`;renderMockResultDetails(result,{historical:true});showView('resultView');}

function startExamStudy(id){const plan=loadExamPlans().find(x=>x.id===id);if(!plan)return;const session=buildExamSession(plan,20);if(!session.length){alert('このテスト範囲には出題できる問題がありません。');return}state.session=session;state.index=0;state.score=0;state.answers=[];state.grade=plan.grade;state.subject=null;state.sessionContext={mode:'exam',examId:plan.id};showView('playView');renderQuestion();}
function studyHistory(){try{return JSON.parse(localStorage.getItem('studyHistory')||'[]')}catch{return[]}}
function answeredQuestionIds(){const ids=new Set();studyHistory().forEach(h=>(h.questionIds||[]).forEach(id=>ids.add(id)));return ids;}
function shuffleCopy(items){return [...items].sort(()=>Math.random()-.5)}
function takeUnique(target,source,count,used,materials=null){const ordered=materials?materialPriorityOrder(source,materials):smartQuestionOrder(source);for(const q of ordered){if(target.length>=count)break;if(used.has(q.id))continue;used.add(q.id);target.push(q)}}
function buildDailySession(count=20){
 const future=loadExamPlans().filter(p=>daysUntil(p.date)>=0).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
 const plan=future[0]||null;const pool=plan?examQuestionPool(plan):state.questionBank;if(!pool.length)return{plan:null,session:[],stats:{missed:0,unseen:0,review:0}};
 const missedIds=new Set((JSON.parse(localStorage.getItem('missedQuestions')||'[]')||[]).map(x=>x.questionId));
 const seen=plan?new Set(loadExamStudyLogs().filter(x=>x.examId===plan.id).flatMap(x=>x.questionIds||[])):answeredQuestionIds();
 const missed=pool.filter(q=>missedIds.has(q.id));const unseen=pool.filter(q=>!missedIds.has(q.id)&&!seen.has(q.id));const review=pool.filter(q=>!missedIds.has(q.id)&&seen.has(q.id));
 const target=Math.min(count,pool.length),session=[],used=new Set(),materials=plan?new Set(plan.materials||[]):null;
 // 20問なら目安として、苦手8・未学習8・復習4。教材/Unit指定がある場合は各カテゴリ内でも専用問題を優先する。
 takeUnique(session,missed,Math.min(target,8),used,materials);takeUnique(session,unseen,Math.min(target,16),used,materials);takeUnique(session,review,target,used,materials);
 if(session.length<target)takeUnique(session,pool,target,used,materials);
 const stats={missed:session.filter(q=>missedIds.has(q.id)).length,unseen:session.filter(q=>!missedIds.has(q.id)&&!seen.has(q.id)).length,review:session.filter(q=>!missedIds.has(q.id)&&seen.has(q.id)).length};
 return{plan,session,stats};
}
function todayStudyCount(){const today=dateOnlyLocal();return studyHistory().filter(h=>dateOnlyLocal(new Date(h.at))===today).reduce((sum,h)=>sum+(Number(h.total)||0),0)}
function renderDailyPlanPreview(){
 const card=document.getElementById('dailyPlanCard');if(!card||!state.curriculum||!state.questionBank.length)return;const built=buildDailySession(20);const {plan,session,stats}=built;
 const title=document.getElementById('dailyPlanTitle'),lead=document.getElementById('dailyPlanLead'),badge=document.getElementById('dailyPlanBadge'),hero=document.getElementById('dailyHeroSubtitle');
 if(plan){const d=daysUntil(plan.date);title.textContent=`${plan.name}まで${d===0?'今日':`あと${d}日`}`;lead.textContent='登録したテスト範囲から、苦手と未学習を優先して出題します。';hero.textContent=`${plan.name}を優先して20問`;}else{title.textContent='苦手と未学習をバランスよく';lead.textContent='定期テスト予定がないため、全教科から苦手と未学習を優先します。';hero.textContent='苦手・未学習を優先して20問';}
 badge.textContent=`${session.length}問`;document.getElementById('dailyPlanStats').innerHTML=`<div class="daily-stat"><strong>${stats.missed}</strong><small>苦手</small></div><div class="daily-stat"><strong>${stats.unseen}</strong><small>未学習</small></div><div class="daily-stat"><strong>${stats.review}</strong><small>復習</small></div>`;
 const counts={};session.forEach(q=>counts[q.subject]=(counts[q.subject]||0)+1);const mix=document.getElementById('dailySubjectMix');mix.innerHTML='';Object.entries(counts).sort((a,b)=>b[1]-a[1]).forEach(([sid,n])=>{const sub=state.curriculum.subjects.find(s=>s.id===sid);if(!sub)return;const span=document.createElement('span');span.className='daily-subject-pill';span.textContent=`${sub.icon} ${sub.name} ${n}問`;mix.append(span)});
 const done=todayStudyCount(),goal=20,pct=Math.min(100,Math.round(done/goal*100));document.getElementById('todayProgressBar').style.width=`${pct}%`;document.getElementById('todayProgressText').textContent=done>=goal?`今日 ${done}問クリア ✓`:`今日 ${done}/${goal}問`;
}
function startDailyStudy(){
 const built=buildDailySession(20);if(!built.session.length){alert('出題できる問題がありません。');return}state.session=built.session;state.index=0;state.score=0;state.answers=[];state.grade=built.plan?.grade||state.grade;state.subject=null;state.sessionContext={mode:'daily',examId:built.plan?.id||null};showView('playView');renderQuestion();
}
document.getElementById('createExamPlan').onclick=()=>openExamEditor();
document.getElementById('cancelExamEditTop').onclick=openExamPlans;document.getElementById('cancelExamEdit').onclick=openExamPlans;document.getElementById('saveExamPlan').onclick=saveCurrentExamPlan;document.getElementById('clearExamUnits').onclick=()=>{state.exam.units.clear();state.exam.materials.clear();state.exam.openSubjects.clear();renderExamTextbookCandidates();renderExamRanges();updateExamEditSummary();};
document.getElementById('cancelMockExam')?.addEventListener('click',openExamPlans);document.getElementById('startMockExam')?.addEventListener('click',startMockExam);document.getElementById('mockCountChoices')?.addEventListener('click',e=>{const b=e.target.closest('[data-mock-count]');if(!b)return;state.mockExam.count=b.dataset.mockCount==='all'?'all':Number(b.dataset.mockCount);renderMockSetupChoices();updateMockSetupSummary();});document.getElementById('mockMinuteChoices')?.addEventListener('click',e=>{const b=e.target.closest('[data-mock-minutes]');if(!b)return;state.mockExam.minutes=Number(b.dataset.mockMinutes);renderMockSetupChoices();updateMockSetupSummary();});


function openStats(){showView('statsView');renderStatsDashboard();}
function statsQuestionMap(){return new Map(state.questionBank.map(q=>[q.id,q]));}
function statsSubjectName(id){const s=state.curriculum?.subjects.find(x=>x.id===id);return s?`${s.icon} ${s.name}`:'不明';}
function statsUnitInfo(q){
 const subject=state.curriculum?.subjects.find(s=>s.id===q?.subject);if(!subject)return null;
 for(const field of subject.fields||[]){const unit=(field.units||[]).find(u=>u.id===q.unit);if(unit)return{subject,field,unit};}
 return null;
}
function detailedAnswerRecords(){
 const map=statsQuestionMap(),out=[];
 for(const h of studyHistory())for(const a of h.answerResults||[]){const q=map.get(a.questionId);if(q)out.push({...a,at:a.answeredAt||h.at,question:q});}
 return out;
}
function aggregateSubjectStats(){
 const result=new Map();
 const add=(sid,total,correct)=>{if(!sid||!total)return;const x=result.get(sid)||{total:0,correct:0};x.total+=total;x.correct+=correct;result.set(sid,x)};
 const map=statsQuestionMap();
 for(const h of studyHistory()){
  if(Array.isArray(h.answerResults)&&h.answerResults.length){for(const a of h.answerResults){const q=map.get(a.questionId);if(q)add(q.subject,1,a.correct?1:0)}}
  else if(h.subject)add(h.subject,Number(h.total)||0,Number(h.score)||0);
 }
 return result;
}
function modeLabel(mode){return({quiz:'小テスト',review:'苦手復習',exam:'定期テスト',daily:'今日の30分',mockExam:'模擬テスト',mockReview:'模擬テスト復習'})[mode]||'学習';}
function formatStudyDate(iso){const d=new Date(iso);if(Number.isNaN(d.getTime()))return'';return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;}
function renderStatsDashboard(){
 if(!state.curriculum)return;
 const history=studyHistory();
 const total=history.reduce((n,h)=>n+(Number(h.total)||0),0),correct=history.reduce((n,h)=>n+(Number(h.score)||0),0),rate=total?Math.round(correct/total*100):0;
 const streak=Number(localStorage.getItem('streakDays')||0);const missed=JSON.parse(localStorage.getItem('missedQuestions')||'[]').length;
 const summary=document.getElementById('statsSummary');
 summary.innerHTML=`<div class="stats-summary-card"><small>解いた問題</small><strong>${total}</strong><span>問</span></div><div class="stats-summary-card"><small>正答率</small><strong>${rate}</strong><span>%</span></div><div class="stats-summary-card"><small>連続学習</small><strong>${streak}</strong><span>日</span></div><div class="stats-summary-card"><small>苦手問題</small><strong>${missed}</strong><span>問</span></div>`;
 renderWeeklyStudy(history);renderSubjectStats();renderWeakUnitStats();renderMockExamHistory();renderMockTrendStats();renderRecentHistory(history);
}
function renderWeeklyStudy(history){
 const days=[];const now=new Date();now.setHours(0,0,0,0);
 for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);days.push({date:dateOnlyLocal(d),label:['日','月','火','水','木','金','土'][d.getDay()],count:0});}
 history.forEach(h=>{const day=days.find(x=>x.date===dateOnlyLocal(new Date(h.at)));if(day)day.count+=Number(h.total)||0});
 const max=Math.max(1,...days.map(d=>d.count)),sum=days.reduce((n,d)=>n+d.count,0);document.getElementById('statsWeekTotal').textContent=`合計 ${sum}問`;
 const el=document.getElementById('weeklyStudyChart');el.innerHTML='';
 days.forEach(d=>{const item=document.createElement('div');item.className='week-bar-item';item.innerHTML=`<span class="week-count">${d.count||''}</span><div class="week-bar-track"><span style="height:${Math.max(d.count?8:2,Math.round(d.count/max*100))}%"></span></div><small>${d.label}</small>`;el.append(item)});
}
function renderSubjectStats(){
 const stats=aggregateSubjectStats(),el=document.getElementById('subjectStats');el.innerHTML='';
 const rows=[...stats.entries()].sort((a,b)=>b[1].total-a[1].total);
 if(!rows.length){el.innerHTML='<p class="help">まだ教科別の学習記録がありません。</p>';return;}
 rows.forEach(([sid,x])=>{const rate=x.total?Math.round(x.correct/x.total*100):0;const row=document.createElement('div');row.className='subject-stat-row';row.innerHTML=`<div class="subject-stat-head"><strong>${escapeHtml(statsSubjectName(sid))}</strong><span>${x.correct}/${x.total}問・${rate}%</span></div><div class="progress-track"><span style="width:${rate}%"></span></div>`;el.append(row)});
}
function renderWeakUnitStats(){
 const missed=JSON.parse(localStorage.getItem('missedQuestions')||'[]'),map=statsQuestionMap(),groups=new Map();
 for(const m of missed){const q=map.get(m.questionId),info=statsUnitInfo(q);if(!q||!info)continue;const key=`${q.subject}/${q.unit}`;const x=groups.get(key)||{count:0,subject:info.subject,field:info.field,unit:info.unit};x.count++;groups.set(key,x);}
 const el=document.getElementById('weakUnitStats');el.innerHTML='';const rows=[...groups.values()].sort((a,b)=>b.count-a.count).slice(0,8);
 if(!rows.length){el.innerHTML='<p class="help">現在、苦手として登録されている問題はありません。</p>';return;}
 rows.forEach(x=>{const row=document.createElement('div');row.className='weak-unit-row';row.innerHTML=`<div><strong>${x.subject.icon} ${escapeHtml(x.unit.name)}</strong><small>${escapeHtml(x.subject.name)} ＞ ${escapeHtml(x.field.name)}</small></div><span>${x.count}問</span>`;el.append(row)});
}
function mockResultMetricForQuestions(result,questionIds){const ids=new Set(questionIds),answerMap=new Map((result.answers||[]).map(a=>[a.questionId,a]));let earned=0,max=0,count=0,correct=0;for(const qid of result.questionIds||[]){if(!ids.has(qid))continue;const pts=mockQuestionPoints(result,qid),a=answerMap.get(qid);max+=pts;count++;if(a?.correct){earned+=Number(a.points)||pts;correct++;}}return{earned,max,count,correct,rate:max?Math.round(earned/max*100):0};}
function renderMockExamHistory(){const el=document.getElementById('mockExamHistory');if(!el)return;const rows=loadMockExamResults().sort((a,b)=>new Date(b.at)-new Date(a.at)).slice(0,12);el.innerHTML='';if(!rows.length){el.innerHTML='<p class="help">まだ模擬テストの結果がありません。</p>';return;}rows.forEach(r=>{const growth=mockGrowthText(r),row=document.createElement('div');row.className='mock-history-row';row.innerHTML=`<div><strong>${escapeHtml(r.examName||'模擬テスト')}</strong><small>${escapeHtml(formatStudyDate(r.at))}${r.retryOf?'・再挑戦':''}${growth?`・${escapeHtml(growth)}`:''}</small></div><span>${Number(r.score)||0}点</span><button class="secondary" type="button" data-open-mock-result="${escapeHtml(r.id)}">結果</button>`;el.append(row)});el.querySelectorAll('[data-open-mock-result]').forEach(b=>b.addEventListener('click',()=>openStoredMockResult(b.dataset.openMockResult)));}
function mockTrendValues(results,selector){const out=[];for(const r of results){const qids=(r.questionIds||[]).filter(id=>{const q=state.questionBank.find(x=>x.id===id);return q&&selector(q)});if(!qids.length)continue;const m=mockResultMetricForQuestions(r,qids);if(m.max)out.push({at:r.at,rate:m.rate});}return out.slice(-6);}
function trendText(values){return values.map(x=>`${x.rate}%`).join(' → ');}
function renderMockTrendStats(){const subjectEl=document.getElementById('mockSubjectTrends'),unitEl=document.getElementById('mockUnitTrends');if(!subjectEl||!unitEl)return;const results=loadMockExamResults().sort((a,b)=>new Date(a.at)-new Date(b.at));subjectEl.innerHTML='';unitEl.innerHTML='';if(!results.length){subjectEl.innerHTML='<p class="help">模擬テストを受けると教科別の推移が表示されます。</p>';unitEl.innerHTML='<p class="help">模擬テストを受けると単元別の推移が表示されます。</p>';return;}
 const subjectRows=[];for(const sub of state.curriculum.subjects){const vals=mockTrendValues(results,q=>q.subject===sub.id);if(vals.length)subjectRows.push({label:`${sub.icon} ${sub.name}`,vals});}subjectRows.sort((a,b)=>b.vals.length-a.vals.length);for(const x of subjectRows){const row=document.createElement('div');row.className='trend-row';const first=x.vals[0].rate,last=x.vals.at(-1).rate,diff=last-first;row.innerHTML=`<div><strong>${escapeHtml(x.label)}</strong><small>${escapeHtml(trendText(x.vals))}</small></div><span class="${diff>0?'up':diff<0?'down':''}">${diff>0?'+':''}${diff}pt</span>`;subjectEl.append(row)}if(!subjectRows.length)subjectEl.innerHTML='<p class="help">教科別に集計できる結果がありません。</p>';
 const unitKeys=new Map();for(const r of results)for(const id of r.questionIds||[]){const q=state.questionBank.find(x=>x.id===id),info=statsUnitInfo(q);if(!q||!info)continue;const key=`${q.subject}/${q.unit}`;if(!unitKeys.has(key))unitKeys.set(key,{subject:q.subject,unit:q.unit,label:`${info.subject.icon} ${info.unit.name}`});}
 const unitRows=[];for(const x of unitKeys.values()){const vals=mockTrendValues(results,q=>q.subject===x.subject&&q.unit===x.unit);if(vals.length>=1)unitRows.push({...x,vals});}unitRows.sort((a,b)=>b.vals.length-a.vals.length||a.vals.at(-1).rate-b.vals.at(-1).rate);for(const x of unitRows.slice(0,12)){const row=document.createElement('div');row.className='trend-row';const first=x.vals[0].rate,last=x.vals.at(-1).rate,diff=last-first;row.innerHTML=`<div><strong>${escapeHtml(x.label)}</strong><small>${escapeHtml(trendText(x.vals))}</small></div><span class="${diff>0?'up':diff<0?'down':''}">${diff>0?'+':''}${diff}pt</span>`;unitEl.append(row)}if(!unitRows.length)unitEl.innerHTML='<p class="help">単元別に集計できる結果がありません。</p>';}
function renderRecentHistory(history){
 const el=document.getElementById('recentStudyHistory');el.innerHTML='';const rows=[...history].sort((a,b)=>new Date(b.at)-new Date(a.at)).slice(0,10);
 if(!rows.length){el.innerHTML='<p class="help">まだ学習履歴がありません。小テストを解くとここに記録されます。</p>';return;}
 rows.forEach(h=>{const row=document.createElement('div');row.className='history-row';const subj=h.subject?statsSubjectName(h.subject):'複数教科';row.innerHTML=`<div><strong>${escapeHtml(modeLabel(h.mode))}</strong><small>${escapeHtml(formatStudyDate(h.at))}・${escapeHtml(subj)}</small></div><span>${Number(h.score)||0}/${Number(h.total)||0}・${Number(h.rate)||0}%</span>`;el.append(row)});
}

function fillImportSubjects(){
 const sel=document.getElementById('importSubject');state.curriculum.subjects.forEach(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=`${s.icon} ${s.name}`;sel.append(o)});
 renderImportGrades();renderImportQuestions();
}
function renderImportGrades(){const el=document.getElementById('importGradeChoices');el.innerHTML='';[1,2,3].forEach(g=>{const b=document.createElement('button');b.className='chip'+(state.importGrade===g?' selected':'');b.textContent=`中${g}`;b.onclick=()=>{state.importGrade=g;renderImportGrades();updateImportFields()};el.append(b)})}
function updateImportFields(){
 const sid=document.getElementById('importSubject').value;const fs=document.getElementById('importField');const us=document.getElementById('importUnit');fs.innerHTML='<option value="">分野を選択</option>';us.innerHTML='<option value="">単元を選択</option>';if(!sid){updateImportTextbookHint();return}const sub=state.curriculum.subjects.find(s=>s.id===sid);sub.fields.forEach(f=>{if(!f.units.some(u=>u.grades.includes(state.importGrade)))return;const o=document.createElement('option');o.value=f.id;o.textContent=f.name;fs.append(o)});updateImportTextbookHint();
}
document.getElementById('importSubject').addEventListener('change',updateImportFields);
document.getElementById('importField').addEventListener('change',()=>{const sid=document.getElementById('importSubject').value;const fid=document.getElementById('importField').value;const us=document.getElementById('importUnit');us.innerHTML='<option value="">単元を選択</option>';const f=state.curriculum.subjects.find(s=>s.id===sid)?.fields.find(x=>x.id===fid);(f?.units||[]).filter(u=>u.grades.includes(state.importGrade)).forEach(u=>{const o=document.createElement('option');o.value=u.id;o.textContent=u.name;us.append(o)});updateImportTextbookHint();});
function newImportQuestion(text=''){return{id:crypto.randomUUID?.()||String(Date.now()+Math.random()),type:'choice',question:text,choices:['','','',''],answer:0,answers:[''],items:['','','',''],answerOrder:[0,1,2,3],blanks:[['']],modelAnswer:'',explanation:''}}

// OCR結果から、タイトル・氏名欄・注意書きなどを除き、問題部分を抽出する。
// AIや外部APIへ本文を送らず、端末内のルール処理だけで動作する。
// OCRは「問 1.」「問　1」「Q 1」「1 .」のように番号の周囲へ空白を入れることがあるため、
// 問題番号の検出前に文字幅・空白を正規化する。
const QUESTION_START_RE=/^\s*(?:(?:問\s*|Q\s*|Ｑ\s*)[0-9０-９]{1,3}|[0-9０-９]{1,3})\s*[.．、:：)）\-]?\s*/i;
const EMBEDDED_QUESTION_RE=/(?:^|\s)((?:問\s*|Q\s*|Ｑ\s*)[0-9０-９]{1,3}\s*[.．、:：)）\-]?)/gi;
const CHOICE_RE=/^\s*(?:([A-DＡ-Ｄa-d]|[ア-エ])\s*[.．、:：)）]?|([①②③④])|([1-4１-４])\s*[)）])\s*(.+?)\s*$/;
function normalizeOcrLine(line){return String(line||'').normalize('NFKC').replace(/[\u00a0\u3000]/g,' ').replace(/\s+/g,' ').trim();}
function compactJapaneseSpacing(text){
 let t=String(text||'');
 // 日本語文字同士の間にOCRが挿入した不要な空白だけを除去する。
 const jp='\\u3040-\\u30ff\\u3400-\\u4dbf\\u4e00-\\u9fff\\uf900-\\ufaff';
 const re=new RegExp(`([${jp}])\\s+([${jp}])`,'g');
 let prev='';
 while(prev!==t){prev=t;t=t.replace(re,'$1$2');}
 return t.replace(/\s+([、。！？・])/g,'$1').replace(/([（「『])\s+/g,'$1').replace(/\s+([）」』])/g,'$1').trim();
}
function isPageMarker(line){return /^-+\s*[0-9０-９]+\s*ページ目\s*-+$/i.test(line);}
function isLikelyFooterOrNote(line){
 const t=normalizeOcrLine(line);
 return !t||/^[-－—―_=＿]{3,}$/.test(t)||/^\d+\s*\/\s*\d+$/.test(t)||/^ページ\s*\d+$/i.test(t)||/^※/.test(t)||/^(氏名|名前|学年|組|番号|日付|得点|点数)\s*[：:].*$/.test(t)||/^(答え|解答)(?:\s*[：:]\s*[_＿-]*)?\s*$/.test(t);
}
function stripQuestionNumber(text){return String(text||'').replace(QUESTION_START_RE,'').trim();}
function splitPagesFromOcr(raw){
 const lines=String(raw||'').replace(/\r/g,'').split('\n');
 const pages=[];let current=[];
 for(const line of lines){
  if(isPageMarker(normalizeOcrLine(line))){if(current.some(x=>x.trim()))pages.push(current);current=[];continue}
  current.push(line);
 }
 if(current.some(x=>x.trim()))pages.push(current);
 return pages.length?pages:[lines];
}
function ensureQuestionStartsOnOwnLine(raw){
 // OCRによって「答え 問 2. ...」のように同一行へ連結された場合にも対応する。
 return String(raw||'').replace(/([^\n])\s+((?:問\s*|Q\s*|Ｑ\s*)[0-9０-９]{1,3}\s*[.．、:：)）\-]?\s*)/gi,'$1\n$2');
}
function extractQuestionBlocks(raw){
 const blocks=[];
 for(const rawPage of splitPagesFromOcr(ensureQuestionStartsOnOwnLine(raw))){
  let lines=rawPage.map(normalizeOcrLine).filter(Boolean);
  const firstQuestion=lines.findIndex(line=>QUESTION_START_RE.test(line));
  // 問題番号が見つかったページは、それ以前をタイトル・氏名欄などとして除外。
  if(firstQuestion>=0)lines=lines.slice(firstQuestion);
  let current=[];
  for(const line of lines){
   if(QUESTION_START_RE.test(line)){
    if(current.length)blocks.push(current.join('\n').trim());
    current=[line];
   }else if(current.length){
    // 問題開始後の「答え」、脚注、ページ番号等は登録対象にしない。
    if(!isLikelyFooterOrNote(line))current.push(line);
   }
  }
  if(current.length)blocks.push(current.join('\n').trim());
 }
 // 問題番号をまったく認識できなかったときだけ、空行区切りをフォールバックにする。
 if(!blocks.length){
  return String(raw||'').split(/\n\s*\n+/).map(x=>x.trim()).filter(x=>x&&!isLikelyFooterOrNote(x));
 }
 return blocks;
}
function inferImportedQuestion(block){
 const lines=String(block||'').split('\n').map(normalizeOcrLine).filter(Boolean).filter(x=>!isLikelyFooterOrNote(x));
 if(!lines.length)return newImportQuestion('');
 lines[0]=stripQuestionNumber(lines[0]);
 const choices=[];const body=[];
 for(const line of lines){
  const m=line.match(CHOICE_RE);
  if(m&&body.length){choices.push(compactJapaneseSpacing(m[4]));}
  else body.push(compactJapaneseSpacing(line));
 }
 const questionText=compactJapaneseSpacing(body.join(' '));
 const q=newImportQuestion(questionText);
 if(choices.length>=2){
  q.type='choice';q.choices=choices.slice(0,4);while(q.choices.length<4)q.choices.push('');q.answer=0;
 }else if(/(?:説明|理由|根拠|考え|述べ|文章で|詳しく|なぜ)/.test(questionText)){
  q.type='text';q.modelAnswer='';
 }else{
  q.type='word';q.answers=[''];
 }
 return q;
}
function splitRecognizedText(){
 const text=document.getElementById('ocrText').value.trim();
 if(!text){alert('先に読み取り結果または手入力の文章を用意してください。');return}
 const blocks=extractQuestionBlocks(text);
 state.importQuestions=blocks.map(inferImportedQuestion).filter(q=>q.question.trim());
 const status=document.getElementById('ocrStatus');
 if(status)status.textContent=state.importQuestions.length
  ?`問題番号を基準に${state.importQuestions.length}問へ分割しました。タイトル・氏名欄・「答え」・ページ番号は除外しています。問題文・解答形式・正解を確認して修正してください。`
  :'問題を自動抽出できませんでした。OCR結果を修正するか「＋ 問題を手動追加」を使ってください。';
 renderImportQuestions();
}
function renderImportQuestions(){const el=document.getElementById('importQuestionEditor');el.innerHTML='';state.importQuestions.forEach((q,idx)=>{const card=document.createElement('div');card.className='import-question-card';card.innerHTML=`<div class="import-question-head"><strong>問題 ${idx+1}</strong><button type="button" class="remove-question" aria-label="問題を削除">削除</button></div><label>解答形式<select data-iq="type"><option value="choice" ${q.type==='choice'?'selected':''}>単一選択</option><option value="multi" ${q.type==='multi'?'selected':''}>複数選択</option><option value="reorder" ${q.type==='reorder'?'selected':''}>並べ替え</option><option value="fill" ${q.type==='fill'?'selected':''}>穴埋め</option><option value="word" ${q.type==='word'?'selected':''}>単語・短答</option><option value="text" ${q.type==='text'?'selected':''}>文章・記述</option></select></label><textarea data-iq="question" rows="3" placeholder="問題文">${escapeHtml(q.question)}</textarea><div data-type-area></div><textarea data-iq="explanation" rows="2" placeholder="解説（任意）">${escapeHtml(q.explanation)}</textarea>`;
 const renderType=()=>{const a=card.querySelector('[data-type-area]');a.innerHTML='';a.className='';
  if(q.type==='choice'){q.choices=q.choices?.length?q.choices:['','','',''];a.className='choice-editor';a.innerHTML=q.choices.map((c,i)=>`<label><input type="radio" name="ans-${q.id}" value="${i}" ${q.answer===i?'checked':''}><input type="text" data-choice="${i}" value="${escapeAttr(c)}" placeholder="選択肢 ${String.fromCharCode(65+i)}"></label>`).join('');a.querySelectorAll('[data-choice]').forEach(x=>x.oninput=e=>q.choices[Number(e.target.dataset.choice)]=e.target.value);a.querySelectorAll('input[type=radio]').forEach(x=>x.onchange=e=>q.answer=Number(e.target.value));}
  else if(q.type==='multi'){q.choices=q.choices?.length?q.choices:['','','',''];const selected=new Set((q.answers||[]).filter(Number.isInteger));a.className='choice-editor';a.innerHTML=q.choices.map((c,i)=>`<label><input type="checkbox" data-multi-answer="${i}" ${selected.has(i)?'checked':''}><input type="text" data-choice="${i}" value="${escapeAttr(c)}" placeholder="選択肢 ${String.fromCharCode(65+i)}"></label>`).join('');a.querySelectorAll('[data-choice]').forEach(x=>x.oninput=e=>q.choices[Number(e.target.dataset.choice)]=e.target.value);a.querySelectorAll('[data-multi-answer]').forEach(x=>x.onchange=()=>q.answers=[...a.querySelectorAll('[data-multi-answer]:checked')].map(y=>Number(y.dataset.multiAnswer)));}
  else if(q.type==='reorder'){a.innerHTML=`<label>正しい順番の語句（ | で区切る）<input type="text" data-reorder-items value="${escapeAttr((q.items||[]).filter(Boolean).join(' | '))}" placeholder="例：I | have | lived | here | ."></label><p class="help">登録した順番が正解になります。出題時は自動でシャッフルされます。</p>`;a.querySelector('[data-reorder-items]').oninput=e=>{q.items=e.target.value.split('|').map(x=>x.trim()).filter(Boolean);q.answerOrder=q.items.map((_,i)=>i);};}
  else if(q.type==='fill'){a.innerHTML=`<label>空欄ごとの正解（空欄は ; 区切り、別解は | 区切り）<input type="text" data-fill-answers value="${escapeAttr((q.blanks||[]).map(v=>(Array.isArray(v)?v:[v]).join(' | ')).join(' ; '))}" placeholder="例：has ; finished　/　that | which"></label>`;a.querySelector('[data-fill-answers]').oninput=e=>q.blanks=e.target.value.split(';').map(part=>part.split('|').map(x=>x.trim()).filter(Boolean)).filter(a=>a.length);}
  else if(q.type==='word'){a.innerHTML=`<label>正解（複数ある場合は | で区切る）<input type="text" data-answer-word value="${escapeAttr((q.answers||[]).filter(x=>typeof x==='string').join(' | '))}" placeholder="例：源頼朝 | みなもとのよりとも"></label>`;a.querySelector('[data-answer-word]').oninput=e=>q.answers=e.target.value.split('|').map(x=>x.trim()).filter(Boolean);}
  else{a.innerHTML=`<label>模範解答<textarea data-model-answer rows="4" placeholder="文章・記述問題の模範解答">${escapeHtml(q.modelAnswer||'')}</textarea></label>`;a.querySelector('[data-model-answer]').oninput=e=>q.modelAnswer=e.target.value;}};
 card.querySelector('[data-iq="question"]').oninput=e=>q.question=e.target.value;card.querySelector('[data-iq="explanation"]').oninput=e=>q.explanation=e.target.value;card.querySelector('[data-iq="type"]').onchange=e=>{q.type=e.target.value;renderType()};card.querySelector('.remove-question').onclick=()=>{state.importQuestions.splice(idx,1);renderImportQuestions()};renderType();el.append(card)});}
function escapeHtml(v){return String(v).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))}
function escapeAttr(v){return escapeHtml(v).replace(/"/g,'&quot;')}
document.getElementById('splitQuestions').onclick=splitRecognizedText;document.getElementById('addImportQuestion').onclick=()=>{state.importQuestions.push(newImportQuestion());renderImportQuestions()};
function releaseImportedObjectUrls(){importedObjectUrls.forEach(url=>URL.revokeObjectURL(url));importedObjectUrls=[];}
function renderImportPreview(message='取り込んだページを確認してください。文字がぼやけている場合は撮り直してください。'){
 const area=document.getElementById('previewArea'),list=document.getElementById('pagePreviewList'),summary=document.getElementById('fileSummary');
 list.innerHTML='';
 state.importPages.forEach((page,i)=>{const card=document.createElement('div');card.className='page-preview-card';const img=document.createElement('img');img.src=page.src;img.alt=`取り込みページ ${i+1}`;const cap=document.createElement('small');cap.textContent=page.label||`${i+1}ページ目`;card.append(img,cap);list.append(card)});
 area.hidden=!state.importPages.length;
 summary.textContent=state.importPages.length?`${state.importPages.length}ページを取り込みました。`:'';
 document.getElementById('imageStatus').textContent=state.importPages.length?message:'';
}
function clearPreview(){releaseImportedObjectUrls();state.importPages=[];document.getElementById('previewArea').hidden=true;document.getElementById('pagePreviewList').innerHTML='';document.getElementById('fileSummary').textContent='';document.getElementById('paperImage').value='';document.getElementById('imageStatus').textContent='';}
function addObjectUrl(file,label){const url=URL.createObjectURL(file);importedObjectUrls.push(url);state.importPages.push({src:url,label,type:'image'});}
function loadScriptOnce(src,key){return new Promise(resolve=>{if(key&&window[key]){resolve(true);return}const existing=[...document.scripts].find(s=>s.src===src);if(existing){if(existing.dataset.loaded==='1')resolve(true);else{existing.addEventListener('load',()=>resolve(true),{once:true});existing.addEventListener('error',()=>resolve(false),{once:true})}return}const sc=document.createElement('script');sc.src=src;sc.crossOrigin='anonymous';sc.onload=()=>{sc.dataset.loaded='1';resolve(true)};sc.onerror=()=>resolve(false);document.head.append(sc)});}
async function loadPdfLibrary(){
 if(window.pdfjsLib)return true;
 const status=document.getElementById('imageStatus');
 status.textContent='PDF読み込みライブラリを準備しています…';
 const sources=[
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/',
  'https://unpkg.com/pdfjs-dist@3.11.174/'
 ];
 for(const root of sources){
  const ok=await loadScriptOnce(root+'build/pdf.min.js','pdfjsLib');
  if(ok&&window.pdfjsLib){
   state.pdfAssetBase=root;
   state.pdfWorkerUrl=root+'build/pdf.worker.min.js';
   if(window.pdfjsLib.GlobalWorkerOptions)window.pdfjsLib.GlobalWorkerOptions.workerSrc=state.pdfWorkerUrl;
   return true;
  }
 }
 return false;
}

function pdfCanvasLooksTextless(ctx,canvas){
 // ページ全体を軽くサンプリングし、黒〜濃灰色の画素が極端に少ない場合だけ
 // テキスト再描画を行う。罫線だけのページを文字なしと判定しやすくする。
 try{
  const sample=document.createElement('canvas');
  const sw=Math.min(220,canvas.width),sh=Math.max(1,Math.round(canvas.height*(sw/canvas.width)));
  sample.width=sw;sample.height=sh;
  const sctx=sample.getContext('2d',{willReadFrequently:true});
  sctx.drawImage(canvas,0,0,sw,sh);
  const data=sctx.getImageData(0,0,sw,sh).data;
  let dark=0,total=0;
  for(let i=0;i<data.length;i+=16){
   const r=data[i],g=data[i+1],b=data[i+2];
   if(r<175&&g<175&&b<175)dark++;
   total++;
  }
  return total===0||dark/total<0.006;
 }catch(_){return true}
}
function overlayPdfText(ctx,viewport,textContent){
 const util=window.pdfjsLib?.Util;if(!util||!textContent?.items)return;
 ctx.save();
 ctx.fillStyle='#111';
 ctx.textBaseline='alphabetic';
 for(const item of textContent.items){
  const str=(item.str||'');if(!str.trim())continue;
  const tx=util.transform(viewport.transform,item.transform);
  const fontSize=Math.max(7,Math.hypot(tx[2],tx[3])||Math.hypot(tx[0],tx[1])||12);
  const x=tx[4],y=tx[5];
  ctx.save();
  ctx.translate(x,y);
  // PDFのテキスト座標をcanvas向けに補正し、日本語を描ける一般フォントへ置換。
  ctx.scale(1,-1);
  ctx.font=`${fontSize}px "Yu Gothic","Meiryo","Noto Sans CJK JP",sans-serif`;
  ctx.fillText(str,0,0);
  ctx.restore();
 }
 ctx.restore();
}

async function renderPdfFile(file){
 const ok=await loadPdfLibrary();if(!ok)throw new Error('PDF.jsを読み込めませんでした。ネットワーク制限を確認してください。');
 const data=new Uint8Array(await file.arrayBuffer());
 const assetBase=state.pdfAssetBase||'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/';
 const docOptions={
  data,
  cMapUrl:assetBase+'cmaps/',
  cMapPacked:true,
  standardFontDataUrl:assetBase+'standard_fonts/',
  useSystemFonts:true,
  useWorkerFetch:false,
  isEvalSupported:false
 };
 let pdf;
 try{
  pdf=await window.pdfjsLib.getDocument(docOptions).promise;
 }catch(firstError){
  console.warn('PDF.js primary source failed',firstError);
  // 配信元固有のCMap/フォント取得失敗を想定して、予備CDNへ切り替えて1度だけ再試行する。
  const fallbackRoot=(assetBase.includes('jsdelivr'))?'https://unpkg.com/pdfjs-dist@3.11.174/':'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/';
  const retryOptions={...docOptions,cMapUrl:fallbackRoot+'cmaps/',standardFontDataUrl:fallbackRoot+'standard_fonts/'};
  pdf=await window.pdfjsLib.getDocument(retryOptions).promise;
 }
 if(pdf.numPages>20)throw new Error('PDFは20ページ以下にしてください。');
 for(let n=1;n<=pdf.numPages;n++){
  document.getElementById('imageStatus').textContent=`PDFをページ画像へ変換しています… ${n}/${pdf.numPages}`;
  const page=await pdf.getPage(n);
  const baseViewport=page.getViewport({scale:1});
  const scale=Math.max(1.5,Math.min(2.5,2000/baseViewport.width));
  const viewport=page.getViewport({scale});
  const canvas=document.createElement('canvas');
  canvas.width=Math.ceil(viewport.width);
  canvas.height=Math.ceil(viewport.height);
  const ctx=canvas.getContext('2d',{alpha:false,willReadFrequently:true});
  if(!ctx)throw new Error(`${n}ページ目の描画領域を作成できませんでした。`);
  ctx.save();
  ctx.fillStyle='#ffffff';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.restore();
  await page.render({canvasContext:ctx,viewport,intent:'display'}).promise;

  // 一部の日本語PDFはフォントを埋め込まず、文字コードだけを保持している。
  // その場合PDF.jsは罫線等を描けても本文のグリフを描けないことがあるため、
  // 取得できるテキスト情報を使って汎用の日本語フォントで文字を再描画する。
  try{
   const textContent=await page.getTextContent({includeMarkedContent:false});
   const chars=textContent.items?.reduce((n,item)=>n+(item.str||'').trim().length,0)||0;
   if(chars>0&&pdfCanvasLooksTextless(ctx,canvas)){
    overlayPdfText(ctx,viewport,textContent);
    console.info(`PDF ${n}ページ目: フォント描画フォールバックを使用しました。`);
   }
  }catch(textError){
   console.warn(`PDF ${n}ページ目のテキスト補完に失敗しました。`,textError);
  }

  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(page.cleanup)page.cleanup(false);
  if(!blob)throw new Error(`${n}ページ目の画像化に失敗しました。`);
  const url=URL.createObjectURL(blob);
  importedObjectUrls.push(url);
  state.importPages.push({src:url,label:`${file.name} - ${n}/${pdf.numPages}ページ`,type:'pdf-page'});
 }
 if(typeof pdf.destroy==='function')await pdf.destroy();
}
async function handleImportFiles(fileList){
 const files=[...fileList];if(!files.length)return;
 clearPreview();const status=document.getElementById('imageStatus');document.getElementById('previewArea').hidden=false;status.textContent='ファイルを確認しています…';
 try{
  for(const file of files){
   const isPdf=file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf');
   if(isPdf){if(file.size>30*1024*1024)throw new Error('PDFは30MB以下にしてください。');await renderPdfFile(file);}
   else if(file.type.startsWith('image/')){if(file.size>12*1024*1024)throw new Error('画像は1枚12MB以下にしてください。');addObjectUrl(file,file.name);}
   else throw new Error('PDF / JPG / PNG / WEBPなどの画像ファイルを選んでください。');
  }
  renderImportPreview('取り込み完了です。ページの向きや文字の鮮明さを確認してからOCRを実行してください。');
 }catch(error){console.error(error);clearPreview();document.getElementById('previewArea').hidden=false;document.getElementById('imageStatus').textContent='読み込み失敗：'+(error?.message||String(error));}
}
const paperInput=document.getElementById('paperImage');
paperInput.addEventListener('change',e=>handleImportFiles(e.target.files));
const dropZone=document.getElementById('dropZone');
['dragenter','dragover'].forEach(type=>dropZone.addEventListener(type,e=>{e.preventDefault();e.stopPropagation();dropZone.classList.add('dragover')}));
['dragleave','drop'].forEach(type=>dropZone.addEventListener(type,e=>{e.preventDefault();e.stopPropagation();dropZone.classList.remove('dragover')}));
dropZone.addEventListener('drop',e=>handleImportFiles(e.dataTransfer.files));
dropZone.addEventListener('click',()=>paperInput.click());
dropZone.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();paperInput.click();}});
document.getElementById('openCamera').onclick=()=>openCamera();document.getElementById('closeCamera').onclick=()=>closeCamera();document.getElementById('retakePhoto').onclick=()=>openCamera();document.getElementById('clearPhoto').onclick=clearPreview;document.getElementById('switchCamera').onclick=async()=>{facingMode=facingMode==='environment'?'user':'environment';await startCamera();};document.getElementById('takePhoto').onclick=takePhoto;
async function openCamera(){const modal=document.getElementById('cameraModal');modal.hidden=false;document.body.style.overflow='hidden';await startCamera();}
async function startCamera(){const status=document.getElementById('cameraStatus');if(!navigator.mediaDevices?.getUserMedia){status.textContent='このブラウザではカメラ撮影を利用できません。「画像・PDFを選ぶ」を使ってください。';return}stopCamera();status.textContent='カメラを起動しています…';try{cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:facingMode},width:{ideal:1920},height:{ideal:1080}},audio:false});const video=document.getElementById('cameraVideo');video.srcObject=cameraStream;await video.play();status.textContent='紙全体を枠の中に入れ、影や反射が少ない状態で撮影してください。';}catch(error){console.error(error);status.textContent=error?.name==='NotAllowedError'?'カメラの使用が許可されていません。ブラウザのカメラ権限を確認するか、「画像・PDFを選ぶ」を使ってください。':'カメラを起動できませんでした。「画像・PDFを選ぶ」を使ってください。';}}
function stopCamera(){if(cameraStream){cameraStream.getTracks().forEach(track=>track.stop());cameraStream=null;}const video=document.getElementById('cameraVideo');if(video)video.srcObject=null;}
function closeCamera(){stopCamera();document.getElementById('cameraModal').hidden=true;document.body.style.overflow='';}
function takePhoto(){const video=document.getElementById('cameraVideo');if(!cameraStream||!video.videoWidth){document.getElementById('cameraStatus').textContent='カメラ映像を取得できていません。';return}const canvas=document.getElementById('captureCanvas');const maxWidth=1800;const scale=Math.min(1,maxWidth/video.videoWidth);canvas.width=Math.round(video.videoWidth*scale);canvas.height=Math.round(video.videoHeight*scale);const ctx=canvas.getContext('2d');ctx.drawImage(video,0,0,canvas.width,canvas.height);canvas.toBlob(blob=>{if(!blob){document.getElementById('cameraStatus').textContent='撮影画像を作成できませんでした。';return}clearPreview();const url=URL.createObjectURL(blob);importedObjectUrls.push(url);state.importPages=[{src:url,label:'カメラ撮影',type:'camera'}];renderImportPreview('撮影した画像です。問題文が読めるか確認し、必要なら「カメラで撮り直す」を押してください。');closeCamera();},'image/jpeg',0.9);}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopCamera();});window.addEventListener('beforeunload',()=>{stopCamera();releaseImportedObjectUrls()});
async function loadOcrLibrary(){
 if(window.Tesseract)return true;
 const status=document.getElementById('ocrStatus');
 status.textContent='OCRライブラリを読み込んでいます…';
 const sources=[
  'https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js',
  'https://unpkg.com/tesseract.js@7.0.0/dist/tesseract.min.js'
 ];
 for(const src of sources){
  const ok=await loadScriptOnce(src,'Tesseract');
  if(ok&&window.Tesseract){state.ocrScriptUrl=src;return true;}
 }
 return false;
}
document.getElementById('runOcr').onclick=async()=>{
 if(!state.importPages.length){alert('先に紙テストを撮影するか、画像・PDFを選んでください。');return}
 const ok=await loadOcrLibrary();if(!ok){document.getElementById('ocrStatus').textContent='OCRを読み込めませんでした。学校ネットワーク等で外部ライブラリが制限されている場合は手入力してください。';return}
 const btn=document.getElementById('runOcr'),prog=document.getElementById('ocrProgress'),status=document.getElementById('ocrStatus');btn.disabled=true;prog.hidden=false;prog.value=0;
 try{
  const total=state.importPages.length;const worker=await Tesseract.createWorker('jpn+eng',1,{logger:m=>{if(m.progress!=null){const base=Number(btn.dataset.pageIndex||0);const pct=Math.round(((base+m.progress)/total)*100);prog.value=pct;status.textContent=`文字を読み取っています… ${base+1}/${total}ページ (${pct}%)`;}}});
  const texts=[];
  for(let i=0;i<total;i++){btn.dataset.pageIndex=String(i);const ret=await worker.recognize(state.importPages[i].src);const text=(ret.data.text||'').trim();texts.push(total>1?`--- ${i+1}ページ目 ---\n${text}`:text);prog.value=Math.round(((i+1)/total)*100);}
  await worker.terminate();delete btn.dataset.pageIndex;document.getElementById('ocrText').value=texts.join('\n\n');status.textContent=`${total}ページの読み取りが終わりました。誤字や抜けを修正してから問題に分割してください。`;
 }catch(e){console.error(e);status.textContent='OCRに失敗しました。ページを確認するか、手入力で修正してください。';}
 finally{btn.disabled=false;prog.hidden=true;delete btn.dataset.pageIndex;}
};
function selectedPublisherForImportedQuestion(subject,field){
 const part=subject==='social'&&['geography','history','civics'].includes(field)?field:subject==='tech-home'&&['technology','home'].includes(field)?field:subject==='japanese'?'language':subject==='music'?'general':'main';
 const publisher=subjectAdoption(subject)?.[part]||'';return {part,publisher};
}
function updateImportTextbookHint(){
 const sel=document.getElementById('importTextbookScope'),hint=document.getElementById('importTextbookHint');if(!sel||!hint)return;
 const subject=document.getElementById('importSubject')?.value||'',field=document.getElementById('importField')?.value||'';const info=selectedPublisherForImportedQuestion(subject,field);
 sel.disabled=!subject||!info.publisher;if(!info.publisher&&sel.value==='current')sel.value='common';
 const materialWrap=document.getElementById('importMaterialWrap'),materialSel=document.getElementById('importMaterial');
 const supportsMaterial=['japanese','english'].includes(subject)&&!!info.publisher;
 if(materialWrap)materialWrap.hidden=!supportsMaterial;
 if(materialSel){const prev=materialSel.value;materialSel.innerHTML=supportsMaterial?materialOptionsHtml(subject,state.importGrade,info.publisher,prev):'<option value="">教材 / Unitを指定しない</option>';if(![...materialSel.options].some(o=>o.value===prev))materialSel.value='';}
 hint.textContent=info.publisher?`「現在の教科書に限定」を選ぶと ${publisherLabel(info.publisher)} の問題として登録します。${supportsMaterial?' 教材 / Unitを指定すると、その教材専用問題として優先出題されます。':''}`:'教科書設定がないため、この問題は共通問題として登録されます。';
}
document.getElementById('saveDraft').onclick=()=>{const draft={createdAt:new Date().toISOString(),grade:state.importGrade,subject:document.getElementById('importSubject').value,field:document.getElementById('importField').value,unit:document.getElementById('importUnit').value,text:document.getElementById('ocrText').value,questions:state.importQuestions};const drafts=JSON.parse(localStorage.getItem('paperDrafts')||'[]');drafts.push({...draft,id:crypto.randomUUID?.()||String(Date.now()),status:'draft'});localStorage.setItem('paperDrafts',JSON.stringify(drafts.slice(-50)));document.getElementById('draftStatus').textContent='編集途中の内容をこの端末に保存しました。';};
document.getElementById('saveQuestions').onclick=()=>{const subject=document.getElementById('importSubject').value,field=document.getElementById('importField').value,unit=document.getElementById('importUnit').value;if(!subject||!unit){document.getElementById('draftStatus').textContent='学年・教科・分野・単元を選んでください。';return}const valid=state.importQuestions.filter(q=>q.question.trim()&&((q.type==='choice'&&q.choices?.every(c=>c.trim()))||(q.type==='multi'&&q.choices?.every(c=>c.trim())&&(q.answers||[]).length)||(q.type==='reorder'&&(q.items||[]).filter(Boolean).length>=2)||(q.type==='fill'&&(q.blanks||[]).length&&(q.blanks||[]).every(a=>(Array.isArray(a)?a:[a]).filter(Boolean).length))||(q.type==='word'&&acceptedTextAnswers(q).length)||(q.type==='text'&&q.modelAnswer.trim())));if(!valid.length){document.getElementById('draftStatus').textContent='問題文と、選んだ解答形式に必要な正解を入力してください。';return}const custom=loadCustomQuestions();const now=Date.now();const scope=document.getElementById('importTextbookScope')?.value||'common';const textbook=selectedPublisherForImportedQuestion(subject,field);const materialId=document.getElementById('importMaterial')?.value||'';valid.forEach((q,i)=>{const item={id:`custom-${now}-${i}`,grades:[state.importGrade],subject,field,unit,type:q.type,difficulty:1,question:q.question.trim(),explanation:q.explanation.trim()||'紙テストから登録した問題です。',source:'paper',createdAt:new Date().toISOString(),textbookPublisher:(scope==='current'||materialId)&&textbook.publisher?textbook.publisher:'common'};if((scope==='current'||materialId)&&textbook.publisher)item.textbookComponent=textbook.part;if(materialId)item.materialIds=[materialId];if(q.type==='choice')Object.assign(item,{choices:q.choices.map(c=>c.trim()),answer:q.answer});else if(q.type==='multi')Object.assign(item,{choices:q.choices.map(c=>c.trim()),answers:(q.answers||[]).map(Number)});else if(q.type==='reorder'){const items=(q.items||[]).map(x=>x.trim()).filter(Boolean);Object.assign(item,{items,answerOrder:items.map((_,i)=>i)});}else if(q.type==='fill')Object.assign(item,{blanks:(q.blanks||[]).map(a=>(Array.isArray(a)?a:[a]).map(x=>String(x).trim()).filter(Boolean))});else if(q.type==='word')Object.assign(item,{answers:acceptedTextAnswers(q)});else Object.assign(item,{modelAnswer:q.modelAnswer.trim()});custom.push(item)});saveCustomQuestions(custom);document.getElementById('draftStatus').textContent=`${valid.length}問を問題バンクへ登録しました。${scope==='current'&&textbook.publisher?` ${publisherLabel(textbook.publisher)}専用として保存しました。`:''} 登録問題の管理から編集・削除できます。`;state.importQuestions=[];renderImportQuestions();};

function fillManageSubjects(){const sel=document.getElementById('manageSubject');if(!sel||!state.curriculum)return;sel.innerHTML='<option value="all">すべての教科</option>';state.curriculum.subjects.forEach(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=`${s.icon} ${s.name}`;sel.append(o)});sel.onchange=renderManageQuestions;}
function openManage(){showView('manageView');renderManageQuestions();}
function unitNameFor(q){for(const s of state.curriculum.subjects){for(const f of s.fields){const u=f.units.find(x=>x.id===q.unit);if(u)return `${f.name} ＞ ${u.name}`}}return q.unit||'';}
function renderManageQuestions(){const list=document.getElementById('manageQuestionList');if(!list)return;const filter=document.getElementById('manageSubject')?.value||'all';const items=loadCustomQuestions().filter(q=>filter==='all'||q.subject===filter);document.getElementById('manageSummary').textContent=`登録済み ${items.length}問`;list.innerHTML='';if(!items.length){list.innerHTML='<div class="step-card"><p class="help">登録した問題はまだありません。</p></div>';return}items.slice().reverse().forEach(q=>{const s=state.curriculum.subjects.find(x=>x.id===q.subject);const card=document.createElement('div');card.className='manage-question-card';const textbookNote=q.textbookPublisher&&q.textbookPublisher!=='common'?`・${publisherLabel(q.textbookPublisher)}限定`:'・共通';const materialNote=questionMaterialIds(q).length?`・教材「${questionMaterialIds(q).map(materialTitleById).join(' / ')}」`:'';card.innerHTML=`<div class="manage-question-meta"><span>${s?.icon||''} 中${q.grades?.[0]||''}・${escapeHtml(s?.name||q.subject)}${escapeHtml(textbookNote+materialNote)}</span><span class="type-badge">${q.type==='choice'?'単一選択':q.type==='multi'?'複数選択':q.type==='reorder'?'並べ替え':q.type==='fill'?'穴埋め':q.type==='word'?'短答':'記述'}</span></div><strong>${escapeHtml(q.question)}</strong><small>${escapeHtml(unitNameFor(q))}</small><div class="manage-actions"><button class="secondary" data-edit>編集</button><button class="danger" data-delete>削除</button></div>`;card.querySelector('[data-edit]').onclick=()=>openManageEdit(q.id);card.querySelector('[data-delete]').onclick=()=>deleteManagedQuestion(q.id);list.append(card)});}
function deleteManagedQuestion(id){const q=loadCustomQuestions().find(x=>x.id===id);if(!q)return;if(!confirm(`「${q.question}」を削除しますか？`))return;saveCustomQuestions(loadCustomQuestions().filter(x=>x.id!==id));const missed=JSON.parse(localStorage.getItem('missedQuestions')||'[]').filter(x=>x.questionId!==id);localStorage.setItem('missedQuestions',JSON.stringify(missed));renderManageQuestions();renderQuiz();}
function openManageEdit(id){state.manageEditId=id;showView('manageEditView');renderManageEditForm();}
function renderManageEditForm(){const q=loadCustomQuestions().find(x=>x.id===state.manageEditId);const host=document.getElementById('manageEditForm');if(!q){host.innerHTML='<p>問題が見つかりません。</p>';return}const subjects=state.curriculum.subjects.map(s=>`<option value="${s.id}" ${s.id===q.subject?'selected':''}>${s.icon} ${s.name}</option>`).join('');host.innerHTML=`<label>学年<select id="meGrade"><option value="1" ${q.grades?.includes(1)?'selected':''}>中1</option><option value="2" ${q.grades?.includes(2)?'selected':''}>中2</option><option value="3" ${q.grades?.includes(3)?'selected':''}>中3</option></select></label><label>教科<select id="meSubject">${subjects}</select></label><label>単元<select id="meUnit"></select></label><label>教科書との関係<select id="meTextbookScope"><option value="common" ${!q.textbookPublisher||q.textbookPublisher==='common'?'selected':''}>共通問題</option><option value="current" ${q.textbookPublisher&&q.textbookPublisher!=='common'?'selected':''}>現在設定中の教科書に限定</option></select></label><p id="meTextbookHint" class="help"></p><label id="meMaterialWrap"><strong>教材 / Unit（任意）</strong><select id="meMaterial"><option value="">教材 / Unitを指定しない</option></select></label><label>解答形式<select id="meType"><option value="choice" ${q.type==='choice'?'selected':''}>単一選択</option><option value="multi" ${q.type==='multi'?'selected':''}>複数選択</option><option value="reorder" ${q.type==='reorder'?'selected':''}>並べ替え</option><option value="fill" ${q.type==='fill'?'selected':''}>穴埋め</option><option value="word" ${q.type==='word'?'selected':''}>単語・短答</option><option value="text" ${q.type==='text'?'selected':''}>文章・記述</option></select></label><label>問題文<textarea id="meQuestion" rows="4">${escapeHtml(q.question)}</textarea></label><div id="meAnswerArea"></div><label>解説<textarea id="meExplanation" rows="3">${escapeHtml(q.explanation||'')}</textarea></label>`;const updateMeTextbook=()=>{const sid=document.getElementById('meSubject').value,unit=document.getElementById('meUnit').value,field=fieldIdForUnit(sid,unit),grade=Number(document.getElementById('meGrade').value);const info=selectedPublisherForImportedQuestion(sid,field);const scope=document.getElementById('meTextbookScope'),hint=document.getElementById('meTextbookHint'),material=document.getElementById('meMaterial'),wrap=document.getElementById('meMaterialWrap');if(scope){scope.disabled=!info.publisher;if(!info.publisher&&scope.value==='current')scope.value='common';}const supports=['japanese','english'].includes(sid)&&!!info.publisher;if(wrap)wrap.hidden=!supports;if(material){const current=material.value||questionMaterialIds(q)[0]||'';material.innerHTML=supports?materialOptionsHtml(sid,grade,info.publisher,current):'<option value="">教材 / Unitを指定しない</option>';if([...material.options].some(o=>o.value===current))material.value=current;}if(hint)hint.textContent=info.publisher?`限定すると ${publisherLabel(info.publisher)} の問題として保存します。${supports?' 教材 / Unitを指定すると専用問題になります。':''}`:'現在の教科書設定がないため共通問題として保存します。';};const populateUnits=()=>{const sid=document.getElementById('meSubject').value,g=Number(document.getElementById('meGrade').value),sel=document.getElementById('meUnit');sel.innerHTML='';const sub=state.curriculum.subjects.find(s=>s.id===sid);sub?.fields.forEach(f=>f.units.filter(u=>u.grades.includes(g)).forEach(u=>{const o=document.createElement('option');o.value=u.id;o.textContent=`${f.name} ＞ ${u.name}`;if(u.id===q.unit)o.selected=true;sel.append(o)}));sel.onchange=updateMeTextbook;updateMeTextbook();};const renderAns=()=>{const a=document.getElementById('meAnswerArea'),t=document.getElementById('meType').value;
 if(t==='choice'){const choices=q.choices||['','','',''];a.innerHTML=`<p><strong>選択肢・正解</strong></p>${choices.map((c,i)=>`<label class="manage-choice"><input type="radio" name="meAns" value="${i}" ${(q.answer??0)===i?'checked':''}><input type="text" data-me-choice="${i}" value="${escapeAttr(c)}"></label>`).join('')}`;}
 else if(t==='multi'){const choices=q.choices||['','','',''];const ans=new Set((q.answers||[]).filter(Number.isInteger));a.innerHTML=`<p><strong>選択肢・正解（複数チェック可）</strong></p>${choices.map((c,i)=>`<label class="manage-choice"><input type="checkbox" data-me-multi="${i}" ${ans.has(i)?'checked':''}><input type="text" data-me-choice="${i}" value="${escapeAttr(c)}"></label>`).join('')}`;}
 else if(t==='reorder'){a.innerHTML=`<label>正しい順番の語句（ | 区切り）<input id="meReorder" type="text" value="${escapeAttr((q.items||[]).join(' | '))}"></label>`;}
 else if(t==='fill'){a.innerHTML=`<label>空欄ごとの正解（空欄は ;、別解は |）<input id="meFill" type="text" value="${escapeAttr((q.blanks||[]).map(v=>(Array.isArray(v)?v:[v]).join(' | ')).join(' ; '))}"></label>`;}
 else if(t==='word'){a.innerHTML=`<label>正解（ | 区切り）<input id="meWords" type="text" value="${escapeAttr(acceptedTextAnswers(q).join(' | '))}"></label>`;}
 else{a.innerHTML=`<label>模範解答<textarea id="meModel" rows="4">${escapeHtml(q.modelAnswer||'')}</textarea></label>`;}};document.getElementById('meSubject').onchange=populateUnits;document.getElementById('meGrade').onchange=populateUnits;document.getElementById('meType').onchange=renderAns;document.getElementById('meTextbookScope').onchange=updateMeTextbook;populateUnits();renderAns();}
document.getElementById('cancelManageEdit').onclick=document.getElementById('cancelManageEditTop').onclick=()=>{state.manageEditId=null;openManage();};
document.getElementById('saveManagedQuestion').onclick=()=>{const items=loadCustomQuestions(),q=items.find(x=>x.id===state.manageEditId);if(!q)return;const type=document.getElementById('meType').value,question=document.getElementById('meQuestion').value.trim(),unit=document.getElementById('meUnit').value;if(!question||!unit){document.getElementById('manageEditStatus').textContent='問題文と単元を入力してください。';return}q.grades=[Number(document.getElementById('meGrade').value)];q.subject=document.getElementById('meSubject').value;q.unit=unit;q.field=fieldIdForUnit(q.subject,unit);q.type=type;q.question=question;q.explanation=document.getElementById('meExplanation').value.trim();const meScope=document.getElementById('meTextbookScope').value;const meBook=selectedPublisherForImportedQuestion(q.subject,q.field);const meMaterial=document.getElementById('meMaterial')?.value||'';q.textbookPublisher=(meScope==='current'||meMaterial)&&meBook.publisher?meBook.publisher:'common';if(q.textbookPublisher!=='common')q.textbookComponent=meBook.part;else delete q.textbookComponent;if(meMaterial)q.materialIds=[meMaterial];else delete q.materialIds;delete q.materialId;delete q.choices;delete q.answer;delete q.answers;delete q.answerText;delete q.modelAnswer;delete q.items;delete q.answerOrder;delete q.blanks;if(type==='choice'){q.choices=[...document.querySelectorAll('[data-me-choice]')].map(x=>x.value.trim());q.answer=Number(document.querySelector('input[name="meAns"]:checked')?.value||0);if(q.choices.some(x=>!x)){document.getElementById('manageEditStatus').textContent='4つの選択肢を入力してください。';return}}
 else if(type==='multi'){q.choices=[...document.querySelectorAll('[data-me-choice]')].map(x=>x.value.trim());q.answers=[...document.querySelectorAll('[data-me-multi]:checked')].map(x=>Number(x.dataset.meMulti));if(q.choices.some(x=>!x)||!q.answers.length){document.getElementById('manageEditStatus').textContent='4つの選択肢と正解を1つ以上設定してください。';return}}
 else if(type==='reorder'){q.items=document.getElementById('meReorder').value.split('|').map(x=>x.trim()).filter(Boolean);q.answerOrder=q.items.map((_,i)=>i);if(q.items.length<2){document.getElementById('manageEditStatus').textContent='並べ替える語句を2つ以上入力してください。';return}}
 else if(type==='fill'){q.blanks=document.getElementById('meFill').value.split(';').map(part=>part.split('|').map(x=>x.trim()).filter(Boolean)).filter(a=>a.length);if(!q.blanks.length){document.getElementById('manageEditStatus').textContent='穴埋めの正解を入力してください。';return}}
 else if(type==='word'){q.answers=document.getElementById('meWords').value.split('|').map(x=>x.trim()).filter(Boolean);if(!q.answers.length){document.getElementById('manageEditStatus').textContent='正解を入力してください。';return}}
 else{q.modelAnswer=document.getElementById('meModel').value.trim();if(!q.modelAnswer){document.getElementById('manageEditStatus').textContent='模範解答を入力してください。';return}}q.updatedAt=new Date().toISOString();saveCustomQuestions(items);renderQuiz();document.getElementById('manageEditStatus').textContent='保存しました。';setTimeout(()=>openManage(),350);};


function renderEnvironmentCheck(){
 const box=document.getElementById('environmentCheck');
 if(!box)return;
 const secure=window.isSecureContext===true;
 const https=location.protocol==='https:';
 const localhost=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
 const fileMode=location.protocol==='file:';
 const rows=[
  {ok:https||localhost,label:'HTTPS / 安全な接続',detail:https?'HTTPSで接続中':(localhost?'localhostで開いています':'HTTPSではありません')},
  {ok:secure,label:'カメラ利用条件',detail:secure?'安全なコンテキストです':'カメラはHTTPSで利用してください'},
  {ok:!fileMode,label:'起動方法',detail:fileMode?'index.htmlの直接起動はPDF/OCR非対応です':'Webサーバー経由で起動しています'}
 ];
 box.innerHTML=rows.map(r=>`<div class="env-row ${r.ok?'ok':'ng'}"><span>${r.ok?'✓':'!'}</span><div><strong>${r.label}</strong><small>${r.detail}</small></div></div>`).join('');
 const notice=document.getElementById('runtimeNotice');
 if(fileMode&&notice){notice.classList.add('warning');notice.textContent='この画面は file:// で直接開かれています。PDF/OCR/カメラは正常動作しないため、Cloudflare PagesのHTTPS URLから利用してください。';}
}

init();
['importSubject','importField'].forEach(id=>document.getElementById(id)?.addEventListener('change',updateImportTextbookHint));document.getElementById('importTextbookScope')?.addEventListener('change',updateImportTextbookHint);updateImportTextbookHint();
renderEnvironmentCheck();
const envBtn=document.getElementById('runEnvironmentCheck');if(envBtn)envBtn.onclick=renderEnvironmentCheck;


// PWA / home-screen install
let deferredInstallPrompt = null;
function isStandaloneMode(){
 return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}
function isIosDevice(){return /iphone|ipad|ipod/i.test(navigator.userAgent)}
function isAndroidDevice(){return /android/i.test(navigator.userAgent)}
function updateInstallCard(){
 const card=document.getElementById('installCard');
 if(!card)return;
 if(isStandaloneMode()){card.hidden=true;return;}
 const mobile=isIosDevice()||isAndroidDevice()||window.matchMedia?.('(max-width: 820px)').matches;
 card.hidden=!mobile;
}
function showInstallInstructions(){
 const modal=document.getElementById('installModal');
 const box=document.getElementById('installInstructions');
 if(!modal||!box)return;
 if(isIosDevice()){
  box.innerHTML='<p><strong>iPhone / iPad</strong></p><ol><li>Safariでこのサイトを開きます。</li><li>画面下の「共有」ボタンを押します。</li><li>「ホーム画面に追加」を選びます。</li><li>右上の「追加」を押します。</li></ol><p class="help">Chromeなどで開いている場合は、Safariで開いてから追加してください。</p>';
 }else{
  box.innerHTML='<p><strong>ホーム画面への追加方法</strong></p><ol><li>ブラウザのメニューを開きます。</li><li>「アプリをインストール」または「ホーム画面に追加」を選びます。</li><li>確認画面で追加します。</li></ol>';
 }
 modal.hidden=false;document.body.style.overflow='hidden';
}
function closeInstallInstructions(){const modal=document.getElementById('installModal');if(modal)modal.hidden=true;document.body.style.overflow='';}
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstallPrompt=event;updateInstallCard();});
window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;updateInstallCard();});
document.getElementById('installApp')?.addEventListener('click',async()=>{
 if(deferredInstallPrompt){
  deferredInstallPrompt.prompt();
  try{await deferredInstallPrompt.userChoice}catch(_){ }
  deferredInstallPrompt=null;updateInstallCard();
 }else showInstallInstructions();
});
document.getElementById('closeInstallModal')?.addEventListener('click',closeInstallInstructions);
document.getElementById('installModal')?.addEventListener('click',e=>{if(e.target.id==='installModal')closeInstallInstructions();});
updateInstallCard();

if('serviceWorker' in navigator && location.protocol === 'https:'){
 window.addEventListener('load',async()=>{
  try{
   const reg=await navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'});
   await reg.update();
  }catch(err){console.warn('Service Worker registration failed',err)}
 });
}


// Data backup / transfer (v0.15)
const BACKUP_KEYS=[
 'lastQuizSelection','missedQuestions','studyHistory','examStudyLogs','examPlans','mockExamResults',
 'customQuestions','lastStudyDate','streakDays','paperDrafts','schoolTextbookPreference','textbookStudyRanges'
];
let pendingBackupData=null;
function safeJsonParse(value,fallback){try{return JSON.parse(value)}catch{return fallback}}
function backupDataSnapshot(){
 const data={};
 BACKUP_KEYS.forEach(key=>{const value=localStorage.getItem(key);if(value!==null)data[key]=value;});
 return data;
}
function backupSummaryFromData(data){
 const readArray=(key)=>{const v=data?.[key];if(v==null)return[];return safeJsonParse(v,[])||[]};
 return {
  history:readArray('studyHistory').length,
  missed:readArray('missedQuestions').length,
  custom:readArray('customQuestions').length,
  exams:readArray('examPlans').length,
  drafts:readArray('paperDrafts').length
 };
}
function openBackup(){showView('backupView');pendingBackupData=null;const p=document.getElementById('backupPreview');if(p)p.hidden=true;const a=document.getElementById('backupImportActions');if(a)a.hidden=true;const f=document.getElementById('backupFile');if(f)f.value='';document.getElementById('importBackupStatus').textContent='';}
function downloadBackup(){
 const payload={app:'30min-study',schemaVersion:1,appVersion:'0.29',exportedAt:new Date().toISOString(),data:backupDataSnapshot()};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');const d=new Date();const ymd=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
 a.href=url;a.download=`study-backup-${ymd}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 const sum=backupSummaryFromData(payload.data);document.getElementById('exportBackupStatus').textContent=`保存しました：学習履歴${sum.history}件・登録問題${sum.custom}問・定期テスト${sum.exams}件`;
}
function validateBackup(obj){
 if(!obj||obj.app!=='30min-study'||obj.schemaVersion!==1||typeof obj.data!=='object'||Array.isArray(obj.data))throw new Error('このアプリのバックアップ形式ではありません。');
 for(const key of Object.keys(obj.data)){if(!BACKUP_KEYS.includes(key))continue;if(typeof obj.data[key]!=='string')throw new Error('バックアップ内容が壊れています。');}
 return obj;
}
function renderBackupPreview(payload){
 const sum=backupSummaryFromData(payload.data);const el=document.getElementById('backupPreview');const when=payload.exportedAt?new Date(payload.exportedAt).toLocaleString('ja-JP'):'日時不明';
 el.innerHTML=`<strong>バックアップを確認</strong><dl class="backup-summary"><div><dt>作成日時</dt><dd>${escapeHtml(when)}</dd></div><div><dt>学習履歴</dt><dd>${sum.history}件</dd></div><div><dt>苦手問題</dt><dd>${sum.missed}問</dd></div><div><dt>登録問題</dt><dd>${sum.custom}問</dd></div><div><dt>定期テスト</dt><dd>${sum.exams}件</dd></div><div><dt>紙テスト下書き</dt><dd>${sum.drafts}件</dd></div></dl>`;
 el.hidden=false;document.getElementById('backupImportActions').hidden=false;
}
function uniqueMerge(current,incoming,keyFn){const map=new Map();[...current,...incoming].forEach(item=>{const key=keyFn(item);if(key!=null&&!map.has(key))map.set(key,item);else if(key==null)map.set(`anon-${map.size}`,item)});return [...map.values()]}
function mergeBackupData(data){
 const arrayKeys={
  missedQuestions:x=>x?.questionId,
  customQuestions:x=>x?.id,
  examPlans:x=>x?.id,
  examStudyLogs:x=>x?.id||`${x?.examId||''}|${x?.at||''}`,
  paperDrafts:x=>x?.id,
  mockExamResults:x=>x?.id||`${x?.examId||''}|${x?.at||''}`,
  studyHistory:x=>`${x?.at||''}|${x?.mode||''}|${x?.score??''}|${(x?.questionIds||[]).join(',')}`
 };
 Object.entries(arrayKeys).forEach(([key,keyFn])=>{const incoming=safeJsonParse(data[key]||'[]',[]);if(!Array.isArray(incoming)||!incoming.length)return;const current=safeJsonParse(localStorage.getItem(key)||'[]',[]);localStorage.setItem(key,JSON.stringify(uniqueMerge(current,incoming,keyFn).slice(key==='studyHistory'||key==='examStudyLogs'?-300:0)));});
 if(!localStorage.getItem('lastQuizSelection')&&data.lastQuizSelection)localStorage.setItem('lastQuizSelection',data.lastQuizSelection);
 if(!localStorage.getItem('schoolTextbookPreference')&&data.schoolTextbookPreference)localStorage.setItem('schoolTextbookPreference',data.schoolTextbookPreference);
 const curDate=localStorage.getItem('lastStudyDate')||'';const inDate=data.lastStudyDate||'';if(inDate>curDate){localStorage.setItem('lastStudyDate',inDate);if(data.streakDays)localStorage.setItem('streakDays',data.streakDays)}
}
function replaceBackupData(data){BACKUP_KEYS.forEach(k=>localStorage.removeItem(k));BACKUP_KEYS.forEach(k=>{if(typeof data[k]==='string')localStorage.setItem(k,data[k])});}
function refreshAfterBackup(){refreshQuestionBank();migrateTextbookPreference();initSchoolTextbookSettings();renderTextbookSettings();renderQuiz();fillImportSubjects();fillManageSubjects();renderExamPlanList();renderDailyPlanPreview();document.getElementById('streakDays').textContent=localStorage.getItem('streakDays')||0;}
document.getElementById('exportBackup')?.addEventListener('click',downloadBackup);
document.getElementById('backupFile')?.addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;try{if(file.size>5*1024*1024)throw new Error('バックアップファイルが大きすぎます（上限5MB）。');const text=await file.text();const obj=validateBackup(JSON.parse(text));pendingBackupData=obj;renderBackupPreview(obj);document.getElementById('importBackupStatus').textContent='内容を確認して、追加または置き換えを選んでください。';}catch(err){pendingBackupData=null;document.getElementById('backupPreview').hidden=true;document.getElementById('backupImportActions').hidden=true;document.getElementById('importBackupStatus').textContent=`読み込めませんでした：${err.message}`;}
});
document.getElementById('mergeBackup')?.addEventListener('click',()=>{if(!pendingBackupData)return;mergeBackupData(pendingBackupData.data);refreshAfterBackup();document.getElementById('importBackupStatus').textContent='現在のデータにバックアップを追加しました。';});
document.getElementById('replaceBackup')?.addEventListener('click',()=>{if(!pendingBackupData)return;if(!confirm('この端末に現在保存されている学習データを、選択したバックアップの内容で置き換えます。続けますか？'))return;replaceBackupData(pendingBackupData.data);refreshAfterBackup();document.getElementById('importBackupStatus').textContent='バックアップの内容でこの端末のデータを置き換えました。';});
