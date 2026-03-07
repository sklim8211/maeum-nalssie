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

  const prompt = `당신은 사람의 마음을 깊이 이해하고 따뜻한 에세이를 써주는 분입니다.

아래는 "${name}"님이 "내 마음의 날씨" 앱에서 답변한 내용입니다.
오늘 선택한 날씨: ${weatherKo[weather] || ''}

${answerText}

위 답변을 바탕으로 이 분만을 위한 따뜻한 에세이를 써주세요.

반드시 지켜야 할 원칙:
1. 이 분이 스스로 깎아내리거나 별것 아니라고 한 것의 진짜 가치를 재조명해주세요
2. 답변에서 구체적으로 언급한 내용을 직접 언급해주세요. 일반적인 말은 피해요
3. 판단하거나 조언하지 말고, 그냥 따뜻하게 받아줘요
4. 마지막은 앞을 향하는 문장으로 끝내요
5. 존댓말로, 짧은 문장들로, 시처럼 행갈이를 충분히 해서 써주세요
6. 400자 내외로 써주세요

에세이만 써주세요. 다른 설명은 필요 없어요.`;

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
