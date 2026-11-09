"""v0.47.5: rebuild 78 weak multi-select questions (social/english/science/math).

Problem: these items had 3 correct choices out of 4 and one absurd distractor, so a student
could score by "drop the odd one". Each group below gets plausible near-miss distractors,
a varied number of correct choices (1-3) and an explanation of every choice.

Reproducible and idempotent. Only the IDs listed below are touched; IDs, type, subject,
unit, grades and materialIds never change. Questions that were identical stay identical.
Each ID must currently be in its ORIGINAL state or already in the NEW state, otherwise the
script refuses to write. Writes data/questions.json (indent=2, ensure_ascii=False) and
regenerates data/questions.js.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Each group: ids, the original content (for the safety check) and the new content.
# 'stem' = (old suffix of the prompt, new suffix); the textbook prefix in front of it is kept.
# A group without 'stem' keeps its prompt unchanged.
GROUPS = [
    {   # english / passive
        'ids': ['v030_en_multi_01'],
        'old': {'choices': ["This book was written by Soseki.", "I wrote a letter yesterday.", "English is spoken in many countries.", "The window was opened this morning."],
                'answers': [0, 2, 3],
                'explanation': "be動詞 + 過去分詞で表す受け身は was written、is spoken、was opened です。"},
        'new': {'choices': ["This book was written by Soseki.", "She was writing a letter then.", "I wrote a letter yesterday.", "English is spoken in many countries.", "They have opened the window."],
                'answers': [0, 3],
                'explanation': "受け身は be動詞＋過去分詞で、was written と is spoken が当てはまります。was writing は過去進行形、wrote は過去形、have opened は現在完了で、どれも主語が動作をする能動態の文です。"},
    },
    {   # english / present perfect
        'ids': ['v030_en_multi_02'],
        'old': {'choices': ["I have visited Kyoto twice.", "We played soccer yesterday.", "She has just finished lunch.", "We have lived here since April."],
                'answers': [0, 2, 3],
                'explanation': "have/has + 過去分詞の形になっている3文が現在完了です。played は過去形です。"},
        'new': {'choices': ["I have visited Kyoto twice.", "He has to finish his homework.", "She has just finished lunch.", "I have a lot of homework today.", "We have lived here since April."],
                'answers': [0, 2, 4],
                'explanation': "現在完了は have/has＋過去分詞で、have visited・has finished・have lived が当てはまります。has to は「〜しなければならない」、I have a lot of homework の have は「持っている」という意味の一般動詞です。"},
    },
    {   # math / square roots
        'ids': ['v030_ma_multi_01'],
        'old': {'choices': ["2√3", "√4×√3", "3√2", "√3+√3"],
                'answers': [0, 1, 3],
                'explanation': "√12=2√3です。√4×√3=2√3、√3+√3=2√3なので3つが等しい表し方です。"},
        'new': {'choices': ["2√3", "4√3", "√4×√3", "3√2", "√6+√6"],
                'answers': [0, 2],
                'explanation': "√12＝√(4×3)＝√4×√3＝2√3 です。4√3＝√48、3√2＝√18、√6+√6＝2√6＝√24 なので、どれも √12 とは等しくありません。"},
    },
    {   # english / let, help
        'ids': ['v031_hw3_u1_multi_02'],
        'old': {'choices': ["Let me show you the way.", "Let me to show you the way.", "She helped me carry the box.", "Let him try it."],
                'answers': [0, 2, 3],
                'explanation': "let + 人 + 動詞の原形、help + 人 + 動詞の原形の形が正しい文です。"},
        'new': {'choices': ["Let me show you the way.", "Let me to show you the way.", "She helped me carry the box.", "She helped me carried the box.", "Let him try it."],
                'answers': [0, 2, 4],
                'explanation': "let・help は「人＋動詞の原形」をとるので、Let me show・helped me carry・Let him try が正しい文です。Let me to show は to が不要で、helped me carried は過去形ではなく原形 carry にします。"},
    },
    {   # english / present perfect
        'ids': ['v031_hw3_u2_multi_01'],
        'old': {'choices': ["She has already eaten lunch.", "She ate lunch at noon.", "I have never seen that movie.", "We have lived here since April."],
                'answers': [0, 2, 3],
                'explanation': "has eaten、have seen、have lived が have/has + 過去分詞の現在完了です。"},
        'new': {'choices': ["She has already eaten lunch.", "She was eating lunch at noon.", "I usually have lunch at noon.", "She has to eat lunch now."],
                'answers': [0],
                'explanation': "現在完了は have/has＋過去分詞なので has already eaten が当てはまります。was eating は過去進行形、have lunch の have は「食べる」という一般動詞、has to は「〜しなければならない」です。"},
    },
    {   # english / present perfect markers
        'ids': ['v034_san_e3_l1_06'],
        'old': {'choices': ["ever", "just", "already", "yesterday"],
                'answers': [0, 1, 2],
                'explanation': "ever「今までに」・just「ちょうど」・already「もう」は現在完了とよく使う語です。yesterday は過去の時点を表すので現在完了とは使えず、過去形で使います。"},
        'new': {'choices': ["ever", "ago", "just", "already", "last week"],
                'answers': [0, 2, 3],
                'explanation': "ever「今までに」・just「ちょうど」・already「もう」は現在完了とよく使う語です。ago「〜前に」と last week「先週」は過去の時点を表すので、現在完了ではなく過去形と使います。"},
    },
    {   # english / experience use
        'ids': ['v034_tok_e3_u1_06', 'v034_kai_e3_p1_06'],
        'old': {'choices': ["ever", "never", "once", "last night"],
                'answers': [0, 1, 2],
                'explanation': "ever「今までに」・never「一度も〜ない」・once「一度」は経験用法の目印です。last night は過去の時点を表すので現在完了とは使えません。"},
        'new': {'choices': ["just", "ever", "since", "already"],
                'answers': [1],
                'explanation': "ever「今までに」は Have you ever＋過去分詞〜? のように経験用法で使います。just「ちょうど」と already「もう」は完了用法、since「〜から」は継続用法でよく使う語です。"},
    },
    {   # social / latitude, longitude
        'ids': ['v036soc_tokyoshoseki_worldoverview_3', 'v036soc_kyoikushuppan_worldoverview_3'],
        'stem': ("世界の位置を表すときに使うものをすべて選びなさい。", "緯度と経度について正しいものをすべて選びなさい。"),
        'old': {'choices': ["緯度", "経度", "標高だけ", "方位"],
                'answers': [0, 1, 3],
                'explanation': "緯度・経度・方位は位置を表す基本的な情報です。"},
        'new': {'choices': ["緯度は赤道を0度として南北をはかる", "緯度は南北それぞれ180度まである", "経度は本初子午線を0度として東西をはかる", "赤道は経度0度を示す線である", "本初子午線はイギリスのロンドンを通る"],
                'answers': [0, 2, 4],
                'explanation': "緯度は赤道を0度として南北を各90度、経度はロンドンを通る本初子午線を0度として東西を各180度ではかります。緯度は180度まではなく、赤道は緯度0度の線です。"},
    },
    {   # social / regions of the world
        'ids': ['v036soc_tokyoshoseki_worldregions_3', 'v036soc_kyoikushuppan_worldregions_3'],
        'stem': ("アジア州で人口が多い国をすべて選びなさい。", "アジア州に属する国をすべて選びなさい。"),
        'old': {'choices': ["インド", "中国", "日本", "ブラジル"],
                'answers': [0, 1, 2],
                'explanation': "インド・中国・日本はいずれもアジア州にあります。"},
        'new': {'choices': ["インド", "エジプト", "中国", "オーストラリア", "サウジアラビア"],
                'answers': [0, 2, 4],
                'explanation': "インド・中国・サウジアラビアはアジア州の国です（サウジアラビアは西アジア）。エジプトはアフリカ州、オーストラリアはオセアニア州に属します。"},
    },
    {   # social / territory
        'ids': ['v036soc_tokyoshoseki_japanoverview_3', 'v036soc_kyoikushuppan_japanoverview_3'],
        'old': {'choices': ["領土", "領海", "領空", "公海すべて"],
                'answers': [0, 1, 2],
                'explanation': "国家の領域は領土・領海・領空からなります。"},
        'new': {'choices': ["領土", "排他的経済水域", "領海", "公海", "領空"],
                'answers': [0, 2, 4],
                'explanation': "国の領域は領土・領海・領空からなります。排他的経済水域は沿岸国が水産資源や鉱産資源を利用できる水域ですが領域ではなく、公海はどの国の領域にも属しません。"},
    },
    {   # social / three metropolitan areas
        'ids': ['v036soc_tokyoshoseki_japanregions_3', 'v036soc_kyoikushuppan_japanregions_3'],
        'stem': ("日本の三大都市圏に含まれるものをすべて選びなさい。", "日本の三大都市圏の中心となる都市をすべて選びなさい。"),
        'old': {'choices': ["東京大都市圏", "大阪大都市圏", "名古屋大都市圏", "札幌大都市圏"],
                'answers': [0, 1, 2],
                'explanation': "三大都市圏は東京・大阪・名古屋を中心とする都市圏です。"},
        'new': {'choices': ["大阪", "福岡", "名古屋", "仙台"],
                'answers': [0, 2],
                'explanation': "三大都市圏は東京・大阪・名古屋を中心とする都市圏です。福岡や仙台は地方の政治・経済の中心となる地方中枢都市ですが、三大都市圏には含まれません。"},
    },
    {   # social / topographic maps (regional study)
        'ids': ['v036soc_tokyoshoseki_regionalstudy_3', 'v036soc_kyoikushuppan_regionalstudy_3'],
        'stem': ("地域調査で資料として利用できるものをすべて選びなさい。", "地域調査で使う地形図について正しいものをすべて選びなさい。"),
        'old': {'choices': ["統計資料", "地形図", "聞き取り調査", "根拠のないうわさ"],
                'answers': [0, 1, 2],
                'explanation': "統計・地図・聞き取りなど複数の資料を組み合わせます。"},
        'new': {'choices': ["2万5千分の1では1cmが250mにあたる", "2万5千分の1では1cmが2.5kmにあたる", "等高線の間隔が広いほど傾斜は急である", "縮尺が大きいほど広い範囲を表せる"],
                'answers': [0],
                'explanation': "2万5千分の1では1cm×25000＝250mで、2.5kmではありません。等高線の間隔がせまいほど傾斜は急で、縮尺が大きい地図ほどせまい範囲をくわしく表します。"},
    },
    {   # social / ancient Japan
        'ids': ['v036soc_tokyoshoseki_ancient_3', 'v036soc_kyoikushuppan_ancient_3'],
        'old': {'choices': ["大化の改新", "律令制度", "遣唐使", "参勤交代"],
                'answers': [0, 1, 2],
                'explanation': "参勤交代は江戸時代の制度です。"},
        'new': {'choices': ["大化の改新", "御成敗式目", "律令制度", "勘合貿易", "遣唐使"],
                'answers': [0, 2, 4],
                'explanation': "大化の改新・律令制度・遣唐使は飛鳥〜平安時代の古代のことがらです。御成敗式目は鎌倉時代、勘合貿易は室町時代の中世のことがらです。"},
    },
    {   # social / Muromachi
        'ids': ['v036soc_tokyoshoseki_medieval_3', 'v036soc_kyoikushuppan_medieval_3'],
        'old': {'choices': ["足利氏", "勘合貿易", "応仁の乱", "参勤交代"],
                'answers': [0, 1, 2],
                'explanation': "参勤交代は江戸時代です。"},
        'new': {'choices': ["元寇", "勘合貿易", "御成敗式目", "応仁の乱"],
                'answers': [1, 3],
                'explanation': "勘合貿易（足利義満による日明貿易）と応仁の乱は室町時代のできごとです。元寇と御成敗式目は鎌倉時代のことがらなので、室町時代には当てはまりません。"},
    },
    {   # social / Edo foreign relations
        'ids': ['v036soc_tokyoshoseki_earlymodern_3', 'v036soc_kyoikushuppan_earlymodern_3'],
        'stem': ("江戸時代の対外関係として正しいものをすべて選びなさい。", "江戸時代の鎖国中の対外関係として正しいものをすべて選びなさい。"),
        'old': {'choices': ["長崎でオランダと交易した", "朝鮮通信使が来日した", "琉球王国を通じた交流があった", "外国との交流を完全にゼロにした"],
                'answers': [0, 1, 2],
                'explanation': "鎖国下でも複数の窓口を通じて対外交流が続きました。"},
        'new': {'choices': ["長崎でオランダと交易した", "長崎でイギリスと交易した", "朝鮮通信使が来日した", "ポルトガル船の来航を認めた", "中国とは交易しなかった"],
                'answers': [0, 2],
                'explanation': "鎖国中も長崎でオランダや中国と交易し、朝鮮通信使も来日しました。イギリスは鎖国前に平戸の商館を閉じて去り、ポルトガル船は島原・天草一揆の後に来航を禁止されました。"},
    },
    {   # social / Meiji modernization
        'ids': ['v036soc_tokyoshoseki_modern_3', 'v036soc_kyoikushuppan_modern_3'],
        'old': {'choices': ["学制", "徴兵令", "地租改正", "鎖国令"],
                'answers': [0, 1, 2],
                'explanation': "鎖国令は江戸時代の対外政策に関係します。"},
        'new': {'choices': ["学制", "太閤検地", "徴兵令", "地租改正", "刀狩"],
                'answers': [0, 2, 3],
                'explanation': "学制・徴兵令・地租改正は明治政府による近代化の政策です。太閤検地と刀狩は豊臣秀吉の政策で、土地や武器に関係するため明治の改革と混同しないようにします。"},
    },
    {   # social / postwar Japan
        'ids': ['v036soc_tokyoshoseki_contemporary_3', 'v036soc_kyoikushuppan_contemporary_3'],
        'old': {'choices': ["高度経済成長", "日本国憲法の施行", "国際連合への加盟", "廃藩置県"],
                'answers': [0, 1, 2],
                'explanation': "廃藩置県は明治時代です。"},
        'new': {'choices': ["高度経済成長", "国際連盟への加盟", "日本国憲法の施行", "大日本帝国憲法の発布", "国際連合への加盟"],
                'answers': [0, 2, 4],
                'explanation': "高度経済成長、日本国憲法の施行（1947年）、国際連合への加盟（1956年）は戦後です。国際連盟への加盟（1920年）と大日本帝国憲法の発布（1889年）は戦前です。"},
    },
    {   # civics / modern society
        'ids': ['v036soc_teikoku_modernsociety_3', 'v036soc_kyoikushuppan_modernsociety_3', 'v036soc_nihonbunkyo_modernsociety_3'],
        'stem': ("現代社会の課題として考えられるものをすべて選びなさい。", "現代の日本社会のようすとして正しいものをすべて選びなさい。"),
        'old': {'choices': ["少子高齢化", "情報格差", "環境問題", "身分制度の固定"],
                'answers': [0, 1, 2],
                'explanation': "少子高齢化・情報格差・環境問題などが現代的課題です。"},
        'new': {'choices': ["65歳以上の人の割合が高まっている", "日本の総人口が増え続けている", "三世代で暮らす世帯が増えている", "情報通信技術の発達で情報化が進んでいる"],
                'answers': [0, 3],
                'explanation': "日本では65歳以上の人の割合が高まり、情報通信技術の発達で情報化も進んでいます。総人口は減少しており、三世代世帯は減って核家族や一人暮らしの世帯が増えています。"},
    },
    {   # civics / social rights
        'ids': ['v036soc_teikoku_constitution_3', 'v036soc_kyoikushuppan_constitution_3', 'v036soc_nihonbunkyo_constitution_3'],
        'stem': ("基本的人権に含まれるものをすべて選びなさい。", "基本的人権のうち、社会権に含まれるものをすべて選びなさい。"),
        'old': {'choices': ["自由権", "社会権", "参政権", "世襲による特権"],
                'answers': [0, 1, 2],
                'explanation': "自由権・社会権・参政権などが基本的人権として保障されます。"},
        'new': {'choices': ["生存権", "選挙権", "教育を受ける権利", "表現の自由", "裁判を受ける権利"],
                'answers': [0, 2],
                'explanation': "社会権は人間らしい生活を保障する権利で、生存権や教育を受ける権利が含まれます。選挙権は参政権、表現の自由は自由権、裁判を受ける権利は請求権に分類されます。"},
    },
    {   # civics / separation of powers
        'ids': ['v036soc_teikoku_politics_3', 'v036soc_kyoikushuppan_politics_3', 'v036soc_nihonbunkyo_politics_3'],
        'old': {'choices': ["立法", "行政", "司法", "報道"],
                'answers': [0, 1, 2],
                'explanation': "立法・行政・司法の三権が相互に抑制します。"},
        'new': {'choices': ["立法", "国民主権", "行政", "司法", "地方自治"],
                'answers': [0, 2, 3],
                'explanation': "三権分立は国の権力を立法（国会）・行政（内閣）・司法（裁判所）に分けるしくみです。国民主権は日本国憲法の基本原則、地方自治は住民による地域の政治で、三権ではありません。"},
    },
    {   # civics / labor rights
        'ids': ['v036soc_teikoku_economy_3', 'v036soc_kyoikushuppan_economy_3', 'v036soc_nihonbunkyo_economy_3'],
        'stem': ("労働者の権利に関係するものをすべて選びなさい。", "労働三権に含まれるものをすべて選びなさい。"),
        'old': {'choices': ["団結権", "団体交渉権", "団体行動権", "納税免除権"],
                'answers': [0, 1, 2],
                'explanation': "労働三権は団結権・団体交渉権・団体行動権です。"},
        'new': {'choices': ["団結権", "勤労の権利", "団体交渉権", "請願権", "団体行動権"],
                'answers': [0, 2, 4],
                'explanation': "労働三権は団結権・団体交渉権・団体行動権（争議権）です。勤労の権利は社会権の一つですが労働三権には含まれず、請願権は国や地方公共団体に要望を伝える権利です。"},
    },
    {   # civics / international cooperation
        'ids': ['v036soc_teikoku_international_3', 'v036soc_kyoikushuppan_international_3', 'v036soc_nihonbunkyo_international_3'],
        'stem': ("国際協力に関係するものをすべて選びなさい。", "国際協力に関係する略称と日本語名の組み合わせとして正しいものをすべて選びなさい。"),
        'old': {'choices': ["ODA", "NGO", "国際連合", "鎖国"],
                'answers': [0, 1, 2],
                'explanation': "ODA・NGO・国連はいずれも国際協力と関係します。"},
        'new': {'choices': ["ODA－政府開発援助", "WHO－世界貿易機関", "NGO－非政府組織", "UNICEF－国連教育科学文化機関", "PKO－国連平和維持活動"],
                'answers': [0, 2, 4],
                'explanation': "ODAは政府開発援助、NGOは非政府組織、PKOは国連平和維持活動です。WHOは世界保健機関（世界貿易機関はWTO）、UNICEFは国連児童基金（国連教育科学文化機関はUNESCO）です。"},
    },
    {   # science / three elements of force
        'ids': ['v036sci_tokyoshoseki_lightsoundforce_3'],
        'old': {'choices': ["力の大きさ", "力の向き", "作用点", "物体の色"],
                'answers': [0, 1, 2],
                'explanation': "力は大きさ・向き・作用点で表します。"},
        'new': {'choices': ["力の大きさ", "物体の質量", "力の向き", "作用点", "物体の速さ"],
                'answers': [0, 2, 3],
                'explanation': "力は矢印で表し、作用点（力がはたらく点）・力の向き・力の大きさの三つを示します。物体の質量や速さは物体の性質や運動のようすで、力の三要素ではありません。"},
    },
    {   # science / magnetic field of a current
        'ids': ['v036sci_tokyoshoseki_electricity_3'],
        'old': {'choices': ["電流の向きで磁界の向きが変わる", "コイルに電流を流すと磁界ができる", "電流が大きいほど磁界は強くなりやすい", "磁界は電流と無関係である"],
                'answers': [0, 1, 2],
                'explanation': "電流と磁界には密接な関係があります。"},
        'new': {'choices': ["電流の向きを逆にすると磁界も逆向きになる", "導線から離れるほど磁界は強くなっていく", "コイルの巻数を増やすと磁界は強くなる", "電流を止めても、磁界はそのまま残り続ける"],
                'answers': [0, 2],
                'explanation': "電流の向きを逆にすると磁界も逆向きになり、コイルの巻数を増やすと磁界は強くなります。磁界は導線に近いほど強く、離れるほど弱くなります。電流を止めると磁界は消えます。"},
    },
    {   # science / collecting gases
        'ids': ['v036sci_tokyoshoseki_substances_3'],
        'stem': ("気体を集める方法をすべて選びなさい。", "気体の集め方について正しいものをすべて選びなさい。"),
        'old': {'choices': ["水上置換法", "上方置換法", "下方置換法", "蒸留法"],
                'answers': [0, 1, 2],
                'explanation': "気体の性質に応じて三つの置換法を使い分けます。"},
        'new': {'choices': ["水に溶けにくい気体は水上置換法で集める", "水に溶けやすく空気より重い気体は上方置換法で集める", "水に溶けやすく空気より軽い気体は上方置換法で集める", "アンモニアは水上置換法で集める"],
                'answers': [0, 2],
                'explanation': "水に溶けにくい気体は水上置換法、水に溶けやすく空気より軽い気体は上方置換法、空気より重い気体は下方置換法で集めます。アンモニアは水に非常に溶けやすいので上方置換法です。"},
    },
    {   # science / chemical change
        'ids': ['v036sci_tokyoshoseki_chemicalchange_3'],
        'old': {'choices': ["鉄がさびる", "炭酸水素ナトリウムを加熱する", "水が凍る", "木が燃える"],
                'answers': [0, 1, 3],
                'explanation': "水が凍るのは状態変化で、新しい物質はできません。"},
        'new': {'choices': ["鉄がさびる", "水が凍る", "砂糖が水に溶ける", "ドライアイスが気体になる"],
                'answers': [0],
                'explanation': "鉄がさびるのは鉄が酸素と結びついて別の物質になる化学変化です。水が凍る・ドライアイスが気体になるのは状態変化、砂糖が水に溶けるのは溶解で、どれも新しい物質はできません。"},
    },
    {   # science / electrolytes
        'ids': ['v036sci_tokyoshoseki_ions_3'],
        'old': {'choices': ["水溶液が電流を通す", "水中でイオンに分かれる物質がある", "食塩は電解質である", "砂糖水は強い電解質である"],
                'answers': [0, 1, 2],
                'explanation': "砂糖は水に溶けてもほとんどイオンにならないため非電解質です。"},
        'new': {'choices': ["食塩は電解質である", "砂糖は電解質である", "電解質の水溶液は電流を通す", "エタノールは電解質である", "電解質は水に溶けると電離する"],
                'answers': [0, 2, 4],
                'explanation': "食塩（塩化ナトリウム）は水に溶けると陽イオンと陰イオンに電離する電解質で、その水溶液は電流を通します。砂糖やエタノールは電離しない非電解質です。"},
    },
    {   # science / plant and animal cells
        'ids': ['v036sci_tokyoshoseki_plantsanimals_3'],
        'old': {'choices': ["核", "細胞膜", "細胞質", "葉緑体"],
                'answers': [0, 1, 2],
                'explanation': "葉緑体は主に植物細胞に見られます。"},
        'new': {'choices': ["核", "細胞壁", "細胞膜", "葉緑体"],
                'answers': [0, 2],
                'explanation': "核と細胞膜は植物と動物の細胞の両方にあります。細胞壁と葉緑体は植物の細胞に見られるつくりで、動物の細胞にはありません。"},
    },
    {   # science / blood
        'ids': ['v036sci_tokyoshoseki_cellsbody_3'],
        'stem': ("血液の成分をすべて選びなさい。", "血液の成分とそのはたらきの組み合わせとして正しいものをすべて選びなさい。"),
        'old': {'choices': ["赤血球", "白血球", "血小板", "胆汁"],
                'answers': [0, 1, 2],
                'explanation': "胆汁は消化液で、血液の成分ではありません。"},
        'new': {'choices': ["赤血球－酸素を運ぶ", "白血球－出血した血液を固める", "血しょう－養分や不要物を運ぶ", "血小板－細菌などを分解する"],
                'answers': [0, 2],
                'explanation': "赤血球は酸素を運び、血しょうは養分や二酸化炭素などの不要物を運びます。出血した血液を固めるのは血小板、細菌などを分解するのは白血球なので、残りの2つは組み合わせが誤りです。"},
    },
    {   # science / asexual reproduction
        'ids': ['v036sci_tokyoshoseki_reproductiongenetics_3'],
        'stem': ("無性生殖の特徴として正しいものをすべて選びなさい。", "無性生殖によるふえ方をすべて選びなさい。"),
        'old': {'choices': ["一個体から子ができる場合がある", "子は親と同じ遺伝情報をもちやすい", "受精を必要としない", "必ず雌雄二個体が必要"],
                'answers': [0, 1, 2],
                'explanation': "無性生殖では基本的に受精を行いません。"},
        'new': {'choices': ["ゾウリムシが分裂してふえる", "カエルが受精卵からふえる", "ジャガイモのいもから芽が出てふえる", "アブラナが受粉して種子でふえる"],
                'answers': [0, 2],
                'explanation': "分裂やいもから芽が出てふえるのは、受精を行わない無性生殖です。カエルの受精卵やアブラナの種子は、卵（卵細胞）と精子（精細胞）の受精でできるので有性生殖です。"},
    },
    {   # science / index fossils vs facies fossils
        'ids': ['v036sci_tokyoshoseki_earthchange_3'],
        'stem': ("地層から過去の環境を考える手がかりになるものをすべて選びなさい。", "地層ができた当時の環境を知る手がかりとなる示相化石をすべて選びなさい。"),
        'old': {'choices': ["化石", "堆積物", "地層の重なり", "現在の天気予報だけ"],
                'answers': [0, 1, 2],
                'explanation': "化石や堆積物、地層の重なりから過去の環境を推定します。"},
        'new': {'choices': ["サンゴ", "アンモナイト", "シジミ", "サンヨウチュウ"],
                'answers': [0, 2],
                'explanation': "サンゴはあたたかくて浅い海、シジミは河口や湖のような水域で地層ができたことを示す示相化石です。アンモナイトやサンヨウチュウは地層ができた時代を示す示準化石です。"},
    },
    {   # science / warm front
        'ids': ['v036sci_tokyoshoseki_weather_3'],
        'stem': ("温暖前線が近づくときに見られやすい特徴をすべて選びなさい。", "温暖前線による天気の変化として正しいものをすべて選びなさい。"),
        'old': {'choices': ["広い範囲で弱い雨が続くことがある", "層状の雲が現れやすい", "通過後に気温が上がることがある", "必ず快晴になる"],
                'answers': [0, 1, 2],
                'explanation': "温暖前線では比較的穏やかな天気変化が見られます。"},
        'new': {'choices': ["広い範囲に弱い雨が長く降る", "積乱雲が発達し、強い雨が短時間降る", "通過後は暖気におおわれ気温が上がる", "通過後は北寄りの風になり気温が下がる"],
                'answers': [0, 2],
                'explanation': "温暖前線では乱層雲などの層状の雲が広がり、広い範囲に弱い雨が長く降り、通過後は気温が上がります。積乱雲による短時間の強い雨や、通過後の北寄りの風と気温低下は寒冷前線の特徴です。"},
    },
    {   # science / planets
        'ids': ['v036sci_tokyoshoseki_earthspace_3'],
        'old': {'choices': ["地球", "火星", "木星", "月"],
                'answers': [0, 1, 2],
                'explanation': "月は地球の衛星で、惑星ではありません。"},
        'new': {'choices': ["金星", "月", "木星", "冥王星", "火星"],
                'answers': [0, 2, 4],
                'explanation': "金星・木星・火星は太陽のまわりを公転する惑星です。月は地球のまわりを回る衛星で、冥王星は現在は惑星ではなく準惑星に分類されています。"},
    },
    {   # science / renewable energy
        'ids': ['v036sci_tokyoshoseki_naturehuman_3'],
        'stem': ("持続可能な社会につながる行動をすべて選びなさい。", "持続可能な社会のために利用が進められている再生可能エネルギーをすべて選びなさい。"),
        'old': {'choices': ["省エネルギー", "資源の再利用", "生物多様性の保全", "資源を無制限に使う"],
                'answers': [0, 1, 2],
                'explanation': "資源・エネルギーを適切に使い、環境を守ることが重要です。"},
        'new': {'choices': ["太陽光", "原子力", "風力", "天然ガス", "地熱"],
                'answers': [0, 2, 4],
                'explanation': "太陽光・風力・地熱は自然の中でくり返し利用でき、なくならない再生可能エネルギーです。天然ガスは化石燃料、原子力はウランを燃料とし、どちらも資源に限りがあります。"},
    },
    {   # math / congruence conditions (含まれるもの)
        'ids': ['v036math_gakkotosho_congruence_1', 'v036math_kyoikushuppan_congruence_1'],
        'old': {'choices': ["3組の辺がそれぞれ等しい", "2組の辺とその間の角がそれぞれ等しい", "1組の辺だけが等しい", "1組の辺とその両端の角がそれぞれ等しい"],
                'answers': [0, 1, 3],
                'explanation': "三角形の代表的な合同条件は3種類です。"},
        'new': {'choices': ["3組の辺がそれぞれ等しい", "2組の辺とその間の角がそれぞれ等しい", "1組の辺と1つの角がそれぞれ等しい", "1組の辺とその両端の角がそれぞれ等しい", "3組の角がそれぞれ等しい"],
                'answers': [0, 1, 3],
                'explanation': "合同条件は、3組の辺、2組の辺とその間の角、1組の辺とその両端の角がそれぞれ等しいことの3つです。3組の角が等しくても大きさが違う場合があり、1組の辺と1つの角では形が決まりません。"},
    },
    {   # math / congruence conditions (として正しいもの)
        'ids': ['v037_math_gakko_tosho_g2_congruence_03', 'v037_math_kyoiku_shuppan_g2_congruence_03'],
        'old': {'choices': ["3組の辺がそれぞれ等しい", "2組の辺とその間の角がそれぞれ等しい", "1組の辺とその両端の角がそれぞれ等しい", "3組の角がそれぞれ等しい"],
                'answers': [0, 1, 2],
                'explanation': "三角形の合同条件は3組の辺、2組の辺とその間の角、1組の辺とその両端の角です。"},
        'new': {'choices': ["3組の辺がそれぞれ等しい", "3組の角がそれぞれ等しい", "2組の辺とその間の角がそれぞれ等しい", "2組の辺とその間にない角がそれぞれ等しい"],
                'answers': [0, 2],
                'explanation': "3組の辺、2組の辺とその間の角がそれぞれ等しければ合同です。3組の角が等しくても大きさが違う場合があり、2組の辺とその間にない角では三角形が1つに決まらないので合同条件ではありません。"},
    },
    {   # english / asking again in conversation
        'ids': ['v040_en_sanseido_1_05_3', 'v040_en_sanseido_2_05_3', 'v040_en_tokyo-shoseki_1_05_3', 'v040_en_tokyo-shoseki_2_05_3',
                'v040_en_kairyudo_1_05_3', 'v040_en_kairyudo_2_05_3'],
        'stem': ("会話を続けるために適切な行動をすべて選びなさい。", "相手の言ったことが聞き取れず、聞き返すときに使う表現をすべて選びなさい。"),
        'old': {'choices': ["相手の発言に応じて質問する", "分からないとき聞き返す", "相づちを使う", "相手の話を無視する"],
                'answers': [0, 1, 2],
                'explanation': "質問・聞き返し・相づちは、やり取りを続ける基本的な方法です。"},
        'new': {'choices': ["Pardon?", "Sounds good.", "One more time, please.", "You're welcome.", "Me, too."],
                'answers': [0, 2],
                'explanation': "Pardon? や One more time, please. は聞き取れなかったときに聞き返す表現です。Sounds good. は賛成、You're welcome. はお礼への返事、Me, too. は同意を表します。"},
    },
    {   # english / future
        'ids': ['v040_en_sanseido_2_03_3', 'v040_en_sanseido_2_04_3', 'v040_en_tokyo-shoseki_2_03_3', 'v040_en_tokyo-shoseki_2_04_3',
                'v040_en_kairyudo_2_03_3', 'v040_en_kairyudo_2_04_3'],
        'stem': ("未来や予定について述べるとき使える表現をすべて選びなさい。", "未来のことを正しく表している文をすべて選びなさい。"),
        'old': {'choices': ["will + 動詞の原形", "be going to + 動詞の原形", "tomorrow と未来表現", "was + 動詞ing だけ"],
                'answers': [0, 1, 2],
                'explanation': "will や be going to、未来を表す時の語句を使って予定・未来を表現できます。"},
        'new': {'choices': ["I will visit my aunt tomorrow.", "I will visited my aunt tomorrow.", "We are going to play tennis next Sunday.", "She is going to plays the piano.", "We going to play tennis next Sunday."],
                'answers': [0, 2],
                'explanation': "未来は will＋動詞の原形や be going to＋動詞の原形で表します。will visited と going to plays は動詞を原形にしていないので誤り、We going to は be動詞 are が抜けています。"},
    },
    {   # english / passive and comparison
        'ids': ['v040_en_sanseido_2_06_3', 'v040_en_sanseido_2_07_3', 'v040_en_tokyo-shoseki_2_06_3', 'v040_en_tokyo-shoseki_2_07_3',
                'v040_en_kairyudo_2_06_3', 'v040_en_kairyudo_2_07_3'],
        'old': {'choices': ["This book was written in English.", "Aki is taller than Ken.", "This is the most popular song here.", "English is speak in Canada."],
                'answers': [0, 1, 2],
                'explanation': "受け身、比較級、最上級の正しい形を確認します。"},
        'new': {'choices': ["This book was written in English.", "This is the popularest song here.", "Aki is taller than Ken.", "Ken is more tall than Aki.", "English is speak in Canada."],
                'answers': [0, 2],
                'explanation': "受け身は be動詞＋過去分詞なので was written は正しく、is speak は is spoken にします。tall の比較級は taller、popular の最上級は the most popular で、more tall や popularest は誤りです。"},
    },
    {   # english / reading clues
        'ids': ['v040_en_tokyo-shoseki_3_00_2'],
        'stem': ("英文の内容を正確に読む手がかりをすべて選びなさい。", "英文を正確に読むとき、前に出た語句や内容を指す語をすべて選びなさい。"),
        'old': {'choices': ["代名詞が指す内容", "接続語", "時制", "文字の色だけ"],
                'answers': [0, 1, 2],
                'explanation': "代名詞・接続語・時制は文や段落の関係を捉える重要な手がかりです。"},
        'new': {'choices': ["it", "because", "but", "when"],
                'answers': [0],
                'explanation': "it は前に出た語句や内容を指す代名詞で、何を指すかを確かめると内容を正確に読めます。because・but・when は文と文をつなぐ接続詞で、理由・逆接・時を表します。"},
    },
]

# Original absurd / strawman distractors that were replaced (kept for the regression test).
REPLACED_ABSURD_DISTRACTORS = [
    "標高だけ", "公海すべて", "札幌大都市圏", "根拠のないうわさ", "参勤交代", "外国との交流を完全にゼロにした",
    "鎖国令", "廃藩置県", "身分制度の固定", "世襲による特権", "報道", "納税免除権", "鎖国", "物体の色",
    "磁界は電流と無関係である", "蒸留法", "砂糖水は強い電解質である", "必ず雌雄二個体が必要", "胆汁",
    "現在の天気予報だけ", "必ず快晴になる", "資源を無制限に使う", "1組の辺だけが等しい", "相手の話を無視する",
    "was + 動詞ing だけ", "文字の色だけ",
]

UPDATES = {}   # id -> new {question, choices, answers, explanation}, filled by build()
ORIGINAL = {}  # id -> original {question?, choices, answers, explanation}


def build(by_id=None):
    """Expand GROUPS into per-ID dicts. The question text is derived from the bank when needed."""
    for g in GROUPS:
        for qid in g['ids']:
            ORIGINAL[qid] = dict(g['old'])
            UPDATES[qid] = dict(g['new'])
            if 'stem' in g:
                old_stem, new_stem = g['stem']
                ORIGINAL[qid]['stem'] = old_stem
                UPDATES[qid]['stem'] = new_stem


build()
IDS = list(UPDATES)


def new_question_text(q, qid):
    """Return the new prompt for qid given the current question (original or already new)."""
    if 'stem' not in UPDATES[qid]:
        return q['question']
    old_stem, new_stem = ORIGINAL[qid]['stem'], UPDATES[qid]['stem']
    text = q['question']
    if text.endswith(new_stem):
        return text
    if not text.endswith(old_stem):
        sys.exit(f'{qid}: unexpected question text, refusing to overwrite: {text!r}')
    return text[: -len(old_stem)] + new_stem


def state_of(q, qid):
    def same(ref):
        return all(q.get(k) == ref[k] for k in ('choices', 'answers', 'explanation'))
    if same(UPDATES[qid]):
        return 'new'
    if same(ORIGINAL[qid]):
        return 'original'
    return None


def main():
    if len(IDS) != len(set(IDS)) or len(IDS) != 78:
        sys.exit(f'expected 78 unique ids, got {len(IDS)}')
    path = ROOT / 'data/questions.json'
    base = json.loads(path.read_text(encoding='utf-8'))
    by_id = {q['id']: q for q in base['questions']}
    missing = sorted(set(IDS) - set(by_id))
    if missing:
        sys.exit(f'missing ids: {missing}')
    plan = {}
    for qid in IDS:
        q = by_id[qid]
        if q.get('type') != 'multi':
            sys.exit(f'{qid}: not a multi question')
        if state_of(q, qid) is None:
            sys.exit(f'{qid}: unexpected current choices/answers/explanation, refusing to overwrite')
        plan[qid] = new_question_text(q, qid)
    changed = 0
    for qid in IDS:
        q = by_id[qid]
        new = UPDATES[qid]
        for field, value in (('question', plan[qid]), ('choices', new['choices']),
                             ('answers', new['answers']), ('explanation', new['explanation'])):
            if q.get(field) != value:
                q[field] = list(value) if isinstance(value, list) else value
                changed += 1
    path.write_text(json.dumps(base, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (ROOT / 'data/questions.js').write_text(
        'window.QUESTION_DATA = ' + json.dumps(base, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
    print(f'updated fields: {changed} across {len(IDS)} ids')


if __name__ == '__main__':
    main()
