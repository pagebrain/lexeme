// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

// import GPT3Tokenizer from 'gpt3-tokenizer';

type Data = {
  name: string
}

import type { TaskType } from '@/types/data';
import  { TasksMap } from '@/types/data';
const { createParser, ParsedEvent, ReconnectInterval } = require("eventsource-parser");



 async function inference(messages, apiKey, modelId, temperature) {
    console.log("START REQUEST")
    // const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${ process.env.OPENAI_API_KEY }`,
    //   },
    //   method: 'POST',
    //   body: JSON.stringify({
    //     model: "gpt-3.5-turbo",
    //     messages: [
    //       {
    //         role: 'system',
    //         content: systemPrompts[task],
    //       },
    //       ...messages,
    //     ],
    //     max_tokens: 500,
    //     temperature: 1,
    //     stream: true
    //   }),
    // });


      console.log("MESSAGES", messages)

    const payload = JSON.stringify({
        model: modelId,
        messages: messages,
        max_tokens: 500,
        temperature: parseFloat(temperature),
        stream: true
      })
    const resx = await fetch("https://api.openai.com/v1/chat/completions", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        method: "POST",
        body: payload
      });
      console.log(`curl -X POST "https://api.openai.com/v1/chat/completions" -H "Authorization: Bearer ${apiKey}" -H "Content-Type: application/json" -d '${payload}'`)
    // // console.log("Response content:", response.body)
    // const data = await response.json()
    // console.log("Response content:", data)
    // return res.json(data['choices'][0])


    // const stream = await OpenAIStream(req.body);
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    if (resx.status !== 200) {
      const result = await resx.text();
      throw new Error(result)
    }

    const stream = new ReadableStream({
        async start(controller) {
          function onParse(event) {
            if (event.type === "event") {
              const data = event.data;
              if (data === "[DONE]") {
                controller.close();
                return;
              }
              // try {
              //   const json = JSON.parse(data);
              //   const text = json.choices[0].text;
              //   if (counter < 2 && (text.match(/\n/) || []).length) {
              //     return;
              //   }
              //   const queue = encoder.encode(text);
              //   controller.enqueue(queue);
              //   counter++;
              // } catch (e) {
              //   controller.error(e);
              // }
              try {
                const json = JSON.parse(data);
                const text = json.choices[0].delta.content;
                const queue = encoder.encode(text);
                controller.enqueue(queue);
              } catch (e) {
                console.log(e)
                controller.error(e);
              }
            }
          }
          const parser = createParser(onParse);
          for await (const chunk of resx.body) {
            parser.feed(decoder.decode(chunk));
          }
        },
      });



      return stream;
};



export default async function handler(req, res) {
    let { task, selection, before, after, messages, modelId, apiKey, temperature } = req.body;

      console.log("TASK:", task, TasksMap)

      if(!apiKey){
        apiKey = process.env.OPENAI_API_KEY
      }
      if(!apiKey){
        return res.status(500).json({ status: 500, message: "OpenAPI key required" })
      }

try{
    const stream = await inference(messages, apiKey, modelId, temperature);
    res.writeHead(200, { 'Transfer-Encoding': 'chunked' })
    for await (const chunk of stream) {
      res.write(chunk)
    }
    res.end();
} catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500 })
  }
};
