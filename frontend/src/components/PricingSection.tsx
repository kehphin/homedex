import { useState } from "react";
import { useStripeCheckout } from "../payments/hooks";
import { config } from "../config";

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { handleCheckout } = useStripeCheckout();

  const successUrl = config.appHost + "/account/success";
  const cancelUrl = config.appHost + "/account/cancel";

  const plans = [
    {
      name: "Starter",
      monthlyPrice: 19,
      annualPrice: 190,
      features: [
        "5 Team Members",
        "10 Projects",
        "50GB Storage",
        "Basic Support",
      ],
      stripe_product_id: "prod_12345", // REPLACE with your product IDs from stripe
    },
    {
      name: "Pro",
      monthlyPrice: 49,
      annualPrice: 490,
      features: [
        "15 Team Members",
        "Unlimited Projects",
        "250GB Storage",
        "Priority Support",
        "Advanced Analytics",
      ],
      popular: true,
      stripe_product_id: "prod_12345",
    },
    {
      name: "Enterprise",
      monthlyPrice: 99,
      annualPrice: 990,
      features: [
        "Unlimited Team Members",
        "Unlimited Projects",
        "1TB Storage",
        "24/7 Dedicated Support",
        "Custom Integrations",
      ],
      stripe_product_id: "prod_12345",
    },
  ];

  return (
    <section className="py-20 bg-base-100">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-bold text-center mb-8">
          Choose Your <span className="text-primary">Plan</span>
        </h2>
        <p className="text-center text-base-content opacity-70 mb-12 max-w-2xl mx-auto">
          Select the perfect plan for your team. Seamless scaling, no hidden
          fees.
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
              className={`card w-96 bg-base-100 border border-slate-200 shadow-sm ${
                plan.popular ? "border-2 border-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="badge badge-primary badge-light">Most Popular</div>
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
                  <button
                    onClick={() =>
                      handleCheckout(
                        plan.stripe_product_id,
                        successUrl,
                        cancelUrl
                      )
                    }
                    className={`btn btn-block ${
                      plan.popular ? "btn-primary" : "btn-outline btn-primary"
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-base-content opacity-70 mb-4">
            Not sure which plan is right for you?
          </p>
          <button className="btn btn-link text-primary">
            Compare Plans in Detail
          </button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
