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
          <strong>Working remotely doesn't mean loneliness.</strong> LyncUp
          is here to bring back the human side of remote working!
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
          You'll be placed in a <strong>group chat with 2 or 3 other people</strong>,{" "}
          with no pressure, no awkward intros, just an easy, friendly break.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">
          Why does this matter?
        </h2>
        <ul className="list-disc list-inside mb-4 text-lg">
          <li>We aim to replicate socialisation at the coffee machine</li>
          <li>Quick, random convos that help you meet other professionals virtually</li>
          <li>You get to feel a sense of community within the remote working world!</li>
        </ul>
        <p className="mb-4 text-lg">
          LyncUp exists to provide you with opportunities to socialise!
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">
          How does it work?
        </h2>
        <ol className="list-decimal list-inside mb-4 text-lg">
          <li>
            Hit <strong>“Join Queue”</strong>
          </li>
          <li>
            We match you with <strong>2 or 3 other remote workers</strong> who are also seeking to meet new people during their coffee breaks!
          </li>
          <li>You then chat, making it like a digital breakroom</li>
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
            Click below to get matched with others for a casual, friendly
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
