import React from "react";
import { Link, useNavigate } from "react-router-dom";

const AboutUs: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-200 min-h-screen text-gray-700">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* ───────── HERO ───────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: copy */}
          <div>
            <span className="inline-block text-xs tracking-widest uppercase text-gray-500 font-semibold mb-3">
              Professional networking for remote workers
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              LyncUp: Get matched into small chatrooms with the{" "}
              <span className="underline decoration-gray-400">right</span>{" "}
              people.
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              Reduce isolation and build a meaningful professional circle. Our
              matching learns from your private Likes to create better
              conversations each time.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => navigate("/queue")}
                className="px-5 py-2.5 rounded-full bg-gray-900 text-gray-100 font-semibold hover:bg-gray-800 transition"
              >
                Get started
              </button>
              <a
                href="https://github.com/jumanlee/lyncupdjango?tab=readme-ov-file#lyncup"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full border-2 border-gray-700 text-gray-800 font-semibold hover:bg-gray-100 transition"
              >
                Learn more
              </a>
            </div>

            {/* Social proof / small stats */}
            <div className="mt-6 flex flex-wrap gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Dot /> 3-4 people per room
                </div>
                <div className="flex items-center gap-2">
                  <Dot /> Tap Like on users
                </div>
                <Dot /> Better matches over time
              </div>
            </div>
          </div>

          {/* Right: visual mock (no external assets) */}
          <div className="md:pl-6">
            <div className="relative">
              {/* card frame */}
              <div className="rounded-2xl shadow-lg bg-white border border-gray-300 p-4 md:p-5">
                {/* header bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500">
                    Chatroom • 00:42
                  </span>
                </div>

                {/* chat mock */}
                <div className="mt-4 space-y-3">
                  <Bubble who="them">
                    Hey! I'm a remote worker too, anyone else juggling coffee
                    and deadlines today?
                  </Bubble>
                  <Bubble who="me">
                    Same here. I'm working on a side project with Django +
                    React, but also trying not to live on caffeine.
                  </Bubble>
                  <Bubble who="them">
                    Haha, I get that. I use Celery + Redis at work, but outside
                    of that I'm always looking for new shows to binge. Any
                    recommendations?
                  </Bubble>
                </div>

                {/* footer actions */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    <Tag>Remote</Tag>
                    <Tag>Python</Tag>
                    <Tag>Networking</Tag>
                  </div>
                  <button
                    onClick={() => navigate("/queue")}
                    className="px-4 py-1.5 rounded-full border-2 border-gray-400 text-gray-700 font-semibold hover:bg-gray-100 transition"
                  >
                    Like
                  </button>
                </div>
              </div>

              {/* glow */}
              <div className="absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-tr from-gray-300/40 to-gray-100/10 blur-xl" />
            </div>
          </div>
        </section>

        {/* ───────── VALUE / FEATURES ───────── */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-gray-900">Why LyncUp works</h2>
          <p className="mt-2 text-gray-700">
            You spend time chatting, we handle the matching. Future matches
            improve as your private Likes on other users accumulate.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Card
              title="Queue → instant match"
              body="Join the queue when you're free. We place you with compatible professionals currently online."
            />
            <Card
              title="Small, focused rooms"
              body="3-4 people per chatroom keeps conversation natural and balanced."
            />
            <Card
              title="Preference-learning"
              body="Private Likes improve future matches. Just chat and tap Like on other users that you like."
            />
          </div>
        </section>

        {/* ───────── HOW IT WORKS (steps) ───────── */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-gray-900">How it works</h2>
          <div className="mt-6 grid gap-4">
            <Step
              n={1}
              text={
                <>
                  Click{" "}
                  <InlineLink onClick={() => navigate("/queue")}>
                    Queue
                  </InlineLink>{" "}
                  when you want to network.
                </>
              }
            />
            <Step
              n={2}
              text="Get matched automatically into a room with 2-3 people who fit your interaction style."
            />
            <Step
              n={3}
              text="Tap Like on people you enjoy interacting with. Our algorithm will then try to match you with others who share your preferences in future matches."
            />
            <Step
              n={4}
              text="Your Likes remain private. Matching improves the more you use it."
            />
          </div>
        </section>

        {/* ───────── TECH NOTE ───────── */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-gray-900">Under the hood</h2>
          <p className="mt-2 text-gray-700">
            Curious about the algorithm? Read the implementation details in the
            backend repo README.
          </p>
          <a
            href="https://github.com/jumanlee/lyncupdjango?tab=readme-ov-file#matching-algorithm-implementation"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 px-4 py-2 rounded-full border-2 border-gray-700 text-gray-800 font-semibold hover:bg-gray-100 transition"
          >
            View README
          </a>
        </section>

        {/* ───────── CTA BAND ───────── */}
        <section className="mt-16">
          <div className="relative overflow-hidden rounded-3xl border border-gray-300 bg-gradient-to-tr from-gray-100 to-gray-50">
            <div className="p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900">
                  Ready to meet the right people?
                </h3>
                <p className="mt-1 text-gray-700">
                  Join the queue now and get placed into a small, relevant room.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/queue")}
                  className="px-5 py-2.5 rounded-full bg-gray-900 text-gray-100 font-semibold hover:bg-gray-800 transition"
                >
                  Let's Chat
                </button>
                {/* <Link
                  to="/"
                  className="px-5 py-2.5 rounded-full border-2 border-gray-700 text-gray-800 font-semibold hover:bg-gray-100 transition"
                >
                  Back to login
                </Link> */}
              </div>
            </div>

            {/* subtle corners shine */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-48 w-48 rounded-full bg-gray-300/30 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 -bottom-24 h-48 w-48 rounded-full bg-gray-300/20 blur-3xl" />
          </div>
        </section>
      </div>
    </div>
  );
};

/* ---------- small presentational helpers (no external deps) ---------- */

function Dot() {
  return <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400" />;
}

const Bubble: React.FC<{ who: "me" | "them"; children: React.ReactNode }> = ({
  who,
  children,
}) => {
  const isMe = who === "me";
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm border ${
          isMe
            ? "bg-gray-900 text-gray-100 border-gray-800"
            : "bg-white text-gray-800 border-gray-200"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
    {children}
  </span>
);

const Card: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <div className="rounded-2xl bg-white border border-gray-300 p-5 shadow-sm hover:shadow transition">
    <div className="flex items-start gap-3">
      <div className="mt-1">
        <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
      </div>
      <div>
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="mt-1 text-gray-700">{body}</p>
      </div>
    </div>
  </div>
);

const Step: React.FC<{ n: number; text: React.ReactNode }> = ({ n, text }) => (
  <div className="flex items-start gap-3">
    <div className="shrink-0 w-7 h-7 rounded-full bg-gray-900 text-gray-100 flex items-center justify-center font-bold">
      {n}
    </div>
    <p className="text-gray-800">{text}</p>
  </div>
);

const InlineLink: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
}> = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="font-semibold underline decoration-gray-400 underline-offset-2 hover:opacity-80"
  >
    {children}
  </button>
);

export default AboutUs;
