// User Handle Route
import { useLoaderData, Form, useFetcher } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useState } from "react";

// 1) Loader to fetch tweets from the backend
export async function loader({ params }) {
  const { handle } = params;
  try {
    const res = await fetch(`${process.env.BACKEND_URL || "http://localhost:3000"}/api/twitter/tweets?handle=${handle}`);
    if (!res.ok) {
      throw new Error(`Error fetching tweets for @${handle}`);
    }
    const data = await res.json();
    return json({ handle, tweets: data.data || [] });
  } catch (err) {
    return json({ handle, tweets: [], error: err.message }, { status: 500 });
  }
}

// 2) Action to handle multiple forms (new tweet, rewrite, reply)
export async function action({ request, params }) {
  const formData = await request.formData();
  const actionType = formData.get("_action");
  
  // Endpoint base
  const baseUrl = process.env.BACKEND_URL || "http://localhost:3000";

  if (actionType === "newTweet") {
    // Post a new tweet
    const text = formData.get("tweetContent");
    const res = await fetch(`${baseUrl}/api/twitter/tweets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    return json({ result: data });
  }

  if (actionType === "rewriteTweet") {
    // Use GPT to rewrite
    const original = formData.get("originalTweet");
    const tone = formData.get("tone") || "friendly";
    const style = formData.get("style") || "casual";

    const res = await fetch(`${baseUrl}/api/gpt/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateName: "rewrite",
        variables: { original, tone, style },
        model: "gpt-4"
      }),
    });
    const data = await res.json();
    return json({ rewrite: data.data });
  }

  if (actionType === "replyTweet") {
    // Post a reply to a tweet by ID
    const tweetId = formData.get("tweetId");
    const text = formData.get("replyContent");
    const res = await fetch(`${baseUrl}/api/twitter/tweets/${tweetId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    return json({ reply: data.data });
  }

  return null;
}

export default function UserHandle() {
  const { handle, tweets, error } = useLoaderData() || {};
  const [selectedTweet, setSelectedTweet] = useState("");
  const fetcher = useFetcher();

  return (
    <main className="p-4 flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Tweets for @{handle}</h1>
      {error && (
        <p className="text-red-500">Error fetching tweets: {error}</p>
      )}

      {/* Display tweets */}
      <section>
        <h2 className="text-lg font-medium mb-2">Recent Tweets</h2>
        <div className="flex flex-col gap-4">
          {tweets.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTweet(t.id)}
              className={`border p-2 rounded cursor-pointer ${selectedTweet === t.id ? "bg-gray-200" : "bg-white"}`}
            >
              {t.text}
            </div>
          ))}
        </div>
      </section>

      {/* Form to create a new tweet */}
      <fetcher.Form method="post" className="flex flex-col gap-2 max-w-md">
        <input type="hidden" name="_action" value="newTweet" />
        <label className="font-medium">Create a new tweet</label>
        <textarea
          name="tweetContent"
          rows="2"
          className="border p-2 rounded"
          placeholder="What's happening?"
        />
        <button className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-600 transition">
          Post Tweet
        </button>
        {fetcher.data?.result && (
          <p className="text-green-600 text-sm mt-1">
            New tweet posted successfully!
          </p>
        )}
      </fetcher.Form>

      {/* Form to rewrite an existing tweet (with GPT) */}
      <fetcher.Form method="post" className="flex flex-col gap-2 max-w-md">
        <input type="hidden" name="_action" value="rewriteTweet" />
        <label className="font-medium">Rewrite an existing tweet</label>
        <textarea
          name="originalTweet"
          rows="2"
          className="border p-2 rounded"
          placeholder="Paste the tweet you want to rewrite..."
        />
        <div className="flex gap-2">
          <input
            type="text"
            name="tone"
            placeholder="Tone (e.g. friendly, witty)"
            className="border p-2 rounded w-1/2"
          />
          <input
            type="text"
            name="style"
            placeholder="Style (e.g. casual, formal)"
            className="border p-2 rounded w-1/2"
          />
        </div>
        <button className="bg-purple-500 text-white py-1 px-4 rounded hover:bg-purple-600 transition">
          Rewrite with GPT
        </button>
        {fetcher.data?.rewrite && (
          <div className="bg-gray-100 p-2 rounded mt-2">
            <p className="font-semibold">Rewritten Tweet:</p>
            <p>{fetcher.data.rewrite}</p>
          </div>
        )}
      </fetcher.Form>

      {/* Form to reply to a selected tweet */}
      <fetcher.Form method="post" className="flex flex-col gap-2 max-w-md">
        <input type="hidden" name="_action" value="replyTweet" />
        <input type="hidden" name="tweetId" value={selectedTweet} />
        <label className="font-medium">Reply to Selected Tweet</label>
        <textarea
          name="replyContent"
          rows="2"
          className="border p-2 rounded"
          placeholder="Your reply..."
        />
        <button
          className={`${
            selectedTweet ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"
          } text-white py-1 px-4 rounded transition`}
          disabled={!selectedTweet}
        >
          Post Reply
        </button>
        {fetcher.data?.reply && (
          <p className="text-green-600 text-sm mt-1">
            Reply posted successfully!
          </p>
        )}
      </fetcher.Form>
    </main>
  );
}
