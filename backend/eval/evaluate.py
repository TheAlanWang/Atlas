"""
Atlas RAG Pipeline Evaluation
Uses RAGAS to measure faithfulness, context relevance, and answer relevance.
"""

import json
import os
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision
from ragas.llms import LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

# Load environment variables from the project root .env.local
load_dotenv(Path(__file__).parent.parent.parent / ".env.local")

# Initialize clients from environment variables
openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
supabase_client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_ANON_KEY"],
)


def embed(text: str) -> list[float]:
    """Convert text to a vector using OpenAI's embedding model.
    Must use the same model as the indexing step so vectors are comparable."""
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )
    return response.data[0].embedding


def retrieve(question: str, top_k: int = 3) -> list[str]:
    """Embed the question and search Supabase pgvector for the top-k most
    similar chunks using cosine similarity via the match_documents RPC function."""
    embedding = embed(question)
    result = supabase_client.rpc("match_documents", {
        "query_embedding": embedding,
        "match_count": top_k,
    }).execute()
    return [row["content"] for row in result.data]


def generate(question: str, chunks: list[str]) -> str:
    """Build a grounded prompt from retrieved chunks and call GPT-4o.
    The system prompt instructs the model to answer only from the provided
    context, preventing hallucination when no relevant chunk is found."""
    context = "\n\n---\n\n".join(chunks)
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        max_tokens=300,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a helpful assistant for the Atlas learning platform. "
                    "Answer using only the context below. "
                    "If the answer is not in the context, say you don't know.\n\n"
                    f"Context:\n{context}"
                ),
            },
            {"role": "user", "content": question},
        ],
    )
    return response.choices[0].message.content


def run_pipeline(question: str) -> tuple[str, list[str]]:
    """Run the full RAG pipeline for a single question:
    retrieve relevant chunks, then generate a grounded answer."""
    chunks = retrieve(question)
    answer = generate(question, chunks)
    return answer, chunks


def main():
    # Load test questions and ground truth answers from test_set.json
    with open(Path(__file__).parent / "test_set.json") as f:
        test_set = json.load(f)

    print(f"Running evaluation on {len(test_set)} questions...\n")

    # Collect pipeline outputs for each test question
    questions, answers, contexts, ground_truths = [], [], [], []

    for i, item in enumerate(test_set):
        print(f"[{i+1}/{len(test_set)}] {item['question']}")
        answer, chunks = run_pipeline(item["question"])
        questions.append(item["question"])
        answers.append(answer)
        contexts.append(chunks)           # list of retrieved chunk strings
        ground_truths.append(item["ground_truth"])

    # RAGAS expects a HuggingFace Dataset with these four columns
    dataset = Dataset.from_dict({
        "question": questions,
        "answer": answers,
        "contexts": contexts,
        "ground_truth": ground_truths,
    })

    print("\nScoring with RAGAS...\n")
    # Explicitly configure the LLM and embeddings RAGAS uses as its judge
    # faithfulness: is the answer supported by the retrieved chunks?
    # answer_relevancy: does the answer address the question?
    # context_precision: are the retrieved chunks actually relevant?
    evaluator_llm = LangchainLLMWrapper(ChatOpenAI(model="gpt-4o-mini"))
    evaluator_embeddings = LangchainEmbeddingsWrapper(OpenAIEmbeddings(model="text-embedding-3-small"))
    results = evaluate(
        dataset,
        metrics=[faithfulness, answer_relevancy, context_precision],
        llm=evaluator_llm,
        embeddings=evaluator_embeddings,
    )

    df = results.to_pandas()

    print("=" * 40)
    print("RESULTS")
    print("=" * 40)
    for metric in ["faithfulness", "answer_relevancy", "context_precision"]:
        if metric in df.columns:
            print(f"{metric:<25} {df[metric].mean():.4f}")
    print("=" * 40)

    # Save per-question scores to JSON for reference or further analysis
    output_path = Path(__file__).parent / "results.json"
    df.to_json(output_path, orient="records", indent=2)
    print(f"\nSaved to {output_path}")


if __name__ == "__main__":
    main()
