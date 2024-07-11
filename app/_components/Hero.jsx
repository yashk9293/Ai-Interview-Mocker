import React from "react";

function Hero() {
  return (
    <section className="bg-gray-50">
      <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:h-screen">
        <div className="mx-auto text-center">
          <div className="grid gap-8 items-start justify-center">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              <button className="relative px-7 py-4 bg-white rounded-lg leading-none flex items-center divide-x divide-gray-600">
                <span className="flex items-center space-x-5">
                  <svg
                    width="60"
                    height="30"
                    viewBox="0 0 330 224"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="330" height="224" fill="#F5F5F5" />
                    <path
                      d="M0 112C0 50.1441 44.6025 0 99.6226 0H230.377C285.398 0 330 50.1441 330 112V224H99.6226C44.6025 224 0 173.856 0 112Z"
                      fill="#4845D2"
                    />
                    <path
                      d="M230.585 32H97.4146C62.3917 32 34 68.0411 34 112.5C34 156.959 62.3917 193 97.4146 193H230.585C265.608 193 294 156.959 294 112.5C294 68.0411 265.608 32 230.585 32Z"
                      fill="#A5B4FC"
                    />
                    <path
                      d="M116.5 144C137.211 144 154 127.211 154 106.5C154 85.7893 137.211 69 116.5 69C95.7893 69 79 85.7893 79 106.5C79 127.211 95.7893 144 116.5 144Z"
                      fill="black"
                    />
                    <path
                      d="M215.5 144C236.211 144 253 127.211 253 106.5C253 85.7893 236.211 69 215.5 69C194.789 69 178 85.7893 178 106.5C178 127.211 194.789 144 215.5 144Z"
                      fill="black"
                    />
                    <path
                      d="M116.5 114C120.642 114 124 110.642 124 106.5C124 102.358 120.642 99 116.5 99C112.358 99 109 102.358 109 106.5C109 110.642 112.358 114 116.5 114Z"
                      fill="white"
                    />
                    <path
                      d="M215.5 114C219.642 114 223 110.642 223 106.5C223 102.358 219.642 99 215.5 99C211.358 99 208 102.358 208 106.5C208 110.642 211.358 114 215.5 114Z"
                      fill="white"
                    />
                  </svg>
                  <span className="pr-6 text-black-100">New Release</span>
                </span>
                <span className="pl-6 text-indigo-400 group-hover:text-indigo-800 transition duration-200">
                  See what's new &rarr;
                </span>
              </button>
            </div>
          </div>

          <h1 className="mt-14 text-3xl font-extrabold sm:text-5xl">
            Your Personal
            <strong className="font-extrabold text-primary">
              {" "}
              AI Interview Coach{" "}
            </strong>
          </h1>

          <p className="mt-4 sm:text-xl/relaxed text-gray-500">
            Double your chances of landing that job offer with our AI-powered
            interview prep.
          </p>

          <div className="mt-16 flex flex-wrap justify-center gap-4">
            <a
              className="block w-full rounded bg-primary px-12 py-3 text-sm font-medium text-white shadow hover:bg-blue-800 focus:outline-none focus:ring active:bg-blue-800 sm:w-auto"
              href="/dashboard"
            >
              Get Started
            </a>

            <a
              className="border border-gray-300 block w-full rounded px-12 py-3 text-sm font-medium text-primary shadow hover:text-blue-800 focus:outline-none focus:ring active:text-blue-800 sm:w-auto"
              href="#"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
