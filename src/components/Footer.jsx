import React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const TwitterIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GithubIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-white font-sans">
      {/* =========================================================
          CTA SECTION
      ========================================================= */}
      <section className="relative px-6 pb-24 pt-24 sm:px-10 lg:px-16">
        {/* Background glow */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#dff8ea] blur-[100px]" 
        />

        {/* Purple decorative shape */}
        <motion.div
          animate={{ rotate: [0, 3, 0, -3, 0] }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -right-32 top-10 hidden h-[330px] w-[330px] rounded-[70px] bg-[#7657ff] opacity-[0.12] lg:block"
        />

        {/* Main CTA Card */}
        <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[42px] bg-[#111111] px-8 py-16 shadow-[0_35px_100px_rgba(0,0,0,0.16)] sm:px-14 lg:px-20 lg:py-20">
          {/* Decorative green circle */}
          <motion.div 
            animate={{ rotate: [0, 90, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -right-20 -top-32 h-[420px] w-[420px] rounded-full border-[55px] border-[#5DDA95]/20 border-dashed" 
          />

          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -bottom-40 left-1/3 h-[400px] w-[400px] rounded-full bg-[#7657ff]/20 blur-[80px]" 
          />

          {/* Small stars */}
          <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute right-[25%] top-16">
            <Sparkles size={28} className="text-[#5DDA95]" />
          </motion.div>

          <motion.div animate={{ rotate: [0, -20, 20, 0], scale: [1, 1.3, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-16 right-[12%]">
            <Sparkles size={18} className="text-[#7657ff]" />
          </motion.div>

          <div className="relative z-10 max-w-[760px]">
            {/* Badge */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-[12px] font-bold text-white/80 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#5DDA95]" />
              Your next great product starts with a prompt.
            </div>

            {/* Heading */}
            <h2 className="text-[46px] font-black leading-[0.98] tracking-[-2.8px] text-white sm:text-[62px] lg:text-[76px]">
              Turn ideas into
              <br />
              <span className="relative inline-block text-[#5DDA95]">
                beautiful Design.
                <svg
                  className="absolute -bottom-3 left-0 h-[13px] w-full"
                  viewBox="0 0 500 13"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M3 6 Q120 12 250 6 T497 6"
                    fill="none"
                    stroke="#5DDA95"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>

            {/* Description */}
            <p className="mt-7 max-w-[590px] text-[16px] leading-7 text-white/55 sm:text-[18px]">
              Start with a simple prompt. Design, iterate, and create
              production-ready experiences with AI.
            </p>

            {/* CTA */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <motion.button 
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="group flex items-center gap-3 rounded-full bg-white px-7 py-4 text-[14px] font-extrabold text-[#111111] shadow-[0_12px_30px_rgba(255,255,255,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(255,255,255,0.18)]"
              >
                Start Designing Free

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5DDA95] transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight size={16} strokeWidth={2.5} />
                </span>
              </motion.button>

              <button className="rounded-full border border-white/15 bg-white/[0.05] px-7 py-4 text-[14px] font-bold text-white/80 backdrop-blur transition hover:bg-white/10 hover:text-white">
                Explore Showcase
              </button>
            </div>
          </div>

          {/* Floating mini UI */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-12 right-12 hidden w-[210px] rounded-[22px] border border-white/10 bg-white/[0.08] p-4 backdrop-blur-xl lg:block"
          >
            <div className="mb-4 flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </div>

            <div className="space-y-2">
              <div className="h-2 w-[75%] rounded-full bg-white/20" />
              <div className="h-2 w-[55%] rounded-full bg-white/10" />
              <div className="mt-4 h-8 w-full rounded-lg bg-[#7657ff]" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-16">
        <div className="h-px bg-[#e8e8e8]" />

        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <a href="#" className="inline-flex items-center gap-3">
              <motion.span 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[#5865f2] text-white shadow-[0_8px_20px_rgba(88,101,242,.2)]"
              >
                <Sparkles size={19} strokeWidth={2.4} />
              </motion.span>

              <span className="text-[22px] font-black tracking-[-1px] text-[#111111]">
                DesignDroid AI
              </span>
            </a>

            <p className="mt-5 max-w-[330px] text-[14px] leading-6 text-[#737373]">
              Design stunning websites with AI. From a simple prompt to a
              production-ready experience.
            </p>

            {/* Socials */}
            <div className="mt-7 flex items-center gap-2">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8e8e8] text-[#555] transition hover:border-[#111] hover:bg-[#111] hover:text-white"
              >
                <TwitterIcon />
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8e8e8] text-[#555] transition hover:border-[#111] hover:bg-[#111] hover:text-white"
              >
                <GithubIcon />
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8e8e8] text-[#555] transition hover:border-[#111] hover:bg-[#111] hover:text-white"
              >
                <LinkedinIcon />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[13px] font-extrabold text-[#111]">
              Product
            </h4>

            <div className="mt-5 space-y-3.5">
              <a
                href="#"
                className="block text-[13px] text-[#777] transition hover:text-[#111]"
              >
                Design
              </a>

              <a
                href="#"
                className="block text-[13px] text-[#777] transition hover:text-[#111]"
              >
                Generate
              </a>

              <a
                href="#"
                className="block text-[13px] text-[#777] transition hover:text-[#111]"
              >
                Showcase
              </a>

              <a
                href="#"
                className="block text-[13px] text-[#777] transition hover:text-[#111]"
              >
                Pricing
              </a>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-[13px] font-extrabold text-[#111]">
              Resources
            </h4>

            <div className="mt-5 space-y-3.5">
              <a
                href="#"
                className="block text-[13px] text-[#777] transition hover:text-[#111]"
              >
                Documentation
              </a>

              <a
                href="#"
                className="block text-[13px] text-[#777] transition hover:text-[#111]"
              >
                Community
              </a>

              <a
                href="#"
                className="block text-[13px] text-[#777] transition hover:text-[#111]"
              >
                Templates
              </a>

              <a
                href="#"
                className="block text-[13px] text-[#777] transition hover:text-[#111]"
              >
                Changelog
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[13px] font-extrabold text-[#111]">
              Company
            </h4>

            <div className="mt-5 space-y-3.5">
              <a
                href="#"
                className="block text-[13px] text-[#777] transition hover:text-[#111]"
              >
                About
              </a>

              <a
                href="#"
                className="block text-[13px] text-[#777] transition hover:text-[#111]"
              >
                Contact
              </a>

              <a
                href="#"
                className="block text-[13px] text-[#777] transition hover:text-[#111]"
              >
                Twitter
              </a>

              <a
                href="#"
                className="block text-[13px] text-[#777] transition hover:text-[#111]"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-4 border-t border-[#e8e8e8] py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-[#8a8a8a]">
            © 2026 DesignDroid AI. All rights reserved.
          </p>

          <div className="flex gap-6">
            <a
              href="#"
              className="text-[12px] text-[#8a8a8a] transition hover:text-[#111]"
            >
              Privacy
            </a>

            <a
              href="#"
              className="text-[12px] text-[#8a8a8a] transition hover:text-[#111]"
            >
              Terms
            </a>

            <a
              href="#"
              className="text-[12px] text-[#8a8a8a] transition hover:text-[#111]"
            >
              Cookies
            </a>
          </div>
        </div>
      </div>

      {/* Bottom decorative glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[3px] w-[180px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#7657ff] via-[#5DDA95] to-[#7657ff]" />
    </footer>
  );
};

export default Footer;
