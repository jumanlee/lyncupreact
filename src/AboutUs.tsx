import React from "react";
import { useNavigate } from "react-router-dom";

const AboutUs: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-200 min-h-screen text-gray-700">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome to LyncUp
        </h1>

        <p className="mb-4 text-lg">
          <strong>Working remotely doesn't mean working alone.</strong> LyncUp
          is here to bring back the human side of work — the part that's been
          missing since you left the office.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">
          So, what <em>is</em> LyncUp?
        </h2>
        <p className="mb-4 text-lg">
          LyncUp is a place for remote workers to have{" "}
          <strong>casual chats</strong> with other people, just like the random
          hallway or watercooler moments back in the office.
        </p>
        <p className="mb-4 text-lg">
          You'll be placed in a <strong>group chat with 3 other people</strong>{" "}
          — no pressure, no awkward intros, just an easy, friendly break.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">
          Why does this matter?
        </h2>
        <ul className="list-disc list-inside mb-4 text-lg">
          <li>Bumping into people at the coffee machine</li>
          <li>Quick, random convos that spark ideas</li>
          <li>Feeling part of something bigger than your task list</li>
        </ul>
        <p className="mb-4 text-lg">
          LyncUp exists to fix that — one short chat at a time.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">
          How does it work?
        </h2>
        <ol className="list-decimal list-inside mb-4 text-lg">
          <li>
            Hit <strong>“Join Queue”</strong>
          </li>
          <li>
            We match you with <strong>3 other remote workers</strong>
          </li>
          <li>You chat — like a digital breakroom</li>
          <li>
            Hit the <strong>“Like” button</strong> next to people you enjoyed
            chatting with
          </li>
        </ol>
        <p className="mb-4 text-lg">
          That's it. No profiles, no bios, no weird surveys. Just natural
          interactions that get smarter over time.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">
          What happens when I "Like" someone?
        </h2>
        <p className="mb-4 text-lg">
          Every time you hit “Like” during a chat, it tells the system: “I
          enjoyed chatting with this person.” Over time, the system remembers your preferences and uses an algorithm to find
          people with similar patterns of liking, which means your future group
          chats become more relevant, more fun, and more engaging. It's like the
          app is learning your vibe, without needing to ask you 20 questions.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">
          No pressure. Just connection.
        </h2>
        <p className="mb-4 text-lg">
          No need to impress. No awkwardness. Just short, relaxed convos with
          other remote workers. You can join as often or as little as you want.
        </p>

        <div className="text-center mt-12">
          <h3 className="text-xl text-gray-800 font-semibold mb-4">
            Ready to meet someone new?
          </h3>
          <p className="mb-6 text-lg">
            Click below to get matched with 3 others for a casual, friendly
            chat.
          </p>
          <button
            onClick={() => navigate("/queue")}
            className="bg-gray-900 hover:bg-gray-800 text-gray-200 font-semibold py-3 px-6 rounded"
          >
            Let's Chat!
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
