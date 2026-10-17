#!/usr/bin/env python3
import json,re
from pathlib import Path
R=Path(__file__).resolve().parents[1]
J=R/'data/questions.json'
data=json.load(open(J,encoding='utf-8'))
qs=data['questions']
by={q['id']:q for q in qs}

# Remove specific semantic duplicates in the Shizuoka scope. Keep the stronger publisher-specific/stimulus item.
remove_ids={
 'v032_sc_rg_fill_02','v036sci_keirinkan_reproductiongenetics_2', # keep v044_sc_07
 'v04_107','v032_sc_es_fill_01',                                  # keep v036...earthspace_1
 'v04_109','v032_sc_nh_fill_02',                                  # keep v036...naturehuman_1
 'v04_047','v032_so_int_fill_01',                                 # keep Tokyo Shoseki publisher item
 'en006','v04_123',                                                # keep v044_en_g3_relative
 'v04_085',                                                        # keep Keirinkan reflection item
 'v04_084',                                                        # keep Keirinkan sampling item
 'v04_124',                                                        # keep reorder version
 'v04_094',                                                        # keep Keirinkan chemistry item
 'v04_092',                                                        # keep Keirinkan state-change item
 'v04_097',                                                        # keep Keirinkan chloroplast item
 'v04_046',                                                        # keep Tokyo Shoseki fiscal item
 'v032_so_ms_fill_01',                                             # keep Tokyo Shoseki ageing item
 'v032_so_pol_fill_01',                                            # keep Tokyo Shoseki Diet item
 'v04_065',                                                        # keep Keirinkan proportion item
 'v033_ma_sim_02',                                                 # keep Keirinkan similarity item
 'v033_ma_exp_06',                                                 # keep Keirinkan expansion item
 'v04_117',                                                        # keep en004 infinitive item
 'mat_runmelos_02',                                                # answer visible in title; replace in later material expansion
}
qs=[q for q in qs if q['id'] not in remove_ids]
by={q['id']:q for q in qs}

# Grade-appropriate English passage.
q=by['v035_en_mitsumura_g2_01_2']
q['passage']="Mina's group planned to make a poster in the library after school. When they arrived, they could not use the library because there was a meeting. They moved to an empty classroom and divided the work. Two students searched for information, and Mina organized the notes. They finished the first draft and agreed to meet again on Monday."
q['explanation']='The group could not use the library, so they moved to another room, divided the work, and continued the project.'

# Balance reflection choices after deleting the common duplicate.
q=by['v036sci_keirinkan_lightsoundforce_1']
q['question']='鏡で光が反射するとき、入射角と反射角の関係として正しいものは？'
q['choices']=['入射角と反射角は等しくなる','反射角は入射角より大きくなる','反射角は入射角より小さくなる','入射角と反射角の和は90°になる']
q['answer']=0
q['explanation']='反射の法則では、法線を基準に測った入射角と反射角は等しくなります。'

# Improve weak distractors.
q=by['v04_125']
q['choices']=['前後の文や語句との関係から意味を推測する','似たつづりの既知語と同じ意味だと判断する','その語を飛ばし、段落の結論を先に決める','品詞を考えず、日本語にしやすい意味を当てはめる']
q['explanation']='未知語は、前後の文・品詞・話題との関係を使って意味を推測すると読解を続けやすくなります。'
q=by['v04_074']
q['choices']=['仮定から結論までが根拠に基づくことを示すため','図から結論が正しそうに見えることを確認するため','いくつかの計算例が一致したことを一般化するため','結論に合う条件を後から選んで並べるため']
q['explanation']='証明では、仮定や既知の性質を根拠としてつなぎ、結論が必ず成り立つことを論理的に示します。'

# Replace inappropriate bar-chart representation of a linear function with a table.
q=by['v044_ma_graph_01']
q.pop('figure',None)
q['table']={'headers':['x','0','1','2','3'],'rows':[['y','2','5','8','11']]}
q['stimulusTitle']='一次関数の値の表'
q['question']='表のxとyの関係を表す一次関数の式はどれ？'
q['explanation']='xが1増えるごとにyは3増えるので傾きは3、x=0のときy=2なので切片は2です。したがって y=3x+2 です。'

# Strengthen a proof task so it requires a chain of reasons, not only naming the congruence condition.
q=by['v044_ma_g2_proof']
q['passage']='二等辺三角形ABCでAB=ACとする。辺BCの中点をDとし、AとDを結ぶ。'
q['stimulusTitle']='二等辺三角形の合同証明'
q['question']='△ABD≡△ACDを証明し、その結果から∠BAD=∠CADといえる理由まで説明しなさい。'
q['modelAnswer']='AB=AC（仮定）、BD=CD（DはBCの中点）、AD=AD（共通）より、三組の辺がそれぞれ等しいので△ABD≡△ACD。合同な図形の対応する角は等しいから、∠BAD=∠CAD。'
q['explanation']='仮定・中点の定義・共通な辺を根拠として三辺相等で合同を示し、その後に対応する角の性質を使います。'

# Diversify multi-select correct-count distribution (5 with one correct, 6 with three correct, 6 remain at two).
def set_multi(i,choices,answers,exp):
 q=by[i];q['choices']=choices;q['answers']=answers;q['explanation']=exp
# 3 correct
set_multi('v030_en_multi_01',[
 'This book was written by Soseki.','I wrote a letter yesterday.','English is spoken in many countries.','The window was opened this morning.'
],[0,2,3],'be動詞 + 過去分詞で表す受け身は was written、is spoken、was opened です。')
set_multi('v030_en_multi_02',[
 'I have visited Kyoto twice.','We played soccer yesterday.','She has just finished lunch.','We have lived here since April.'
],[0,2,3],'have/has + 過去分詞の形になっている3文が現在完了です。played は過去形です。')
set_multi('v030_ja_multi_01',['おっしゃる','召し上がる','申し上げる','いらっしゃる'],[0,1,3],'「おっしゃる」「召し上がる」「いらっしゃる」は相手側の動作を高める尊敬語です。「申し上げる」は謙譲語です。')
set_multi('v030_ma_multi_01',['2√3','√4×√3','3√2','√3+√3'],[0,1,3],'√12=2√3です。√4×√3=2√3、√3+√3=2√3なので3つが等しい表し方です。')
set_multi('v031_hw3_u1_multi_02',['Let me show you the way.','Let me to show you the way.','She helped me carry the box.','Let him try it.'],[0,2,3],'let + 人 + 動詞の原形、help + 人 + 動詞の原形の形が正しい文です。')
set_multi('v031_hw3_u2_multi_01',['She has already eaten lunch.','She ate lunch at noon.','I have never seen that movie.','We have lived here since April.'],[0,2,3],'has eaten、have seen、have lived が have/has + 過去分詞の現在完了です。')
# 1 correct
set_multi('v031_hw3_u3_multi_02',['how to use this app','how using this app','how making curry','how to made curry'],[0],'how to + 動詞の原形で「〜の仕方」を表します。use は原形です。')
set_multi('v031_hw3_u4_multi_02',['I met a teacher who teaches science.','This book explains robots.','Who is your teacher?','That is my bag.'],[0],'teacher を who teaches science が後ろから説明している文だけが、関係代名詞で直前の名詞を説明しています。')
set_multi('v031_hw3_u5_multi_01',['This is the bike that I use every day.','I know a girl who sings well.','The movie which won the award was exciting.','This is a dog that runs fast.'],[0],'that が use の目的語になっている1文目では関係代名詞を省略できます。ほかは関係代名詞が節の主語です。')
set_multi('v033_ma_samp_04',['名簿から乱数を使って選ぶ','休み時間に近くにいる生徒から選ぶ','番号の若い順から必要人数を選ぶ','成績が高い生徒から選ぶ'],[0],'母集団の各要素が偏りなく選ばれるよう、乱数などを使って無作為に抽出します。')
set_multi('v037_math_keirinkan_g1_plane_space_03',['三角形の内角の和は180°である','三角形の外角は隣り合う内角との差に等しい','三角形の3辺は同じ長さになる','直角三角形には60°の角がある'],[0],'どの三角形でも内角の和は180°です。ほかの文は一般には成り立ちません。')

# Version / notes.
data['version']='0.44.6'
data['questions']=qs
data['notes']=(data.get('notes','')+' Ver.0.44.6: removed additional semantic duplicates, fixed grade-inappropriate English, strengthened distractors/proof, replaced the linear-function bar chart with a table, diversified multi-select answer counts, and prepared written-response mock-exam support.').strip()
J.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(R/'data/questions.js').write_text('window.QUESTION_DATA = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print('removed',len(remove_ids),'remaining',len(qs))