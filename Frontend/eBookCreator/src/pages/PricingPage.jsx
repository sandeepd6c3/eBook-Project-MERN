import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeSwitcher from "../components/ui/ThemeSwitcher";
import toast from "react-hot-toast";

const PricingPage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  
  const [billingCycle, setBillingCycle] = useState("monthly"); // monthly or yearly
  const [loadingTier, setLoadingTier] = useState(null);
  
  // Simulation Modal States
  const [showSimModal, setShowSimModal] = useState(false);
  const [simTier, setSimTier] = useState(null);
  const [simCardName, setSimCardName] = useState("");
  const [simCardNum, setSimCardNum] = useState("4242 4242 4242 4242");
  const [simLoading, setSimLoading] = useState(false);

  // Plans Config
  const plans = [
    {
      id: "free",
      name: "Free Plan",
      priceMonthly: 0,
      priceYearly: 0,
      billingInfo: "Free Forever",
      description: "Start your writing journey with basic capabilities.",
      features: [
        "Maximum 2 eBooks",
        "Standard PDF Export",
        "5 AI Generations per month",
        "Basic Cover Generation",
      ],
      cta: "Current Plan",
    },
    {
      id: "pro",
      name: "Pro Plan",
      priceMonthly: 9,
      priceYearly: 7.20, // 20% discount: $9 * 12 * 0.8 = $86.4 / 12 = $7.2
      billingInfo: billingCycle === "monthly" ? "$9 / month" : "$86.40 billed yearly (Save 20%)",
      description: "Perfect for active writers looking for powerful AI assistance.",
      badge: "⭐ Most Popular",
      features: [
        "Unlimited eBooks",
        "Unlimited AI Outlines",
        "Unlimited AI Chapter Generation",
        "PDF + EPUB Export",
        "AI Writing Assistant",
        "Priority Generation",
      ],
      cta: "Upgrade to Pro",
    },
    {
      id: "premium",
      name: "Premium Plan",
      priceMonthly: 19,
      priceYearly: 15.20, // 20% discount: $19 * 12 * 0.8 = $182.4 / 12 = $15.2
      billingInfo: billingCycle === "monthly" ? "$19 / month" : "$182.40 billed yearly (Save 20%)",
      description: "Best for professional creators requiring custom designs & templates.",
      features: [
        "Everything in Pro plus:",
        "Premium Export Templates",
        "Custom Cover Themes",
        "Advanced Layout Styling",
        "Priority 24/7 Support",
        "Brand Customization",
      ],
      cta: "Upgrade to Premium",
    },
    {
      id: "lifetime",
      name: "Lifetime Plan",
      priceMonthly: 99,
      priceYearly: 99, // one-time fee
      isLifetime: true,
      billingInfo: "$99 One-Time Payment",
      description: "The ultimate choice. Pay once, own premium features forever.",
      badge: "💎 Best Value",
      features: [
        "Unlimited Everything",
        "Lifetime Free Updates",
        "Premium Features Forever",
        "Priority 24/7 Support",
        "All Future Releases",
      ],
      cta: "Buy Lifetime",
    },
  ];

  const handleCheckout = async (tier) => {
    if (user?.subscriptionTier === tier) {
      toast.success(`You are already subscribed to the ${tier.toUpperCase()} plan.`);
      return;
    }
    
    setLoadingTier(tier);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/payment/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier, billingCycle }),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize checkout.");
      }

      const data = await response.json();

      if (data.simulation) {
        // Trigger simulated payment flow modal
        setSimTier(tier);
        setSimCardName(user?.username || "");
        setShowSimModal(true);
      } else if (data.checkoutUrl) {
        // Redirect to real Stripe checkout
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to start payment checkout.");
    } finally {
      setLoadingTier(null);
    }
  };

  const handleSimulatePaymentSubmit = async (e) => {
    e.preventDefault();
    setSimLoading(true);
    const token = localStorage.getItem("token");

    const toastId = toast.loading("Authorizing simulated payment...");
    try {
      const response = await fetch("http://localhost:5000/api/payment/simulate-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier: simTier, billingCycle }),
      });

      if (!response.ok) {
        throw new Error("Simulated payment failed.");
      }

      const data = await response.json();
      setUser(data.user); // update global user state instantly
      toast.success(`Simulated payment approved! Upgraded to ${simTier.toUpperCase()} Tier.`, { id: toastId });
      setShowSimModal(false);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Simulated authorization failed.", { id: toastId });
    } finally {
      setSimLoading(false);
    }
  };

  const currentTier = user?.subscriptionTier || "free";

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans transition-colors duration-250 flex flex-col justify-start">
      
      {/* Navbar Header */}
      <header className="h-16 bg-bg-secondary border-b border-border-primary px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-250">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="text-text-muted hover:text-text-primary transition-colors flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Library
          </Link>
          <span className="text-border-primary">|</span>
          <span className="text-text-primary text-xs font-semibold uppercase tracking-wider font-mono">
            Pricing Plans
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <Link
            to="/profile"
            className="text-[10px] font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary border border-border-primary px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
          >
            Profile
          </Link>
        </div>
      </header>

      {/* Pricing Container */}
      <main className="flex-grow max-w-[1000px] w-full mx-auto p-6 sm:p-8 flex flex-col gap-10 animate-fadeIn">
        
        {/* Hero Section */}
        <section className="text-center py-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary mb-2">
            Simple Pricing
          </h1>
          <p className="text-sm text-text-secondary max-w-lg mx-auto leading-relaxed">
            Choose the perfect plan for your writing journey. Start free, upgrade or cancel anytime.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-xs font-semibold uppercase tracking-wider ${billingCycle === "monthly" ? "text-text-primary font-bold" : "text-text-muted"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle((prev) => (prev === "monthly" ? "yearly" : "monthly"))}
              className="w-12 h-6 rounded-full bg-bg-tertiary border border-border-primary p-0.5 relative transition-all duration-200 cursor-pointer"
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-accent-primary transition-all duration-200 ${
                  billingCycle === "yearly" ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${billingCycle === "yearly" ? "text-text-primary font-bold" : "text-text-muted"}`}>
              Yearly
              <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wide">
                Save 20%
              </span>
            </span>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch pl-0.5 pr-0.5">
          {plans.map((plan) => {
            const isCurrent = currentTier === plan.id;
            const isPro = plan.id === "pro";
            const isLifetime = plan.id === "lifetime";
            
            // Calculate price based on cycle
            let priceVal = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
            if (plan.id === "lifetime") priceVal = plan.priceMonthly; // lifetime doesn't change

            return (
              <div
                key={plan.id}
                className={`bg-bg-secondary rounded-2xl p-5 border flex flex-col justify-between shadow-xs transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] hover:shadow-lg ${
                  isCurrent 
                    ? "border-emerald-500/50 ring-1 ring-emerald-500/25" 
                    : isPro 
                      ? "border-[#8B5CF6]/50 shadow-md shadow-[#8B5CF6]/5" 
                      : isLifetime 
                        ? "border-amber-500/50" 
                        : "border-border-primary"
                }`}
              >
                <div>
                  {/* Top Badge */}
                  <div className="h-6 flex items-center justify-start mb-3">
                    {plan.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                        isLifetime ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20"
                      }`}>
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-md font-bold uppercase tracking-wider text-text-primary mb-1">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-2 mt-2">
                    <span className="text-3xl font-extrabold text-text-primary">
                      ${priceVal % 1 === 0 ? priceVal : priceVal.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
                      {plan.id === "free" ? "" : plan.isLifetime ? "Once" : "/ month"}
                    </span>
                  </div>

                  {/* Billing Description Info */}
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-4">
                    {plan.billingInfo}
                  </span>

                  {/* Brief description */}
                  <p className="text-[11px] text-text-secondary leading-relaxed mb-6">
                    {plan.description}
                  </p>

                  <div className="w-full h-px bg-border-primary mb-6"></div>

                  {/* Features list */}
                  <ul className="flex flex-col gap-2.5 mb-6 text-[10px] font-medium text-text-secondary pl-0.5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 shrink-0 font-bold">✓</span>
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Call To Action Button */}
                <button
                  disabled={loadingTier !== null || isCurrent}
                  onClick={() => handleCheckout(plan.id)}
                  className={`w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer border ${
                    isCurrent
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 cursor-default"
                      : isPro
                        ? "bg-[#8B5CF6] hover:bg-[#7c3aed] text-white border-transparent shadow-xs shadow-[#8B5CF6]/10"
                        : isLifetime
                          ? "bg-transparent hover:bg-amber-500/10 text-amber-600 hover:text-amber-700 border-amber-500/40"
                          : "bg-transparent hover:bg-bg-tertiary border-border-primary text-text-primary"
                  }`}
                >
                  {loadingTier === plan.id ? "Processing..." : isCurrent ? "Current Plan" : plan.cta}
                </button>
              </div>
            );
          })}
        </section>

        {/* Feature Comparison Table */}
        <section className="bg-bg-secondary border border-border-primary rounded-2xl p-6 shadow-xs mt-6 transition-colors duration-250">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-text-primary mb-4 pl-0.5">
            Feature Comparison
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-secondary border-collapse">
              <thead>
                <tr className="border-b border-border-primary text-[10px] font-extrabold uppercase tracking-widest text-text-muted">
                  <th className="py-3 px-4">Features</th>
                  <th className="py-3 px-4 text-center">Free</th>
                  <th className="py-3 px-4 text-center text-accent-primary">Pro</th>
                  <th className="py-3 px-4 text-center">Premium</th>
                  <th className="py-3 px-4 text-center">Lifetime</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "eBooks Draft Limit", free: "2 Books", pro: "Unlimited", premium: "Unlimited", lifetime: "Unlimited" },
                  { name: "AI Outlines Suggestion", free: "5 / month", pro: "Unlimited", premium: "Unlimited", lifetime: "Unlimited" },
                  { name: "AI Chapters Drafting", free: "❌", pro: "✓", premium: "✓", lifetime: "✓" },
                  { name: "Standard PDF Export", free: "✓", pro: "✓", premium: "✓", lifetime: "✓" },
                  { name: "EPUB eBook Export", free: "❌", pro: "✓", premium: "✓", lifetime: "✓" },
                  { name: "Premium Layout Templates", free: "❌", pro: "❌", premium: "✓", lifetime: "✓" },
                  { name: "Brand Customization", free: "❌", pro: "❌", premium: "✓", lifetime: "✓" },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-border-primary/50 hover:bg-bg-primary/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-text-primary">{row.name}</td>
                    <td className="py-3 px-4 text-center font-mono text-[11px]">{row.free}</td>
                    <td className="py-3 px-4 text-center font-mono text-[11px] text-accent-primary font-bold">{row.pro}</td>
                    <td className="py-3 px-4 text-center font-mono text-[11px]">{row.premium}</td>
                    <td className="py-3 px-4 text-center font-mono text-[11px]">{row.lifetime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* Demo Checkout Simulation Modal */}
      {showSimModal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSimulatePaymentSubmit}
            className="bg-bg-secondary rounded-2xl border border-border-primary w-full max-w-[425px] shadow-2xl p-6 flex flex-col gap-4 text-text-primary transition-colors duration-250"
          >
            <div>
              <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wide inline-block mb-2">
                Stripe Simulation Mode
              </span>
              <h3 className="font-sans font-semibold text-lg text-text-primary">
                Demo Checkout Sandbox
              </h3>
              <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mt-0.5 leading-relaxed">
                Stripe API key is not configured. Authorize this simulated sandbox checkout to upgrade.
              </p>
            </div>

            <div className="w-full h-px bg-border-primary my-1"></div>

            {/* Select Tier (Read-only / Choice) */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest pl-1">
                Selected Plan
              </label>
              <div className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-xs font-bold text-accent-primary uppercase tracking-wide">
                {simTier?.toUpperCase()} Plan ({billingCycle === "yearly" ? "Yearly Billing" : "Monthly Billing"})
              </div>
            </div>

            {/* Cardholder name */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest pl-1">
                Cardholder Name
              </label>
              <input
                type="text"
                required
                value={simCardName}
                onChange={(e) => setSimCardName(e.target.value)}
                className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-xs outline-none text-text-primary focus:border-accent-primary transition-colors"
              />
            </div>

            {/* Simulated Card number */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest pl-1">
                Card Number
              </label>
              <input
                type="text"
                required
                value={simCardNum}
                onChange={(e) => setSimCardNum(e.target.value)}
                placeholder="4242 4242 4242 4242"
                className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-xs outline-none text-text-primary font-mono focus:border-accent-primary transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest pl-1">
                  Expiry
                </label>
                <input
                  type="text"
                  required
                  placeholder="12/29"
                  className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-xs outline-none text-text-primary font-mono focus:border-accent-primary transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest pl-1">
                  CVC
                </label>
                <input
                  type="text"
                  required
                  placeholder="424"
                  className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-xs outline-none text-text-primary font-mono focus:border-accent-primary transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border-primary">
              <button
                type="button"
                onClick={() => setShowSimModal(false)}
                className="px-4 py-2 border border-border-primary hover:border-text-primary text-text-secondary hover:text-text-primary rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={simLoading}
                className="px-5 py-2 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-[#8B5CF6]/10"
              >
                {simLoading ? "Authorizing..." : "Authorize Demo Payment"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default PricingPage;
