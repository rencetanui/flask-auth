import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./landing.css";

const featureCards = [
  {
    symbol: "01",
    title: "Instant capture",
    description:
      "Add tasks in seconds from anywhere so ideas never disappear between tabs, meetings, or context switches.",
  },
  {
    symbol: "02",
    title: "Smart prioritization",
    description:
      "Sort work by urgency and importance without building a system so complex that nobody follows it.",
  },
  {
    symbol: "03",
    title: "Progress tracking",
    description:
      "See what is moving, what is blocked, and what is done from one clean operating view.",
  },
  {
    symbol: "04",
    title: "Team collaboration",
    description:
      "Shared lists, clear ownership, and fast updates keep everyone aligned without the usual project noise.",
  },
  {
    symbol: "05",
    title: "Smart reminders",
    description:
      "Deadlines stay visible before they become emergencies, so follow-through becomes the default.",
  },
  {
    symbol: "06",
    title: "Connected workflow",
    description:
      "Bring planning, execution, and review into one place instead of splitting attention across scattered tools.",
  },
];

const testimonials = [
  {
    quote:
      "Task Flow replaced four different routines for us. Standups got shorter, handoffs got cleaner, and the team stopped asking where work lives.",
    initials: "AK",
    name: "Amara Kim",
    role: "Head of Product, Altitude",
    tone: "violet",
  },
  {
    quote:
      "The priority model is simple enough that everyone actually uses it. That sounds small, but it changed our week-to-week execution.",
    initials: "MO",
    name: "Marcus Osei",
    role: "Engineering Lead, Stackr",
    tone: "green",
  },
  {
    quote:
      "It is calm, fast, and direct. We spend less time organizing work and more time shipping it.",
    initials: "SL",
    name: "Sofia Larsson",
    role: "CEO, Threadline",
    tone: "rose",
  },
];

const pricingPlans = [
  {
    tier: "Free",
    price: "$0",
    suffix: "/ month",
    description: "For individuals and small teams getting started.",
    cta: "Get started free",
    featured: false,
    filled: false,
    items: [
      "Up to 3 projects",
      "5 team members",
      "Basic task management",
      "Email reminders",
      "Mobile access",
    ],
  },
  {
    tier: "Pro",
    price: "$12",
    suffix: "/ month",
    description: "For growing teams that need more depth and flexibility.",
    cta: "Start Pro trial",
    featured: true,
    filled: true,
    items: [
      "Unlimited projects",
      "Unlimited members",
      "Priority and subtask views",
      "Slack and GitHub integration",
      "Advanced reporting",
      "Custom fields and tags",
    ],
  },
  {
    tier: "Enterprise",
    price: "Custom",
    suffix: "",
    description: "For organizations with security, support, and compliance needs.",
    cta: "Talk to sales",
    featured: false,
    filled: false,
    items: [
      "Everything in Pro",
      "SSO and SAML auth",
      "Audit logs",
      "SLA support",
      "Dedicated onboarding",
    ],
  },
];

function PricingButton({ plan, onPrimaryAction }) {
  if (plan.filled) {
    return (
      <button
        type="button"
        className="tl-pricing-cta tl-pricing-cta-filled"
        onClick={onPrimaryAction}
      >
        {plan.cta}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="tl-pricing-cta tl-pricing-cta-ghost"
      onClick={onPrimaryAction}
    >
      {plan.cta}
    </button>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll(".tl-reveal"));
    if (!nodes.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    nodes.forEach((node) => observer.observe(node));

    return () => {
      observer.disconnect();
    };
  }, []);

  function handleLoginAction() {
    navigate("/login");
  }

  function handleGetStartedAction() {
    navigate("/register");
  }

  return (
    <div className="tl-page">
      <header className="tl-nav">
        <div className="tl-logo">Task Flow</div>
        <nav className="tl-nav-links" aria-label="Landing sections">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="tl-nav-actions">
          <button type="button" className="tl-btn-ghost" onClick={handleLoginAction}>
            Log in
          </button>
          <button type="button" className="tl-btn-primary" onClick={handleGetStartedAction}>
            Get started free
          </button>
        </div>
      </header>

      <main>
        <section className="tl-hero">
          <div className="tl-hero-grid" />
          <div className="tl-hero-glow tl-hero-glow-primary" />
          <div className="tl-hero-glow tl-hero-glow-secondary" />

          <div className="tl-hero-inner">
            <div className="tl-hero-tag">
              <span />
              Now in public beta
            </div>

            <h1 className="tl-hero-title">
              Work at the
              <br />
              <em>speed of thought</em>
            </h1>

            <p className="tl-hero-copy">
              Task Flow brings radical clarity to your team&apos;s work. One place for tasks, priorities,
              and progress, without the usual operational clutter.
            </p>

            <div className="tl-hero-actions">
              <button type="button" className="tl-btn-large" onClick={handleGetStartedAction}>
                Start for free
              </button>
              <a href="#how" className="tl-btn-outline">
                See how it works
              </a>
            </div>

            <p className="tl-hero-note">
              No credit card required. Free forever plan. Setup in 2 minutes.
            </p>

            <div className="tl-app-preview tl-reveal">
              <div className="tl-app-preview-bar">
                <div className="tl-dot tl-dot-red" />
                <div className="tl-dot tl-dot-yellow" />
                <div className="tl-dot tl-dot-green" />
                <div className="tl-app-preview-url">app.taskflow.io</div>
              </div>

              <div className="tl-app-mock">
                <div className="tl-mock-sidebar">
                  <div className="tl-mock-sidebar-title">My Workspace</div>
                  <div className="tl-mock-list-item is-active">
                    <span className="tl-mock-dot tl-c-accent" />
                    All Tasks
                  </div>
                  <div className="tl-mock-list-item">
                    <span className="tl-mock-dot tl-c-violet" />
                    Product Launch
                  </div>
                  <div className="tl-mock-list-item">
                    <span className="tl-mock-dot tl-c-rose" />
                    Marketing Q1
                  </div>
                  <div className="tl-mock-list-item">
                    <span className="tl-mock-dot tl-c-amber" />
                    Engineering
                  </div>
                  <div className="tl-mock-list-item">
                    <span className="tl-mock-dot tl-c-green" />
                    Personal
                  </div>
                </div>

                <div className="tl-mock-main">
                  <div className="tl-mock-header">
                    <div className="tl-mock-title">All Tasks</div>
                    <div className="tl-mock-badge">12 open</div>
                  </div>

                  <div className="tl-mock-task">
                    <div className="tl-mock-check is-done">OK</div>
                    <div className="tl-mock-task-text is-done">Set up project workspace</div>
                    <div className="tl-priority tl-priority-low">Done</div>
                  </div>
                  <div className="tl-mock-task">
                    <div className="tl-mock-check is-done">OK</div>
                    <div className="tl-mock-task-text is-done">Define Q1 priorities with team leads</div>
                    <div className="tl-priority tl-priority-low">Done</div>
                  </div>
                  <div className="tl-mock-task">
                    <div className="tl-mock-check" />
                    <div className="tl-mock-task-text">Finalize product roadmap v2.0</div>
                    <div className="tl-priority tl-priority-high">High</div>
                  </div>
                  <div className="tl-mock-task">
                    <div className="tl-mock-check" />
                    <div className="tl-mock-task-text">Review design system updates</div>
                    <div className="tl-priority tl-priority-med">Medium</div>
                  </div>
                  <div className="tl-mock-task">
                    <div className="tl-mock-check" />
                    <div className="tl-mock-task-text">Prepare launch announcement draft</div>
                    <div className="tl-priority tl-priority-med">Medium</div>
                  </div>
                  <div className="tl-mock-task">
                    <div className="tl-mock-check" />
                    <div className="tl-mock-task-text">Sync with legal on policy updates</div>
                    <div className="tl-priority tl-priority-low">Low</div>
                  </div>
                </div>

                <div className="tl-mock-detail">
                  <div className="tl-mock-detail-title">Finalize product roadmap v2.0</div>
                  <div className="tl-mock-detail-meta">
                    Due: Mar 15, 2026
                    <br />
                    Project: Product Launch
                    <br />
                    Priority: High
                  </div>
                  <div className="tl-mock-progress-label">
                    <span>Progress</span>
                    <span className="tl-progress-value">68%</span>
                  </div>
                  <div className="tl-progress-bar">
                    <div className="tl-progress-fill" />
                  </div>
                  <div className="tl-meta-label">Assignees</div>
                  <div className="tl-avatar-row">
                    <div className="tl-avatar tl-avatar-violet">JL</div>
                    <div className="tl-avatar tl-avatar-teal">MK</div>
                    <div className="tl-avatar tl-avatar-amber">SR</div>
                  </div>
                  <div className="tl-meta-label tl-spacer-top">Tags</div>
                  <div className="tl-tag-row">
                    <span className="tl-tag">roadmap</span>
                    <span className="tl-tag">product</span>
                    <span className="tl-tag">q1-2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="tl-trust tl-reveal">
          <div className="tl-trust-label">Trusted by teams at</div>
          <div className="tl-trust-logos">
            <span>Vercel</span>
            <span>Stripe</span>
            <span>Linear</span>
            <span>Notion</span>
            <span>Figma</span>
          </div>
          <div className="tl-trust-stat">
            <strong>50k+</strong>
            <span>teams worldwide</span>
          </div>
        </section>

        <section className="tl-section" id="features">
          <div className="tl-section-eyebrow tl-reveal">// Features</div>
          <h2 className="tl-section-title tl-reveal">
            Everything your team needs. Nothing it does not.
          </h2>

          <div className="tl-feature-grid tl-reveal">
            {featureCards.map((card) => (
              <article key={card.title} className="tl-feature-card">
                <div className="tl-feature-icon">{card.symbol}</div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="tl-section tl-section-alt" id="how">
          <div className="tl-section-eyebrow tl-reveal">// How it works</div>
          <h2 className="tl-section-title tl-reveal">Up and running in three steps</h2>

          <div className="tl-step-grid">
            <div className="tl-step tl-reveal">
              <div className="tl-step-num">01</div>
              <h3>Create your workspace</h3>
              <p>Sign up, invite teammates, and give every active project a clear home in minutes.</p>
            </div>
            <div className="tl-step tl-reveal">
              <div className="tl-step-num">02</div>
              <h3>Add and assign tasks</h3>
              <p>Capture work, set due dates, define ownership, and make the next action visible.</p>
            </div>
            <div className="tl-step tl-reveal">
              <div className="tl-step-num">03</div>
              <h3>Track and ship</h3>
              <p>Watch progress move in real time, close loops faster, and keep delivery predictable.</p>
            </div>
          </div>
        </section>

        <section className="tl-section">
          <div className="tl-section-eyebrow tl-reveal">// What people say</div>
          <h2 className="tl-section-title tl-reveal">
            Teams who switched
            <br />
            <em>never looked back</em>
          </h2>

          <div className="tl-testimonial-grid">
            {testimonials.map((item) => (
              <article key={item.name} className="tl-testimonial tl-reveal">
                <p className="tl-testimonial-quote">&quot;{item.quote}&quot;</p>
                <div className="tl-testimonial-author">
                  <div className={`tl-testimonial-avatar tl-tone-${item.tone}`}>{item.initials}</div>
                  <div>
                    <div className="tl-testimonial-name">{item.name}</div>
                    <div className="tl-testimonial-role">{item.role}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="tl-section tl-section-alt" id="pricing">
          <div className="tl-section-eyebrow tl-reveal">// Pricing</div>
          <h2 className="tl-section-title tl-reveal">
            Simple pricing,
            <br />
            no surprises
          </h2>

          <div className="tl-pricing-grid">
            {pricingPlans.map((plan) => (
              <article key={plan.tier} className={`tl-pricing-card${plan.featured ? " is-featured" : ""} tl-reveal`}>
                {plan.featured ? <div className="tl-featured-label">Most Popular</div> : null}
                <div className="tl-pricing-tier">{plan.tier}</div>
                <div className="tl-pricing-price">
                  {plan.price}
                  {plan.suffix ? <span>{plan.suffix}</span> : null}
                </div>
                <p className="tl-pricing-desc">{plan.description}</p>
                <div className="tl-pricing-divider" />
                <div className="tl-pricing-features">
                  {plan.items.map((item) => (
                    <div key={item} className="tl-pricing-feature">
                      {item}
                    </div>
                  ))}
                </div>
                <PricingButton plan={plan} onPrimaryAction={handleGetStartedAction} />
              </article>
            ))}
          </div>
        </section>

        <section className="tl-final-cta">
          <div className="tl-final-glow" />
          <h2 className="tl-reveal">
            Ready to clear
            <br />
            the <em>chaos?</em>
          </h2>
          <p className="tl-reveal">Join 50,000+ teams already working smarter with Task Flow.</p>
          <button
            type="button"
            className="tl-btn-large tl-reveal"
            onClick={handleGetStartedAction}
          >
            Start for free
          </button>
        </section>
      </main>

      <footer className="tl-footer">
        <div className="tl-logo">Task Flow</div>
        <div className="tl-footer-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <Link to="/login">Sign in</Link>
          <Link to="/register">Create account</Link>
        </div>
        <div>Copyright 2026 Task Flow</div>
      </footer>
    </div>
  );
}
