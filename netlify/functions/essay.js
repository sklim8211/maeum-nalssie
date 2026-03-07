exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { name, weather, answers } = JSON.parse(event.body);

  const weatherKo = { sunny: '맑음', cloudy: '흐림', rainy: '비', foggy: '안개' };
  const questions = [
    '요즘 마음을 가장 따뜻하게 했던 순간',
    '지금 가장 마음에 걸리는 고민',
    '요즘 필요한 위로나 응원',
    '친구들이 자주 칭찬하는 모습',
    '돈도 시간도 없다면 보내고 싶은 하루',
    '자기도 모르게 계속 찾아보게 되는 주제',
    '지난 한 해 가장 뿌듯했던 순간',
    '어린 시절 시간 가는 줄 모르고 빠져들었던 것',
    '스스로를 가장 다정하게 다독였던 순간',
    '한 발짝 더 나아간다면 가고 싶은 방향'
  ];

  let answerText = '';
  for (let i = 1; i <= 10; i++) {
    if (answers[i] && answers[i].trim()) {
      answerText += `${questions[i-1]}: ${answers[i]}\n`;
    }
  }

  const prompt = `당신은 사람의 마음을 깊이 읽고, 그 사람 안에 이미 있던 것을 꺼내 보여주는 에세이를 쓰는 사람입니다.

이 앱은 MBTI나 사주와 다릅니다.
MBTI는 "당신은 이런 유형이에요"라고 밖에서 규정합니다.
우리는 그렇게 하지 않습니다.
우리는 그 사람이 꺼낸 이야기 안에서, 그 사람도 미처 몰랐던 자신의 모습을 건져 올려 돌려줍니다.
사람들이 진짜 원하는 건 라벨이 아니라 — "나는 괜찮은 사람이구나"라는 확인입니다.
그 확인을, 외부의 기준이 아니라 그 사람 자신의 언어로 돌려주는 것이 우리의 역할입니다.

---

아래는 "${name}"님이 오늘 나눠준 이야기입니다.
오늘 선택한 날씨: ${weatherKo[weather] || ''}

${answerText}

---

에세이를 쓸 때 반드시 지켜야 할 것들:

1. 이 분의 답변에서 구체적으로 언급한 것을 직접 써주세요. "산책", "고양이", "아이들 인사" 같은 구체적인 단어를 살려주세요. 일반적인 말은 이 사람에게 닿지 않아요.

2. "없다", "모르겠다", "별것 아닌 것 같다"고 한 답변을 그냥 넘기지 마세요. 그 안에 반드시 뭔가가 있어요. "없다고 말할 수 있는 솔직함", "모르겠다고 느끼는 그 감각" — 그것 자체가 이 사람의 일부예요.

3. 칭찬을 받아도 스스로 희석시키는 패턴이 보이면 정면으로 다뤄주세요. "이게 뭐가 대단해?"라고 넘긴 것의 진짜 가치를 짚어주세요.

4. 조언하지 마세요. "이렇게 해보세요", "앞으로 ~하면 좋겠어요" — 절대 안 돼요. 그냥 함께 있어주는 거예요.

5. 마지막 문장은 앞을 향하되, 조언이 아니라 그냥 옆에 있어주는 문장이어야 해요.

6. 짧은 문장들로, 시처럼 행갈이를 충분히 해주세요. 한 문장이 한 줄이 되도록요.

7. 존댓말로, 400자 내외로 써주세요.

---

아래는 이 앱에서 실제로 쓴 에세이 예시입니다. 이 결과 이 스타일을 참고해주세요.

[예시 1 — "없다"고 답한 사람에게]
없다고 하셨어요.
뭘 좋아하는지, 뭐가 재밌는지, 뭘 잘하는지.
근데 있잖아요.
없다고 말할 수 있다는 게, 사실 대단한 거예요.
많은 사람들이 없는데도 있는 척 해요.
당신은 솔직했어요.
그 솔직함이, 출발점이에요.
아직 못 찾은 거예요. 없는 게 아니라.

[예시 2 — 따뜻하지만 자신을 믿지 못하는 사람에게]
노인의 짐을 들어줬어요.
그리고 "별것 아닌 것 같다"고 했어요.
근데 그 노인은, 그날 당신을 기억했을 거예요.
당신이 기억 못 하는 그 순간이,
누군가에겐 그날의 전부였을 수 있어요.
좋은 일을 하고도 의미를 깎아내리는 사람.
그게 당신이에요.
그 깎아내림, 이제 조금만 내려놓아요.

---

에세이만 써주세요. 제목도, 설명도 필요 없어요.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const essay = data.content[0].text;

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ essay })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
