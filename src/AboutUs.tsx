import React from "react";
import { useNavigate } from "react-router-dom";

const AboutUs: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-200 min-h-screen text-gray-700">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* ─────────  HERO  ───────── */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome to LyncUp
        </h1>
        <p className="mb-4 text-lg">
          <strong>Remote working shouldn't mean isolated.</strong> LyncUp helps remote workers quickly connect, build meaningful professional networks, and feel a genuine sense of community.
        </p>

        {/* ─────────  WHAT  ───────── */}
        <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">
          What exactly happens when you use LyncUp?
        </h2>
        <p className="mb-4 text-lg">
          Simply press <strong>Join Queue</strong> to get matched into a private, casual chatroom with <strong>two or three other remote professionals</strong>. Before joining the queue to be matched, just ensure that your profile is up to date so that other users can see your bio and that you can get the most out of your experience.
        </p>

        {/* ─────────  WHY  ───────── */}
        <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">
          Why does this matter?
        </h2>
        <ul className="list-disc list-inside mb-4 text-lg">
          <li>Reduce isolation and loneliness common in remote working environments.</li>
          <li>Provide networking opportunities for remote workers</li>
          <li>Build valuable professional connections through spontaneous conversations.</li>
          <li>This can also be a way to get to know other remote workers and expand your LinkedIn network of professional friends</li>
        </ul>

        {/* ─────────  HOW  ───────── */}
        <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">
          How it works
        </h2>
        <ol className="list-decimal list-inside mb-4 text-lg">
          <li>Click <strong>Join Queue</strong> whenever you want a quick networking break.</li>
          <li>LyncUp tries to match you with <strong>2-3 other remote professionals</strong>, selected based on past likes (explained clearly below).</li>
          <li>Engage in friendly conversation.</li>
          <li>
            During your chat session, click the <strong>Like</strong> button next to each person you enjoyed chatting with. You can Like multiple people per session.
          </li>
        </ol>
        <p className="mb-4 text-lg">
          Your Likes are completely private and other participants never see who you've liked.
        </p>

        {/* ─────────  MATCHING  ───────── */}
        <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">
          How the matching algorithm learns from your past Like interactions
        </h2>
        <p className="mb-4 text-lg">
          Every time you Like someone, the system notes your preference privately. Over time, it learns who you prefer interacting with and compares your Likes with those of other users to identify common preferences. In simple terms: it groups people who typically enjoy chatting with the same types of people.
        </p>
        <p className="mb-4 text-lg">
          This helps ensure future matches become increasingly relevant and enjoyable. Yet, at times, the matches are intentionally varied, introducing new people and perspectives to keep conversations fresh and engaging.
        </p>
        <p className="mb-4 text-lg">
          <strong>The result:</strong> More enjoyable conversations, better connections, and no extra effort or intrusive data collection.
        </p>

        {/* ─────────  NO PRESSURE  ───────── */}
        <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">
          More opportunities for professional connections
        </h2>
        <p className="mb-4 text-lg">
          Likes remain anonymous, ensuring a relaxed environment free from performance anxiety. Join as often or as little as you like.
        </p>

        {/* ─────────  CTA  ───────── */}
        <div className="text-center mt-12">
          <h3 className="text-xl text-gray-800 font-semibold mb-4">
            Ready to connect?
          </h3>
          <p className="mb-6 text-lg">
            Click below, grab your coffee, and experience effortless networking today.
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