# Lexeme - ChatGPT Text Editor

Inspired by SQL Workbench

Experience a fully integrated workflow for brainstorming, writing and rewriting with ChatGPT as your copilot, all within the same window. No more switching back and forth between ChatGPT and Text Editors.

Demo at [https://pagebrain.ai/lexeme/](https://pagebrain.ai/lexeme/)

## Getting Started

To run the development server:

```bash
export OPENAI_API_KEY="***"
npm run dev
```

Open [http://localhost:3000/lexeme/](http://localhost:3000/lexeme/) with your browser to see the result.

You may specify a custom API endpoint by setting `OPENAI_BASE_URL` environment variable.

## Deploying on Kubernetes

Update `OPENAI_API_KEY` in `k8s.yml` and then

```bash
skaffold run
# or
kubectl apply -f k8s.yml
```
