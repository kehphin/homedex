import React, { useState } from "react";
import CheckoutButton from "./CheckoutButton";

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const plans = [
    {
      name: "Free",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "1 Home",
        "Up to 10 Documents",
        "Basic Task Management",
        "Email Support",
        "Mobile Access",
      ],
      stripe_product_id: "prod_12345", // replace
    },
    {
      name: "Home",
      monthlyPrice: 9,
      annualPrice: 90,
      features: [
        "Up to 3 Homes",
        "Unlimited Documents",
        "Unlimited Tasks & Appointments",
        "Maintenance Reminders",
        "Priority Support",
        "Component Tracking",
      ],
      popular: true,
      stripe_product_id: "prod_12345", // replace
    },
    {
      name: "Property Manager",
      monthlyPrice: 29,
      annualPrice: 290,
      features: [
        "Unlimited Properties",
        "Unlimited Documents",
        "Advanced Reporting",
        "Team Collaboration",
        "API Access",
        "Dedicated Support",
      ],
      stripe_product_id: "prod_12345", // replace
    },
  ];

  return (
    <section id="pricing" className="py-32 bg-base-200">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-bold text-center mb-8">
          Simple <span className="text-primary">Pricing</span>
        </h2>
        <p className="text-center text-base-content opacity-70 mb-12 max-w-2xl mx-auto">
          FREE, owning a home is expensive enough, managing it shouldn't be
        </p>

        <div className="flex justify-center mb-12">
          <div className="join">
            <button
              className={`btn join-item ${
                !isAnnual ? "btn-primary" : "btn-ghost"
              }`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
            <button
              className={`btn join-item ${
                isAnnual ? "btn-primary" : "btn-ghost"
              }`}
              onClick={() => setIsAnnual(true)}
            >
              Annually
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`card w-96 bg-base-100 ${
                plan.popular ? "border-2 border-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="badge badge-primary">Most Popular</div>
                </div>
              )}
              <div className="card-body flex flex-col justify-between h-full">
                <div>
                  <h3 className="card-title text-2xl justify-center mb-4">
                    {plan.name}
                  </h3>
                  <div className="text-center mb-6">
                    <span className="text-5xl font-bold">
                      ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-base-content opacity-70">
                      /{isAnnual ? "year" : "month"}
                    </span>
                  </div>
                  <div className="divider my-2"></div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <svg
                          className="w-5 h-5 text-primary mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card-actions justify-center mt-auto">
                  <CheckoutButton
                    stripeProductId={plan.stripe_product_id}
                    className={`btn btn-block ${
                      plan.popular ? "btn-primary" : "btn-outline btn-primary"
                    }`}
                  >
                    Get Started
                  </CheckoutButton>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-base-content opacity-70 mb-4">
            Need a custom plan for your business?
          </p>
          <button className="btn btn-link text-primary">
            Contact Us for Enterprise Solutions
          </button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
