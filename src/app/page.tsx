import type { NextPage } from "next";
import Head from "next/head";

// Helper component for SVG icons to keep the main code clean.
// You can find simple, free-to-use SVG icons from sites like heroicons.com or feathericons.com.
const Icon = ({ name }: { name: string }) => {
  const icons: { [key: string]: JSX.Element } = {
    scheme: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8 mb-4 text-orange-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
        />
      </svg>
    ),
    challenge: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8 mb-4 text-orange-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-6.75c-.622 0-1.125.504-1.125 1.125V18.75m9 0h-9"
        />
      </svg>
    ),
    community: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8 mb-4 text-orange-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.513-.96 1.487-1.591 2.571-1.82m-2.571 1.82a9.094 9.094 0 01-3.741-.479 3 3 0 014.682-2.72m-4.682 2.72-3.234 3.234a1.5 1.5 0 002.121 2.121l3.234-3.234m0 0a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
        />
      </svg>
    ),
    social: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8 mb-4 text-orange-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z"
        />
      </svg>
    ),
    journal: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8 mb-4 text-orange-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
        />
      </svg>
    ),
    insights: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8 mb-4 text-orange-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
    profile: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8 mb-4 text-orange-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    ),
    facebook: (
      <svg
        className="w-6 h-6"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
          clipRule="evenodd"
        ></path>
      </svg>
    ),
    instagram: (
      <svg
        className="w-6 h-6"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.793 2.013 10.147 2 12.315 2zm-1.162 1.905c-1.468.007-2.827.01-3.238.01s-.47.003-1.048.022c-.89.034-1.424.195-1.828.345-.48.18-.844.444-1.212.812-.368.368-.632.732-.812 1.212-.15.404-.31.938-.345 1.828-.02.578-.022.69-.022 1.048s.002.47.022 1.048c.034.89.195 1.424.345 1.828.18.48.444.844.812 1.212.368.368.732.632 1.212.812.404.15.938.31 1.828.345.578.02.69.022 1.048.022s.47-.002 1.048-.022c.89-.034 1.424-.195 1.828-.345.48-.18.844-.444 1.212-.812.368-.368.632-.732.812-1.212.15-.404.31-.938.345-1.828.02-.578.022-.69.022-1.048s-.002-.47-.022-1.048c-.034-.89-.195-1.424-.345-1.828-.18-.48-.444-.844-.812-1.212-.368-.368-.732-.632-1.212-.812-.404-.15-.938-.31-1.828-.345-.578-.02-.69-.022-1.048-.022s-.47.002-1.048.022zm2.328 1.977a4.402 4.402 0 100 8.804 4.402 4.402 0 000-8.804zm-3.008 4.402a3.008 3.008 0 116.016 0 3.008 3.008 0 01-6.016 0zm6.536-4.87a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z"
          clipRule="evenodd"
        ></path>
      </svg>
    ),
    twitter: (
      <svg
        className="w-6 h-6"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
      </svg>
    ),
    communityPost: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8 mb-4 text-orange-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
        />
      </svg>
    ),
  };
  return icons[name] || null;
};

const HomePage: NextPage = () => {
  return (
    <div className="bg-stone-50 text-stone-800 font-sans">
      <Head>
        <title>Artisan Gully - Empowering Local Artisans</title>
        <meta
          name="description"
          content="Discover opportunities, connect with communities, and grow with the right tools."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* --- Main Content --- */}
      <main>
        {/* ## Hero Section (Professional and Image-Centric) */}
        <section
          className="relative w-full h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/images/Gemini_Generated_Image_ihmocyihmocyihmo.png')",
          }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 text-center text-white p-6 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-4 drop-shadow-lg">
              Empowering Local Artisans,{" "}
              <span className="text-orange-400">One Creation</span> at a Time.
            </h1>
            <p className="text-lg md:text-xl text-stone-200 max-w-2xl mx-auto mb-8 drop-shadow-md">
              Discover opportunities, connect with communities, and grow with
              the right tools.
            </p>
            <a
              href="#features"
              className="inline-flex items-center justify-center bg-orange-600 text-white font-bold py-3 px-8 rounded-full text-lg 
                         hover:bg-orange-700 transition-all duration-300 shadow-xl hover:scale-105 hover:shadow-2xl group"
            >
              Get Started
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </a>
          </div>
        </section>

        {/* ## Features Section */}
        <section id="features" className="py-20 md:py-32 bg-stone-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
                Your Artisan Toolkit
              </h2>
              <p className="text-stone-600 mt-2">
                Everything you need to thrive and showcase your craft.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Card 4: Social Media Posts */}
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <Icon name="social" />
                <h3 className="text-xl font-bold mb-2">Create Social Posts</h3>
                <p className="text-stone-600 mb-4">
                  Design beautiful posts for your social media with our simple
                  tool.
                </p>
                <a
                  href="/postCreator"
                  className="font-semibold text-orange-600 hover:text-orange-700"
                >
                  Start Designing &rarr;
                </a>
              </div>
              {/* Card 6: Market Insights - NEWLY ADDED */}
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <Icon name="insights" />
                <h3 className="text-xl font-bold mb-2">Market Insights</h3>
                <p className="text-stone-600 mb-4">
                  Get AI-powered insights on trending products, pricing
                  strategies, and customer demands.
                </p>
                <a
                  href="/artisan-assist"
                  className="font-semibold text-orange-600 hover:text-orange-700"
                >
                  Discover Trends &rarr;
                </a>
              </div>
              {/* Card 1: Government Schemes */}
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <Icon name="scheme" />
                <h3 className="text-xl font-bold mb-2">Government Schemes</h3>
                <p className="text-stone-600 mb-4">
                  Easily find and apply for grants and schemes that support your
                  craft.
                </p>
                <a
                  href="/schemes"
                  className="font-semibold text-orange-600 hover:text-orange-700"
                >
                  Learn More &rarr;
                </a>
              </div>

              {/* Card 2: Challenges */}
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <Icon name="challenge" />
                <h3 className="text-xl font-bold mb-2">Creative Challenges</h3>
                <p className="text-stone-600 mb-4">
                  Participate in themed challenges to spark creativity and win
                  rewards.
                </p>
                <a
                  href="/challenges"
                  className="font-semibold text-orange-600 hover:text-orange-700"
                >
                  View Challenges &rarr;
                </a>
              </div>

              {/* Card 3: Community */}
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <Icon name="community" />
                <h3 className="text-xl font-bold mb-2">Artisan Community</h3>
                <p className="text-stone-600 mb-4">
                  Join groups, share knowledge, and collaborate with fellow
                  artisans.
                </p>
                <a
                  href="/community"
                  className="font-semibold text-orange-600 hover:text-orange-700"
                >
                  Connect Now &rarr;
                </a>
              </div>

              {/* Card 4: Post to Community - NEWLY ADDED */}
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <Icon name="communityPost" />
                <h3 className="text-xl font-bold mb-2">Post to Community</h3>
                <p className="text-stone-600 mb-4">
                  Share your latest work, ask questions, or start a discussion
                  with fellow artisans.
                </p>
                <a
                  href="/create"
                  className="font-semibold text-orange-600 hover:text-orange-700"
                >
                  Create a Post &rarr;
                </a>
              </div>

              {/* Card 5: Journal */}
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <Icon name="journal" />
                <h3 className="text-xl font-bold mb-2">Artisan's Journal</h3>
                <p className="text-stone-600 mb-4">
                  Track your progress, document your creations, and tell your
                  story.
                </p>
                <a
                  href="/artconnect"
                  className="font-semibold text-orange-600 hover:text-orange-700"
                >
                  Open Journal &rarr;
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ## About Section */}
        <section className="py-20 bg-amber-50">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Our Mission
            </h2>
            <p className="text-lg text-stone-700">
              Artisan Gully is dedicated to bridging the gap between local
              artisans and the digital world. We believe in preserving
              traditional crafts by providing modern tools and a supportive
              community, ensuring that every artisan has the opportunity to
              shine and sustain their livelihood.
            </p>
          </div>
        </section>
      </main>

      {/* ## Footer */}
      <footer className="bg-stone-100 text-stone-600">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p>
                &copy; {new Date().getFullYear()} Artisan Gully. All rights
                reserved.
              </p>
            </div>
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a href="#" className="hover:text-orange-600">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-orange-600">
                Terms of Service
              </a>
              <a href="#" className="hover:text-orange-600">
                Contact
              </a>
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                aria-label="Facebook"
                className="hover:text-orange-600"
              >
                <Icon name="facebook" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="hover:text-orange-600"
              >
                <Icon name="instagram" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="hover:text-orange-600"
              >
                <Icon name="twitter" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
