import React from "react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Abstract background shapes */}
      <div className="absolute inset-0">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary opacity-10 rounded-full filter blur-5xl animate-drift"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-secondary opacity-10 rounded-full filter blur-5xl animate-drift animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 z-10">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 lg:pr-16">
            <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 leading-tight">
              <span className="relative inline-block">
                <span
                  className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-50 blur-3xl"
                  style={{ transform: "translate(-5%, -5%) scale(1.1)" }}
                ></span>
                <span
                  className="relative text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"
                  style={{
                    textShadow: `
                      0 0 10px var(--p),
                      0 0 20px var(--p),
                      0 0 30px var(--p)
                    `,
                  }}
                >
                  Revolutionize
                </span>
              </span>{" "}
              Your Workflow
            </h1>
            <p className="text-xl mb-8 text-base-content opacity-80">
              Experience seamless collaboration and skyrocket your productivity
              with our cutting-edge platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn btn-primary btn-lg rounded-full px-8 transition-all duration-300 hover:bg-primary-focus">
                Get Started
              </button>
              <button className="btn btn-outline btn-secondary btn-lg rounded-full px-8 transition-all duration-300">
                Watch Demo
              </button>
            </div>
            <div className="mt-12 flex items-center space-x-4">
              <p className="text-base-content opacity-80">
                Join 10,000+ teams already using our platform
              </p>
            </div>
          </div>
          <div className="lg:w-1/2 mt-12 lg:mt-0">
            <div className="relative">
              <div className="bg-base-100 rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="bg-base-100 rounded-2xl p-6 border border-base-300 transition-all duration-300 hover:border-primary"
                    >
                      <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <h3 className="font-bold mb-2">Feature {item}</h3>
                      <p className="text-sm text-base-content opacity-70">
                        Boost your productivity with our amazing features.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
