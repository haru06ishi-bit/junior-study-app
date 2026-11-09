"""Reproducible correction of the original English fill bank (no ID changes)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
# Full Japanese meanings disambiguate tense, person, and the action being tested.
MEANINGS = {
    'She （1） already （2） her homework.': '彼女はもう宿題を終えています。',
    'If I （1） you, I （2） study harder.': 'もし私があなたなら、もっと一生懸命勉強するでしょう。',
    'These pictures （1） taken in Kenya.': 'これらの写真はケニアで撮られました。',
    'My teacher helped me （1） the map.': '先生は私が地図を読むのを手伝ってくれました。',
    'I have （1） finished my homework.': '私はちょうど宿題を終えたところです。',
    'Have you （1） visited Nara?': 'あなたは今までに奈良を訪れたことがありますか。',
    'We have lived here （1） 2022.': '私たちは2022年からずっとここに住んでいます。',
    'She has been （1） English for two hours.': '彼女は2時間ずっと英語を勉強しています。',
    'I know a girl （1） speaks French.': '私はフランス語を話す女の子を知っています。',
    'This is a robot （1） can carry boxes.': 'これは箱を運べるロボットです。',
    'This is the song （1） I like best.': 'これは私がいちばん好きな歌です。',
    'The person （1） we met was kind.': '私たちが会ったその人は親切でした。',
    'Look at the boy （1） near the door.': 'ドアの近くに立っている男の子を見てください。',
    'I like the song （1） by this singer.': '私はこの歌手によって書かれた歌が好きです。',
    'I wish I （1） play the piano well.': 'ピアノを上手に弾けたらいいのに。',
    'Thank you （1） helping me this year.': '今年私を助けてくれてありがとう。',
    'I hope we can see each other （1）.': '私たちがまた会えることを願っています。',
    'I have （1） this movie twice.': '私はこの映画を2回見たことがあります。',
    'She has （1） finished her homework.': '彼女はちょうど宿題を終えたところです。',
    'I have been （1） English for two hours.': '私は2時間ずっと英語を勉強しています。',
    'How long have you been （1） here?': 'あなたはどのくらいの間ここで待ち続けていますか。',
    'This bridge was （1） in 2010.': 'この橋は2010年に建てられました。',
    'English is （1） in many countries.': '英語は多くの国で話されています。',
    'Look at the girl （1） by the window.': '窓のそばに立っている女の子を見てください。',
    'This is a picture （1） by my sister.': 'これは私の姉（妹）によって描かれた絵です。',
    'I know a boy （1） can speak French.': '私はフランス語を話せる男の子を知っています。',
    'This is a robot （1） helps people.': 'これは人々を助けるロボットです。',
    'This is the book （1） I bought yesterday.': 'これは私が昨日買った本です。',
    'If I （1） more time, I would read more books.': 'もしもっと時間があれば、私はもっと本を読むでしょう。',
    'I wish I （1） swim faster.': 'もっと速く泳げたらいいのに。',
    'Do you know where she （1）?': 'あなたは彼女がどこに住んでいるか知っていますか。',
    'Please tell me what he （1）.': '彼が何を欲しがっているか私に教えてください。',
    'She （1） soccer every Sunday.': '彼女は毎週日曜日にサッカーをします。',
    'Have you ever （1） sushi abroad?': 'あなたは今までに外国ですしを食べたことがありますか。',
    'She has never （1） to Canada.': '彼女は一度もカナダへ行ったことがありません。',
    'It is important for us （1） help animals.': '私たちが動物を助けることは大切です。',
    'I want you （1） read this book.': '私はあなたにこの本を読んでほしいです。',
    'My mother told me （1） she was busy.': '母は私に、忙しいと言いました。',
    'The news made me （1） happy.': 'その知らせで私は幸せだと感じました。',
    'I （1） Yuki. Nice to meet you.': '私はユキです。初めまして。',
    'He can （1） fast.': '彼は速く走ることができます。',
    'This is （1） treasure.': 'これは私の宝物です。',
    'I want to （1） Kyoto.': '私は京都を訪れたいです。',
    'She is （1） sister.': '彼女は私の姉（妹）です。',
    'I （1） soccer after school.': '私は放課後サッカーをします。',
    'I （1） Japanese festivals.': '私は日本のお祭りが好きです。',
    'You should （1） careful.': 'あなたは注意するべきです。',
    'I like （1） books.': '私は本を読むことが好きです。',
    'I want to （1） English more.': '私はもっと英語を勉強したいです。',
    'Do you （1） music?': 'あなたは音楽が好きですか。',
    'She （1） soccer after school.': '彼女は放課後サッカーをします。',
    'I was （1） dinner at seven yesterday.': '私は昨日7時に夕食を食べていました。',
    'I want （1） learn more about Japan.': '私は日本についてもっと学びたいです。',
    'I am going （1） visit Kyoto next week.': '私は来週京都を訪れる予定です。',
    'I （1） a student.': '私は生徒です。',
    '（1） you help me?': '私を手伝ってくれませんか。',
    'I （1） （2） a book then.': 'そのとき私は本を読んでいました。',
    'I want （1） （2） Kyoto.': '私は京都を訪れたいです。',
    'I am （1） to visit Osaka tomorrow.': '私は明日大阪を訪れる予定です。',
    'English （1） （2） in many countries.': '英語は多くの国で話されています。',
}
ALIASES = {
    'I want to （1） English more.': [['study', 'learn']],
    'She has been （1） English for two hours.': [['studying', 'learning']],
    'I have been （1） English for two hours.': [['studying', 'learning']],
    'I have （1） this movie twice.': [['seen', 'watched']],
    'This is a picture （1） by my sister.': [['painted', 'drawn']],
    '（1） you help me?': [['Can', 'Could', 'Will', 'Would']],
    'I （1） Japanese festivals.': [['like', 'love']],
    'Do you （1） music?': [['like', 'love']],
}


def correct(payload):
    count = 0
    for q in payload['questions']:
        if q['subject'] == 'english' and q['type'] == 'fill':
            if '\n日本語：' not in q['question']:
                sentence = q['question'].split('。')[-1].strip()
                q['question'] += '\n日本語：' + MEANINGS[sentence] + '（各空欄は1語）'
                if sentence in ALIASES:
                    q['blanks'] = ALIASES[sentence]
                count += 1
        if q['id'] == 'v034_kai_e3_p3_06':
            q['answers'] = [0, 1]
            q['explanation'] = 'call + 人 + 名詞は「人を～と呼ぶ」、make + 人 + 動詞の原形は「人に～させる」。tell + 人 + that節は内容を伝える表現で、補語や動詞原形をとる形ではありません。make + 人 + to + 動詞もこの意味では使えません。'
    return count


if __name__ == '__main__':
    base_path = ROOT / 'data/questions.json'
    base = json.loads(base_path.read_text(encoding='utf-8'))
    count = correct(base)
    raw = json.dumps(base, ensure_ascii=False, indent=2)
    base_path.write_text(raw + '\n', encoding='utf-8')
    (ROOT / 'data/questions.js').write_text('window.QUESTION_DATA = ' + json.dumps(base, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
    for path in sorted((ROOT / 'data').glob('question-supplement-v*.js')):
        old = path.read_text(encoding='utf-8')
        prefix, body = old.split('window.QUESTION_SUPPLEMENTS.push(', 1)
        payload = json.loads(body.strip()[:-2])
        n = correct(payload)
        if n:
            path.write_text(prefix + 'window.QUESTION_SUPPLEMENTS.push(' + json.dumps(payload, ensure_ascii=False, indent=2) + ');\n', encoding='utf-8')
            count += n
    print('Updated English fill prompts:', count)
