"""v0.47.4: replace the placeholder explanation on 125 grade-3 English questions.

Reproducible and idempotent. Only the IDs listed below are touched; IDs never change.
Writes data/questions.json (indent=2, ensure_ascii=False) and regenerates data/questions.js.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLACEHOLDER = 'この教材で扱う文法・表現に合わせたオリジナル練習問題です。'

# Specific explanations (why the keyed answer is right, the clue, and why distractors are wrong).
EXPLANATIONS = {
    'v034_san_e3_l1_01': '現在完了「have＋過去分詞」の経験用法です。twice「2回」が経験の目印なので、see の過去分詞 seen（watched も可）を入れます。',
    'v034_san_e3_l1_02': '現在完了の完了用法です。「ちょうど」は just で表し、has と過去分詞 finished の間に置きます。',
    'v034_san_e3_l1_03': '経験を表す現在完了は I have＋過去分詞 visited の順です。回数を表す once「一度」は、ふつう目的語 Kyoto の後の文末に置きます。',
    'v034_san_e3_l1_04': '現在完了の疑問文は Have を主語の前に出し、Have you＋過去分詞 eaten の順にします。疑問文の「もう」は yet で、文末に置きます。',
    'v034_san_e3_l1_05': '現在完了は have/has＋過去分詞です。主語が He なら has を使うので He have seen は誤りです。yesterday のように過去の一点を示す文は過去形で、現在完了ではありません。',
    'v034_san_e3_l1_06': 'ever「今までに」・just「ちょうど」・already「もう」は現在完了とよく使う語です。yesterday は過去の時点を表すので現在完了とは使えず、過去形で使います。',
    'v034_san_e3_l2_01': '現在完了進行形「have been＋〜ing」です。for two hours「2時間」から動作が続いているとわかるので、study の ing形 studying（learning も可）を入れます。',
    'v034_san_e3_l2_02': 'How long have you been 〜ing? で「どのくらいの間〜し続けているか」をたずねます。been の後なので wait の ing形 waiting を入れます。',
    'v034_san_e3_l2_03': '現在完了進行形 has been practicing で「ずっと練習している」を表します。「朝から」は起点を表す since を使って since morning とし、文末に置きます。',
    'v034_san_e3_l2_04': '期間をたずねる How long を文頭に置き、その後に疑問文の語順 have you been playing を続けます。現在完了進行形の疑問文です。',
    'v034_san_e3_l2_05': '現在完了進行形は have/has been＋〜ing の形です。has being は being ではなく been、have been play は play を ing形 playing にする必要があります。',
    'v034_san_e3_l2_06': 'have been waiting は動作の継続、has lived for five years は状態の継続を表します。went と ate は yesterday・at noon が示す過去の出来事で、今まで続いていません。',
    'v034_san_e3_l3_01': '受け身は be動詞＋過去分詞です。was と in 2010 から過去の受け身とわかるので、build の過去分詞 built（constructed も可）を入れます。',
    'v034_san_e3_l3_02': '受け身 is＋過去分詞で「話されている」を表します。speak は不規則動詞で speak-spoke-spoken と変化するので spoken です。',
    'v034_san_e3_l3_03': '受け身 is loved で「愛されている」を表し、その後に行為者を by many people「多くの人によって」で示します。',
    'v034_san_e3_l3_04': '過去の受け身は was＋過去分詞です。take の過去分詞 taken を使い、時を表す yesterday は文末に置きます。',
    'v034_san_e3_l3_05': '受け身は be動詞＋過去分詞なので、is cleaned と was written の文が受け身です。They clean… と She wrote… は主語が自分で動作をする能動態の文です。',
    'v034_san_e3_l3_06': '受け身の基本形は「be動詞＋過去分詞」の2つでできています。時制は be動詞で表すので、必ず未来形や進行形にする必要はありません。',
    'v034_san_e3_l4_01': '現在分詞 standing が「立っている」という意味で、by the window とひとまとまりになって後ろから the girl を説明しています。',
    'v034_san_e3_l4_02': '過去分詞 painted（drawn も可）が「描かれた」という意味で、by my sister とひとまとまりになって後ろから a picture を説明しています。',
    'v034_san_e3_l4_03': 'running in the park「公園で走っている」が後ろから the boy を説明します。I know the boy の後に分詞のまとまりを続けます。',
    'v034_san_e3_l4_04': '過去分詞 made「作られた」が in Japan とまとまり、後ろから a car を説明します。This is a car の後にこのまとまりを置きます。',
    'v034_san_e3_l4_05': 'running over there が The dog を、made by Ken が a cake を後ろから説明しています。She runs every day. と Ken made a cake. は分詞で名詞を説明していません。',
    'v034_san_e3_l4_06': '「〜している」は現在分詞 playing、「〜された」は過去分詞 written で名詞を後ろから説明します。原形の play や make のままでは名詞を説明できません。',
    'v034_san_e3_l5_01': '先行詞 a boy は人で、空欄の後に動詞 can speak が続くので、主格の関係代名詞 who（that も可）を入れます。',
    'v034_san_e3_l5_02': '先行詞 a robot は物で、空欄の後に動詞 helps が続くので、主格の関係代名詞 that（which も可）を入れます。',
    'v034_san_e3_l5_03': '主格の関係代名詞 that の直後に動詞 comes を続け、that comes here every day で the dog を後ろから説明します。',
    'v034_san_e3_l5_04': '先行詞 a woman は人なので関係代名詞は who を使い、who teaches English が後ろから a woman を説明します。',
    'v034_san_e3_l5_05': 'who plays・that is のように関係代名詞の直後に動詞が来るのが主格です。who I met は後ろに主語 I がある目的格、the book I bought は目的格の省略なので主格ではありません。',
    'v034_san_e3_l5_06': '先行詞が人のときの主格は who か that です。which は物や動物に使い、where は場所を表す関係副詞なので使えません。',
    'v034_san_e3_l6_01': '先行詞 the book は物で、空欄の後に主語 I＋動詞 bought が続くので、目的格の関係代名詞 that（which も可）を入れます。',
    'v034_san_e3_l6_02': '先行詞 The person は人で、空欄の後に we met（主語＋動詞）が続くので目的格です。who・that・whom のどれも使えます。',
    'v034_san_e3_l6_03': '目的格の関係代名詞 that の後に主語＋動詞 I saw を続け、that I saw yesterday で the movie を後ろから説明します。',
    'v034_san_e3_l6_04': '目的格の関係代名詞が省略された形です。you made が後ろから The food を説明し、そのまとまり全体が主語となって was delicious が続きます。',
    'v034_san_e3_l6_05': 'that I read・which we watched は後ろに主語＋動詞が続く目的格なので省略できます。who runs・that barks は直後に動詞が続く主格なので省略できません。',
    'v034_san_e3_l6_06': 'The book (that) I bought が主語のまとまりです。bought の目的語は関係代名詞が受け持つので it を重ねるのは誤りで、that bought I は語順が誤りです。',
    'v034_san_e3_l7_01': '現在の事実と違う仮定は「If＋主語＋過去形, 主語＋would＋原形」で表します。後半の would が目印なので、have の過去形 had を入れます。',
    'v034_san_e3_l7_02': 'I wish の後は仮定法で、動詞や助動詞を過去形にします。「泳げたら」なので can の過去形 could を入れて could swim とします。',
    'v034_san_e3_l7_03': '仮定法過去では be動詞は主語に関係なく were を使い、If I were you とします。コンマの後に I would＋原形 agree with the idea を続けます。',
    'v034_san_e3_l7_04': 'I wish＋仮定法過去で、今かなわない願いを表します。be動詞は were を使って I wish I were taller とします。',
    'v034_san_e3_l7_05': 'If I had…, I would… と I wish I could… は事実と違うことを過去形で表す仮定法です。If it rains… と if I have time は実際に起こりうることを表す普通の条件の文です。',
    'v034_san_e3_l7_06': '仮定法は If I were you, I would… のように後半に would を使い、I wish の後も過去形 had にします。will apologize や I wish I have は仮定法の形になっていません。',
    'v034_san_e3_l8_01': '間接疑問では疑問詞 where の後を「主語＋動詞」の語順にします。主語 she は3人称単数なので、live に s を付けて lives です。',
    'v034_san_e3_l8_02': '間接疑問 what he wants は「疑問詞＋主語＋動詞」の順です。does は使わず、主語 he に合わせて want に3単現の s を付けます。',
    'v034_san_e3_l8_03': '文の中に疑問文を入れる間接疑問なので、when の後は he will come の「主語＋動詞」の順にします。will he come とはしません。',
    'v034_san_e3_l8_04': 'tell me の後に間接疑問 where the station is を置きます。疑問詞の後は主語 the station＋動詞 is の順です。',
    'v034_san_e3_l8_05': '間接疑問は「疑問詞＋主語＋動詞」の順なので where she lives・what he wants が正しい形です。does を入れて疑問文の語順にした2つは誤りです。',
    'v034_san_e3_l8_06': '間接疑問は where や what などの疑問詞の後に「主語＋動詞」を続けます。do/does は置かず、主語と動詞を入れかえる倒置もしません。',
    'v034_tok_e3_u1_01': '経験をたずねる Have you ever＋過去分詞の文です。eat の過去分詞 eaten（have の過去分詞 had も可）を入れます。',
    'v034_tok_e3_u1_02': '「〜へ行ったことがある」は have been to で表します。never と組み合わせた has never been to で「一度も行ったことがない」になります。',
    'v034_tok_e3_u1_03': '「〜へ行ったことがある」は have been to〜で表します。I have been to the festival の後に、回数を表す twice を文末に置きます。',
    'v034_tok_e3_u1_04': '経験をたずねる疑問文は「Have＋主語＋ever＋過去分詞」の順です。ever は過去分詞 made の前に置き、その後に this dish を続けます。',
    'v034_tok_e3_u1_05': '経験用法は have＋過去分詞で、three times や never が経験の目印です。finished…yesterday は過去形、is studying は現在進行形の文です。',
    'v034_tok_e3_u1_06': 'ever「今までに」・never「一度も〜ない」・once「一度」は経験用法の目印です。last night は過去の時点を表すので現在完了とは使えません。',
    'v034_tok_e3_u2_01': '現在完了進行形「have been＋〜ing」です。for two hours「2時間」から動作が続いているとわかるので、study の ing形 studying（learning も可）を入れます。',
    'v034_tok_e3_u2_02': 'How long have you been 〜ing? で「どのくらいの間〜し続けているか」をたずねます。been の後なので wait の ing形 waiting を入れます。',
    'v034_tok_e3_u2_03': '現在完了進行形 has been practicing で「ずっと練習している」を表します。「朝から」は起点を表す since を使って since morning とし、文末に置きます。',
    'v034_tok_e3_u2_04': '期間をたずねる How long を文頭に置き、その後に疑問文の語順 have you been playing を続けます。現在完了進行形の疑問文です。',
    'v034_tok_e3_u2_05': '現在完了進行形は have/has been＋〜ing の形です。has being は being ではなく been、have been play は play を ing形 playing にする必要があります。',
    'v034_tok_e3_u2_06': 'have been waiting は動作の継続、has lived for five years は状態の継続を表します。went と ate は yesterday・at noon が示す過去の出来事で、今まで続いていません。',
    'v034_tok_e3_u3_01': '「It is … for 人 to＋動詞の原形」で「人が〜することは…だ」を表します。for us の後に to を置いて to help とします。',
    'v034_tok_e3_u3_02': '「want＋人＋to＋動詞の原形」で「人に〜してほしい」を表します。you の後に to を置いて to read とします。',
    'v034_tok_e3_u3_03': '「let＋人＋動詞の原形」で「人に〜させてあげる（許す）」を表します。let us の後は to を付けず、原形 open を続けます。',
    'v034_tok_e3_u3_04': '「help＋人＋動詞の原形」で「人が〜するのを手伝う」を表します。helped me の後に原形 carry を置き、目的語 the box を続けます。',
    'v034_tok_e3_u3_05': 'want＋人＋to〜 と It is … for 人 to〜 は正しい形です。let と help の後は動詞の原形を使うので、let me to go と helped me carried は誤りです。',
    'v034_tok_e3_u3_06': 'let と help は「人＋動詞の原形」をとります。want と ask は「人＋to＋動詞の原形」をとるので、原形を直接続けるのは誤りです。',
    'v034_tok_e3_u4_01': '間接疑問では疑問詞 where の後を「主語＋動詞」の語順にします。主語 she は3人称単数なので、live に s を付けて lives です。',
    'v034_tok_e3_u4_02': '間接疑問 what he wants は「疑問詞＋主語＋動詞」の順です。does は使わず、主語 he に合わせて want に3単現の s を付けます。',
    'v034_tok_e3_u4_03': '文の中に疑問文を入れる間接疑問なので、when の後は he will come の「主語＋動詞」の順にします。will he come とはしません。',
    'v034_tok_e3_u4_04': 'tell me の後に間接疑問 where the station is を置きます。疑問詞の後は主語 the station＋動詞 is の順です。',
    'v034_tok_e3_u4_05': '間接疑問は「疑問詞＋主語＋動詞」の順なので where she lives・what he wants が正しい形です。does を入れて疑問文の語順にした2つは誤りです。',
    'v034_tok_e3_u4_06': '間接疑問は where や what などの疑問詞の後に「主語＋動詞」を続けます。do/does は置かず、主語と動詞を入れかえる倒置もしません。',
    'v034_tok_e3_u5_01': '先行詞 the book は物で、空欄の後に主語 I＋動詞 bought が続くので、目的格の関係代名詞 that（which も可）を入れます。',
    'v034_tok_e3_u5_02': '先行詞 The person は人で、空欄の後に we met（主語＋動詞）が続くので目的格です。who・that・whom のどれも使えます。',
    'v034_tok_e3_u5_03': '目的格の関係代名詞 that の後に主語＋動詞 I saw を続け、that I saw yesterday で the movie を後ろから説明します。',
    'v034_tok_e3_u5_04': '目的格の関係代名詞が省略された形です。you made が後ろから The food を説明し、そのまとまり全体が主語となって was delicious が続きます。',
    'v034_tok_e3_u5_05': 'that I read・which we watched は後ろに主語＋動詞が続く目的格なので省略できます。who runs・that barks は直後に動詞が続く主格なので省略できません。',
    'v034_tok_e3_u5_06': 'The book (that) I bought が主語のまとまりです。bought の目的語は関係代名詞が受け持つので it を重ねるのは誤りで、that bought I は語順が誤りです。',
    'v034_tok_e3_u6_01': '現在の事実と違う仮定は「If＋主語＋過去形, 主語＋would＋原形」で表します。後半の would が目印なので、have の過去形 had を入れます。',
    'v034_tok_e3_u6_02': 'I wish の後は仮定法で、動詞や助動詞を過去形にします。「泳げたら」なので can の過去形 could を入れて could swim とします。',
    'v034_tok_e3_u6_03': '仮定法過去では be動詞は主語に関係なく were を使い、If I were you とします。コンマの後に I would＋原形 agree with the idea を続けます。',
    'v034_tok_e3_u6_04': 'I wish＋仮定法過去で、今かなわない願いを表します。be動詞は were を使って I wish I were taller とします。',
    'v034_tok_e3_u6_05': 'If I had…, I would… と I wish I could… は事実と違うことを過去形で表す仮定法です。If it rains… と if I have time は実際に起こりうることを表す普通の条件の文です。',
    'v034_tok_e3_u6_06': '仮定法は If I were you, I would… のように後半に would を使い、I wish の後も過去形 had にします。will apologize や I wish I have は仮定法の形になっていません。',
    'v034_kai_e3_p1_01': '経験をたずねる Have you ever＋過去分詞の文です。eat の過去分詞 eaten（have の過去分詞 had も可）を入れます。',
    'v034_kai_e3_p1_02': '「〜へ行ったことがある」は have been to で表します。never と組み合わせた has never been to で「一度も行ったことがない」になります。',
    'v034_kai_e3_p1_03': '「〜へ行ったことがある」は have been to〜で表します。I have been to the festival の後に、回数を表す twice を文末に置きます。',
    'v034_kai_e3_p1_04': '経験をたずねる疑問文は「Have＋主語＋ever＋過去分詞」の順です。ever は過去分詞 made の前に置き、その後に this dish を続けます。',
    'v034_kai_e3_p1_05': '経験用法は have＋過去分詞で、three times や never が経験の目印です。finished…yesterday は過去形、is studying は現在進行形の文です。',
    'v034_kai_e3_p1_06': 'ever「今までに」・never「一度も〜ない」・once「一度」は経験用法の目印です。last night は過去の時点を表すので現在完了とは使えません。',
    'v034_kai_e3_p2_01': '現在完了進行形「have been＋〜ing」です。for two hours「2時間」から動作が続いているとわかるので、study の ing形 studying（learning も可）を入れます。',
    'v034_kai_e3_p2_02': 'How long have you been 〜ing? で「どのくらいの間〜し続けているか」をたずねます。been の後なので wait の ing形 waiting を入れます。',
    'v034_kai_e3_p2_03': '現在完了進行形 has been practicing で「ずっと練習している」を表します。「朝から」は起点を表す since を使って since morning とし、文末に置きます。',
    'v034_kai_e3_p2_04': '期間をたずねる How long を文頭に置き、その後に疑問文の語順 have you been playing を続けます。現在完了進行形の疑問文です。',
    'v034_kai_e3_p2_05': '現在完了進行形は have/has been＋〜ing の形です。has being は being ではなく been、have been play は play を ing形 playing にする必要があります。',
    'v034_kai_e3_p2_06': 'have been waiting は動作の継続、has lived for five years は状態の継続を表します。went と ate は yesterday・at noon が示す過去の出来事で、今まで続いていません。',
    'v034_kai_e3_p3_01': '「tell＋人＋that＋文」で「人に〜だと言う」を表します。told me の後に接続詞 that を置き、she was busy を続けます。',
    'v034_kai_e3_p3_02': '「make＋人＋動詞の原形」で「人に〜させる」を表します。「感じました」なので原形 feel を入れ、made me feel happy とします。',
    'v034_kai_e3_p3_03': '「call＋A＋B」で「AをBと呼ぶ」を表します。動詞 call の後に目的語 him、その後に呼び名 Ken を置きます。',
    'v034_kai_e3_p3_04': '「make＋人＋動詞の原形」で「人に〜させる」を表します。made me の後に to を付けず原形 laugh を続けます。',
    'v034_kai_e3_p3_05': 'tell＋人＋that〜 と call＋A＋B は正しい形です。make＋人の後は原形なので made me cried は誤り、told の直後には人を置くので told that me も誤りです。',
    'v034_kai_e3_p4_01': '間接疑問では疑問詞 where の後を「主語＋動詞」の語順にします。主語 she は3人称単数なので、live に s を付けて lives です。',
    'v034_kai_e3_p4_02': '間接疑問 what he wants は「疑問詞＋主語＋動詞」の順です。does は使わず、主語 he に合わせて want に3単現の s を付けます。',
    'v034_kai_e3_p4_03': '文の中に疑問文を入れる間接疑問なので、when の後は he will come の「主語＋動詞」の順にします。will he come とはしません。',
    'v034_kai_e3_p4_04': 'tell me の後に間接疑問 where the station is を置きます。疑問詞の後は主語 the station＋動詞 is の順です。',
    'v034_kai_e3_p4_05': '間接疑問は「疑問詞＋主語＋動詞」の順なので where she lives・what he wants が正しい形です。does を入れて疑問文の語順にした2つは誤りです。',
    'v034_kai_e3_p4_06': '間接疑問は where や what などの疑問詞の後に「主語＋動詞」を続けます。do/does は置かず、主語と動詞を入れかえる倒置もしません。',
    'v034_kai_e3_p5_01': '先行詞 a boy は人で、空欄の後に動詞 can speak が続くので、主格の関係代名詞 who（that も可）を入れます。',
    'v034_kai_e3_p5_02': '先行詞 a robot は物で、空欄の後に動詞 helps が続くので、主格の関係代名詞 that（which も可）を入れます。',
    'v034_kai_e3_p5_03': '主格の関係代名詞 that の直後に動詞 comes を続け、that comes here every day で the dog を後ろから説明します。',
    'v034_kai_e3_p5_04': '先行詞 a woman は人なので関係代名詞は who を使い、who teaches English が後ろから a woman を説明します。',
    'v034_kai_e3_p5_05': 'who plays・that is のように関係代名詞の直後に動詞が来るのが主格です。who I met は後ろに主語 I がある目的格、the book I bought は目的格の省略なので主格ではありません。',
    'v034_kai_e3_p5_06': '先行詞が人のときの主格は who か that です。which は物や動物に使い、where は場所を表す関係副詞なので使えません。',
    'v034_kai_e3_p6_01': '先行詞 the book は物で、空欄の後に主語 I＋動詞 bought が続くので、目的格の関係代名詞 that（which も可）を入れます。',
    'v034_kai_e3_p6_02': '先行詞 The person は人で、空欄の後に we met（主語＋動詞）が続くので目的格です。who・that・whom のどれも使えます。',
    'v034_kai_e3_p6_03': '目的格の関係代名詞 that の後に主語＋動詞 I saw を続け、that I saw yesterday で the movie を後ろから説明します。',
    'v034_kai_e3_p6_04': '目的格の関係代名詞が省略された形です。you made が後ろから The food を説明し、そのまとまり全体が主語となって was delicious が続きます。',
    'v034_kai_e3_p6_05': 'that I read・which we watched は後ろに主語＋動詞が続く目的格なので省略できます。who runs・that barks は直後に動詞が続く主格なので省略できません。',
    'v034_kai_e3_p6_06': 'The book (that) I bought が主語のまとまりです。bought の目的語は関係代名詞が受け持つので it を重ねるのは誤りで、that bought I は語順が誤りです。',
    'v034_kai_e3_p7_01': '現在の事実と違う仮定は「If＋主語＋過去形, 主語＋would＋原形」で表します。後半の would が目印なので、have の過去形 had を入れます。',
    'v034_kai_e3_p7_02': 'I wish の後は仮定法で、動詞や助動詞を過去形にします。「泳げたら」なので can の過去形 could を入れて could swim とします。',
    'v034_kai_e3_p7_03': '仮定法過去では be動詞は主語に関係なく were を使い、If I were you とします。コンマの後に I would＋原形 agree with the idea を続けます。',
    'v034_kai_e3_p7_04': 'I wish＋仮定法過去で、今かなわない願いを表します。be動詞は were を使って I wish I were taller とします。',
    'v034_kai_e3_p7_05': 'If I had…, I would… と I wish I could… は事実と違うことを過去形で表す仮定法です。If it rains… と if I have time は実際に起こりうることを表す普通の条件の文です。',
    'v034_kai_e3_p7_06': '仮定法は If I were you, I would… のように後半に would を使い、I wish の後も過去形 had にします。will apologize や I wish I have は仮定法の形になっていません。',
}

# Content corrections found during the teacher review. Answer keys (answers/answerOrder/blanks) are unchanged.
CORRECTIONS = {
    # has lived は「状態」の継続で「動作」ではないため、旧文「動作を表せる文」では正解 [0,1] と矛盾した
    'v034_san_e3_l2_06': {'question': "過去から今まで続いている動作や状態を表す文をすべて選びなさい。"},
    # 正解の「疑問詞を使える」は語順の特徴ではないため、旧文「正しい語順の特徴」と合っていなかった
    'v034_san_e3_l8_06': {'question': "間接疑問文の特徴として正しいものをすべて選びなさい。"},
    # has lived は「状態」の継続で「動作」ではないため、旧文「動作を表せる文」では正解 [0,1] と矛盾した
    'v034_tok_e3_u2_06': {'question': "過去から今まで続いている動作や状態を表す文をすべて選びなさい。"},
    # 正解の「疑問詞を使える」は語順の特徴ではないため、旧文「正しい語順の特徴」と合っていなかった
    'v034_tok_e3_u4_06': {'question': "間接疑問文の特徴として正しいものをすべて選びなさい。"},
    # has lived は「状態」の継続で「動作」ではないため、旧文「動作を表せる文」では正解 [0,1] と矛盾した
    'v034_kai_e3_p2_06': {'question': "過去から今まで続いている動作や状態を表す文をすべて選びなさい。"},
    # 正解の「疑問詞を使える」は語順の特徴ではないため、旧文「正しい語順の特徴」と合っていなかった
    'v034_kai_e3_p4_06': {'question': "間接疑問文の特徴として正しいものをすべて選びなさい。"},
    # 旧選択肢 "I saw a dog running fast." は知覚動詞 see＋O＋〜ing（SVOC）とも読め、「名詞を後ろから説明」と一意に決まらなかった。正解番号 [0,1] は不変
    'v034_san_e3_l4_05': {'choices': ["The dog running over there is mine.", "This is a cake made by Ken.", "She runs every day.", "Ken made a cake."]},
    # let は許可（〜させてあげる）であり、旧文「開けさせました」は強制の make を示唆していた
    'v034_tok_e3_u3_03': {'question': "「先生は私たちに窓を開けさせてくれました。」になるように並べ替えなさい。"},
    # 語群は the box なのに日本語が「荷物」で対応していなかった
    'v034_tok_e3_u3_04': {'question': "「彼は私が箱を運ぶのを手伝ってくれました。」になるように並べ替えなさい。"},
}


def main():
    path = ROOT / 'data/questions.json'
    base = json.loads(path.read_text(encoding='utf-8'))
    by_id = {q['id']: q for q in base['questions']}
    missing = sorted((set(EXPLANATIONS) | set(CORRECTIONS)) - set(by_id))
    if missing:
        sys.exit(f'missing ids: {missing}')
    changed = 0
    for qid, text in EXPLANATIONS.items():
        q = by_id[qid]
        if q.get('subject') != 'english' or 3 not in q.get('grades', []):
            sys.exit(f'{qid}: not a grade-3 English question')
        if q.get('explanation') not in (PLACEHOLDER, text):
            sys.exit(f'{qid}: unexpected existing explanation, refusing to overwrite')
        if q.get('explanation') != text:
            q['explanation'] = text
            changed += 1
    for qid, fields in CORRECTIONS.items():
        q = by_id[qid]
        for field, value in fields.items():
            if field not in q:
                sys.exit(f'{qid}: field {field} missing')
            if q[field] != value:
                q[field] = value
                changed += 1
    path.write_text(json.dumps(base, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (ROOT / 'data/questions.js').write_text(
        'window.QUESTION_DATA = ' + json.dumps(base, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
    print(f'updated fields: {changed}')


if __name__ == '__main__':
    main()
