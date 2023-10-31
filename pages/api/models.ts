export default async function handler(req, res) {
  try {
    const { key } = req.body

    const response = await fetch(`https://api.openai.com/v1/models`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key && key != "" ? key : process.env.OPENAI_API_KEY}`,
      },
    });

    if (response.status === 401) {
      return res.status(500).json({ status: 500, context: response.body })
    } else if (response.status !== 200) {

      return res.status(500).json({ status: 500, context: response.body })
    }

    const data = await response.json();


    const models =  data.data.map((m)=>{
        if (m.id === 'gpt-3.5-turbo' || m.id === 'gpt-4') {
            return m.id;
        }
    }).filter(Boolean);

    return res.status(200).json(models)
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500 })
  }
};