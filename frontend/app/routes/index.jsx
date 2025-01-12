// Index Route
import { Form, useNavigate } from "@remix-run/react";
import { useState } from "react";

export default function Index() {
  const navigate = useNavigate();
  const [handle, setHandle] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!handle.trim()) return;
    navigate(`/user/${handle}`);
  }

  return (
    <main className="flex flex-col items-center justify-center flex-grow">
      <h1 className="text-2xl font-bold my-8">Contextual X(Twitter) Reply Creator</h1>
      <Form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col">
        <input
          type="text"
          placeholder="Enter Twitter handle (without @)..."
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          className="border p-2 mb-4 rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          Analyze this user
        </button>
      </Form>
    </main>
  );
}
