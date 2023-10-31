// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

// import GPT3Tokenizer from 'gpt3-tokenizer';

type Data = {
  name: string
}

import type { TaskType } from '@/types/data';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { task, selection, before, after } = req.body;


    // const tokenizer = new GPT3Tokenizer({ type: 'gpt3' });

    // const {bpe: prompt_tokens} = tokenizer.encode(promptToSend);

    // let tokenCount = prompt_tokens.length;

    const systemPrompts = {
      'improve': 'Rewrite the following',
      'expand': 'Rewrite the following',
      'shorten': 'Rewrite the following as concisely as possible',
    }

    const messages = [{
      role: "user",
      content: selection
    }]
    
    const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ process.env.OPENAI_API_KEY }`,
      },
      method: 'POST',
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: 'system',
            content: systemPrompts[task],
          },
          ...messages,
        ],
        max_tokens: 500,
        temperature: 1
      }),
    });
    // console.log("Response content:", response.body)
    const data = await response.json()
    console.log("Response content:", data)
    return res.json(data['choices'][0])

  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500 })
  }
};