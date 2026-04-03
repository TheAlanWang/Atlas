"""
Atlas RAG Pipeline Evaluation
Uses RAGAS to measure faithfulness, context relevance, and answer relevance.
"""

import argparse
import asyncio
import json
import os
import time
from datetime import datetime
from pathlib import Path

from datasets import Dataset
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from openai import OpenAI
from ragas import evaluate
from ragas.embeddings import LangchainEmbeddingsWrapper
from ragas.llms import LangchainLLMWrapper
from ragas.metrics import answer_relevancy, context_precision, faithfulness

# Load environment variables from the project root .env.local
load_dotenv(Path(__file__).parent.parent.parent / ".env.local")

from backend.services.rag import retrieve

# Initialize clients from environment variables
openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
EVAL_DIR = Path(__file__).parent
TEST_SET_PATH = EVAL_DIR / "test_set.json"
METRIC_NAMES = ["faithfulness", "answer_relevancy", "context_precision"]


def parse_args():
    parser = argparse.ArgumentParser(description="Run Atlas RAGAS evaluation.")
    parser.add_argument("--start", type=int, default=0, help="Inclusive start index in test_set.json")
    parser.add_argument("--end", type=int, default=None, help="Exclusive end index in test_set.json")
    parser.add_argument("--sleep-seconds", type=float, default=0.0, help="Pause between questions to reduce rate limits")
    parser.add_argument(
        "--disable-reranker",
        action="store_true",
        help="Force vector-only retrieval for this run without editing .env.local",
    )
    return parser.parse_args()


def load_test_set() -> list[dict]:
    with open(TEST_SET_PATH) as f:
        return json.load(f)


def select_test_slice(full_test_set: list[dict], start: int, end: int | None) -> tuple[list[dict], int]:
    slice_end = len(full_test_set) if end is None else end
    test_set = full_test_set[start:slice_end]
    if not test_set:
        raise ValueError(f"No test questions selected for slice start={start}, end={slice_end}")
    return test_set, slice_end


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


async def run_pipeline(question: str) -> tuple[str, list[str]]:
    """Run the full RAG pipeline for a single question:
    retrieve relevant chunks, then generate a grounded answer."""
    docs = await retrieve(question)
    chunks = [doc["content"] for doc in docs]
    answer = generate(question, chunks)
    return answer, chunks


def collect_examples(test_set: list[dict], sleep_seconds: float) -> Dataset:
    print(
        f"Running evaluation on {len(test_set)} questions "
        "\n"
    )

    questions, answers, contexts, ground_truths = [], [], [], []
    for i, item in enumerate(test_set):
        print(f"[{i+1}/{len(test_set)}] {item['question']}")
        answer, chunks = asyncio.run(run_pipeline(item["question"]))
        questions.append(item["question"])
        answers.append(answer)
        contexts.append(chunks)
        ground_truths.append(item["ground_truth"])
        if sleep_seconds > 0 and i < len(test_set) - 1:
            time.sleep(sleep_seconds)

    return Dataset.from_dict({
        "question": questions,
        "answer": answers,
        "contexts": contexts,
        "ground_truth": ground_truths,
    })


def score_dataset(dataset: Dataset):
    print("\nScoring with RAGAS...\n")
    evaluator_llm = LangchainLLMWrapper(ChatOpenAI(model="gpt-4o-mini"))
    evaluator_embeddings = LangchainEmbeddingsWrapper(OpenAIEmbeddings(model="text-embedding-3-small"))
    return evaluate(
        dataset,
        metrics=[faithfulness, answer_relevancy, context_precision],
        llm=evaluator_llm,
        embeddings=evaluator_embeddings,
    )


def print_summary(df):
    print("=" * 40)
    print("RESULTS")
    print("=" * 40)
    for metric in METRIC_NAMES:
        if metric in df.columns:
            print(f"{metric:<25} {df[metric].mean():.4f}")
    print("=" * 40)


def save_results(df):
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    output_path = EVAL_DIR / f"results-{timestamp}.json"
    df.to_json(output_path, orient="records", indent=2)
    print(f"\nSaved to {output_path}")
    return output_path


def main():
    args = parse_args()
    if args.disable_reranker:
        os.environ["RERANKER_PROVIDER"] = "none"

    full_test_set = load_test_set()
    test_set, slice_end = select_test_slice(full_test_set, args.start, args.end)
    reranker_mode = "off" if args.disable_reranker else "on"
    print(
        f"Slice {args.start}:{slice_end}, reranker={reranker_mode}, "
        f"sleep={args.sleep_seconds}s"
    )
    dataset = collect_examples(test_set, args.sleep_seconds)
    df = score_dataset(dataset).to_pandas()
    print_summary(df)
    save_results(df)


if __name__ == "__main__":
    main()
