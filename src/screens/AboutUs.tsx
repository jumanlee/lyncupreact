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
          Remote working shouldn't mean isolation. LyncUp is a machine
          learning-powered platform designed specifically for remote workers to
          connect and build meaningful professional networks. Using our powerful
          matching algorithm, LyncUp matches users who are most likely to have
          valuable and enjoyable interactions, based on historical preferences
          and interactions.
        </p>
        <p className="mb-4 text-lg">
          This significantly reduces feelings of isolation, enhances networking
          opportunities, and creates meaningful professional relationships,
          helping you expand your professional community and LinkedIn
          connections.
        </p>

        {/* ─────────  WHAT  ───────── */}
        <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">
          What exactly happens when you use LyncUp?
        </h2>
        <p className="mb-4 text-lg">
          When you're ready to network, simply press{" "}
          <button
            onClick={() => navigate("/queue")}
            className="text-gray-800 hover:text-gray-1000 font-semibold"
          >
            Queue
          </button>
          . LyncUp then finds the best possible match from other users currently
          in the queue, placing you into a private chatroom with 2-3 people who
          are predicted, based on past interactions and preferences, to align
          with yours.
        </p>
        <p className="mb-4 text-lg">
          Our sophisticated algorithm analyses past interaction patterns and
          predicts compatibility, ensuring that your interactions are highly
          relevant and productive. Make sure your{" "}
          <button
            onClick={() => navigate("/profile")}
            className="text-gray-800 hover:text-gray-1000 font-semibold"
          >
            profile
          </button>{" "}
          is updated with relevant professional details so other users can see
          your bio, ensuring a rich and productive networking experience.
        </p>

        {/* ─────────  HOW  ───────── */}
        <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">
          How it works
        </h2>
        <ol className="list-decimal list-inside mb-4 text-lg">
          <li>
            Click{" "}
            <button
              onClick={() => navigate("/queue")}
              className="text-gray-800 hover:text-gray-1000 font-semibold"
            >
              Queue
            </button>{" "}
            whenever you are looking to build your professional network.
          </li>
          <li>
            LyncUp's powerful matching engine connects you with 2-3 other remote
            professionals currently in the queue.
          </li>
          <li>Engage in professional and meaningful conversation.</li>
          <li>
            During your chat session, use the Like button to privately indicate
            fellow professionals you found particularly valuable or enjoyable to
            interact with. You can Like multiple individuals per session.
          </li>
        </ol>
        <p className="mb-4 text-lg">
          Your Likes remain confidential and are never disclosed to other
          participants.
        </p>

        {/* ─────────  MATCHING  ───────── */}
        <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">
          Understanding the matching algorithm
        </h2>
        <p className="mb-4 text-lg">
          Full technical details of the algorithm are explained in the backend
          Github repo's{" "}
          <a
            href="https://github.com/jumanlee/lyncupdjango"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            README
          </a>
          .
        </p>
        <p className="mb-4 text-lg">
          Each time you use the Like feature, our algorithm privately records
          this data to understand your preferences. Over time, it creates a
          nuanced profile of your interaction preferences and compares this
          profile with those of other professionals to identify shared interests
          and compatible interaction styles. This enables the algorithm to match
          you more accurately and consistently with professionals whose
          interaction styles and interests align closely with yours.
        </p>

        {/* ─────────  NO PRESSURE  ───────── */}
        <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">
          More opportunities for meaningful professional connections
        </h2>
        <p className="mb-4 text-lg">
          Likes remain anonymous, ensuring a comfortable and pressure-free
          networking environment. Use LyncUp as frequently or infrequently as
          your professional social needs require.
        </p>

        {/* ─────────  CTA  ───────── */}
        <div className="text-center mt-12">
          <h3 className="text-xl text-gray-800 font-semibold mb-4">
            Ready to expand your professional network?
          </h3>
          <p className="mb-6 text-lg">
            Click below to start connecting with relevant remote professionals
            today.
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
