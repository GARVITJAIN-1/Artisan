"use client";

import { useState } from "react";
import { useSession } from "@/context/session-context";
import { useRouter } from "next/navigation";

const hardcodedUsers = [
  {
    username: "artisan1",
    password: "test123",
  },
  {
    username: "artisan2",
    password: "test456",
  },
];

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useSession();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would replace this with a call to your backend/Firebase
    const user = hardcodedUsers.find(
      (user) => user.username === username && user.password === password
    );

    if (user) {
      login(user.username);
      router.push("/");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
}