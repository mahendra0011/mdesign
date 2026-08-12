import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Layers3,
  UsersRound,
  MousePointer2,
  Smartphone,
  ExternalLink,
  ArrowRight,
  Zap,
  UserRound,
  Box,
  Settings2,
} from "lucide-react";

/*
  Section 6 — Feature ecosystem
  Desktop composition is locked to the 1672 × 941 reference canvas.
  The whole canvas scales proportionally, so the relative positions stay intact.
*/

const DESIGN_W = 1672;
const DESIGN_H = 941;

const leftFeatures = [
  {
    icon: Sparkles,
    color: "#5B55F5",
    bg: "#EEF0FF",
    title: "AI Generation",
    desc: "Turn your ideas into complete UI designs in seconds.",
    line: "#625CF6",
    dashed: false,
  },
  {
    icon: Layers3,
    color: "#18B878",
    bg: "#E9FBF3",
    title: "Templates",
    desc: "Start faster with ready-made layouts and modern components.",
    line: "#19BC7C",
    dashed: true,
  },
  {
    icon: UsersRound,
    color: "#FF650D",
    bg: "#FFF0E8",
    title: "Collaboration",
    desc: "Work together with your team in real-time.",
    line: "#FF650D",
    dashed: false,
  },
];

const rightFeatures = [
  {
    icon: MousePointer2,
    color: "#14B77A",
    bg: "#E9FBF3",
    title: "Design Systems",
    desc: "Keep colors, typography and components consistent.",
    line: "#18BC80",
    dashed: true,
  },
  {
    icon: Smartphone,
    color: "#347FF2",
    bg: "#EDF4FF",
    title: "Responsive UI",
    desc: "Generate beautiful designs for Web & Mobile from one prompt.",
    line: "#347FF2",
    dashed: false,
  },
  {
    icon: ExternalLink,
    color: "#A14FF3",
    bg: "#F2E9FF",
    title: "Export & Integrate",
    desc: "Take your designs to code, Figma or your dev workflow.",
    line: "#A14FF3",
    dashed: false,
  },
];

function FeatureCard({ item, side, index }) {
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -22 : 22 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="absolute w-[21.17%] h-[15.83%]"
      style={{
        left: side === "left" ? "4.62%" : "73.00%",
        top: `${index === 0 ? 30.3 : index === 1 ? 48.1 : 66.2}%`,
      }}
    >
      <motion.div 
        animate={{ y: [0, index % 2 === 0 ? -6 : 6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
        className="h-full w-full rounded-[22px] border border-[#E9ECF2] bg-white shadow-[0_15px_40px_rgba(31,41,55,.055)]"
      >
        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full"
          style={{
            [side === "left" ? "right" : "left"]: "-6px",
            background: item.color,
            boxShadow: `0 0 0 5px ${item.bg}`,
          }}
        />

        <div className="absolute left-[4.8%] top-1/2 flex h-[54px] w-[54px] -translate-y-1/2 items-center justify-center rounded-full" style={{ background: item.bg, color: item.color }}>
          <motion.div animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}>
            <Icon size={25} strokeWidth={2.15} />
          </motion.div>
        </div>

        <div className="absolute left-[25.7%] right-[4%] top-1/2 -translate-y-1/2">
          <h3 className="text-[17px] font-extrabold leading-none tracking-[-.35px] text-[#101827]">
            {item.title}
          </h3>
          <p className="mt-[10px] max-w-[235px] text-[13px] font-medium leading-[1.45] text-[#66758D]">
            {item.desc}
          </p>
          <div className="mt-[10px] flex items-center gap-1 text-[12px] font-extrabold text-[#5048EF]">
            Learn more <ArrowRight size={13} strokeWidth={2.4} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function BrowserMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
      className="absolute left-[31.76%] top-[35.50%] z-20 h-[35.60%] w-[34.39%]"
    >
      <motion.div 
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="h-full w-full overflow-visible rounded-[17px] border border-[#E6E9EF] bg-white shadow-[0_25px_55px_rgba(25,35,55,.12)]"
      >
        <div className="flex h-[39px] items-center border-b border-[#EFF1F4] bg-[#FEFEFE] px-[16px]">
          <span className="mr-[7px] h-[11px] w-[11px] rounded-full bg-[#FF6257]" />
          <span className="mr-[7px] h-[11px] w-[11px] rounded-full bg-[#FFBD2E]" />
          <span className="h-[11px] w-[11px] rounded-full bg-[#28C840]" />
          <div className="ml-auto flex gap-2 pr-1">
            <span className="h-[10px] w-[10px] rounded-full bg-[#F0F2F5]" />
            <span className="h-[10px] w-[10px] rounded-full bg-[#F0F2F5]" />
          </div>
        </div>

        <div className="relative flex h-[calc(100%-39px)] overflow-hidden rounded-b-[17px]">
          <aside className="w-[30.1%] shrink-0 border-r border-[#EFF1F4] bg-[#FCFCFD] px-[17px] py-[20px]">
            <div className="mb-[21px] flex items-center gap-[10px]">
              <div className="flex h-[29px] w-[29px] items-center justify-center rounded-[7px] bg-[#5149EF] text-[12px] font-extrabold text-white">T</div>
              <span className="text-[13px] font-extrabold text-[#101827]">Your Idea</span>
            </div>

            <div className="space-y-[5px] text-[11px] font-medium text-[#5F6D84]">
              <div className="flex items-center gap-[9px] rounded-[9px] bg-[#EEF0FF] px-[11px] py-[9px] font-bold text-[#5149EF]">
                <Sparkles size={14} /> AI Generate
              </div>
              <div className="flex items-center gap-[9px] px-[11px] py-[8px]"><Layers3 size={14} /> Templates</div>
              <div className="flex items-center gap-[9px] px-[11px] py-[8px]"><Box size={14} /> Components</div>
              <div className="flex items-center gap-[9px] px-[11px] py-[8px]"><Settings2 size={14} /> Design System</div>
              <div className="mt-[8px] flex items-center gap-[9px] px-[11px] py-[8px]"><ExternalLink size={14} /> Export</div>
            </div>
          </aside>

          <div className="relative flex-1 overflow-hidden bg-white">
            <div className="absolute left-[9.5%] top-[14.5%] text-[25px] font-extrabold leading-[1.03] tracking-[-1.1px] text-[#101827]">
              Turn your
              <br />
              <span className="text-[#5149EF]">idea into reality</span>
            </div>

            <div className="absolute left-[9.5%] top-[44%] space-y-[9px]">
              <div className="h-[8px] w-[140px] rounded-full bg-[#E4E7EC]" />
              <div className="h-[8px] w-[178px] rounded-full bg-[#E4E7EC]" />
              <div className="h-[8px] w-[118px] rounded-full bg-[#E4E7EC]" />
            </div>

            <button className="absolute left-[9.5%] top-[67%] flex items-center gap-2 rounded-[9px] bg-[#5149EF] px-[18px] py-[11px] text-[11px] font-extrabold text-white shadow-[0_7px_16px_rgba(81,73,239,.18)]">
              Create with AI <ArrowRight size={13} />
            </button>

            {/* Inner generated website preview */}
            <div className="absolute right-[7.5%] top-[11.5%] h-[62%] w-[46%] rounded-[16px] border border-[#EEF0F4] bg-[#F8FAFC] shadow-[0_10px_22px_rgba(30,41,59,.07)]">
              <div className="absolute right-[16px] top-[14px] h-[42px] w-[42px] rounded-full bg-[#20C56A]" />
              <div className="absolute bottom-0 left-0 h-[57%] w-[42%] bg-[#A74EF2]" style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }} />
              <div className="absolute bottom-[12px] left-[18%] h-[27%] w-[62%] rounded-[10px] border border-[#E9ECF2] bg-white shadow-sm">
                <div className="mt-[12px] flex gap-[7px] px-[12px]"><span className="h-[8px] w-[8px] rounded-full bg-[#5D79F4]" /><span className="h-[8px] w-[8px] rounded-full bg-[#32BD88]" /><span className="h-[8px] w-[38px] rounded-full bg-[#5D79F4]" /></div>
                <div className="mx-[12px] mt-[10px] h-[5px] w-[66%] rounded-full bg-[#E7E9EE]" />
                <div className="mx-[12px] mt-[8px] h-[10px] w-[42%] rounded-full bg-[#4136A8]" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PhoneMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: 0.15 }}
      className="absolute left-[62.2%] top-[51.5%] z-40 h-[18.8%] w-[8.1%]"
    >
      <motion.div 
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="h-full w-full rounded-[20px] border-[4px] border-white bg-white p-[6px] shadow-[0_17px_30px_rgba(25,35,55,.18)]"
        style={{ borderColor: "#F4F5F8" }}
      >
        <div className="absolute left-1/2 top-0 h-[10px] w-[39px] -translate-x-1/2 rounded-b-[8px] bg-[#F0F1F4]" />
        <div className="mt-[15px] h-[48%] overflow-hidden rounded-[10px] border border-[#EEF0F4] bg-[#F8FAFC]">
          <div className="absolute right-[9px] top-[32px] h-[24px] w-[24px] rounded-full bg-[#347FF2]" />
          <div className="absolute bottom-[43%] left-[11px] h-[40px] w-[58px] bg-[#A74EF2]" style={{ clipPath: "polygon(0 100%, 50% 0, 100% 100%)" }} />
        </div>
        <div className="mt-[9px] space-y-[5px] px-[7px]">
          <div className="h-[5px] w-[65%] rounded-full bg-[#DDE2E9]" />
          <div className="h-[4px] w-[80%] rounded-full bg-[#EEF0F3]" />
          <div className="h-[4px] w-[62%] rounded-full bg-[#EEF0F3]" />
          <div className="mt-[8px] h-[12px] w-[26px] rounded-[4px] bg-[#1DC46B]" />
        </div>
        <div className="absolute bottom-[7px] left-[8px] right-[8px] h-[22px] rounded-[7px] bg-[#5149EF]" />
      </motion.div>
    </motion.div>
  );
}

function ConnectorLines() {
  return (
    <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`} fill="none" preserveAspectRatio="none">
      {/* left */}
      <motion.path d="M430 342 C468 342 495 361 530 399" stroke="#625CF6" strokeWidth="2.4" strokeDasharray="6 6" animate={{ strokeDashoffset: [24, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
      <motion.path d="M430 507 C468 507 498 507 532 507" stroke="#19BC7C" strokeWidth="2.4" strokeDasharray="6 6" animate={{ strokeDashoffset: [24, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
      <motion.path d="M430 675 C470 675 498 640 530 600" stroke="#FF650D" strokeWidth="2.4" strokeDasharray="6 6" animate={{ strokeDashoffset: [24, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />

      {/* right */}
      <motion.path d="M1146 398 C1180 361 1206 342 1240 342" stroke="#18BC80" strokeWidth="2.4" strokeDasharray="6 6" animate={{ strokeDashoffset: [24, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
      <motion.path d="M1146 507 C1184 507 1210 507 1240 507" stroke="#347FF2" strokeWidth="2.4" strokeDasharray="6 6" animate={{ strokeDashoffset: [24, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
      <motion.path d="M1146 602 C1180 640 1205 675 1240 675" stroke="#A14FF3" strokeWidth="2.4" strokeDasharray="6 6" animate={{ strokeDashoffset: [24, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />

      {/* arrowheads */}
      <path d="M514 390 L530 399 L516 405" fill="#625CF6" />
      <path d="M516 500 L530 507 L516 514" fill="#19BC7C" />
      <path d="M516 592 L530 600 L517 607" fill="#FF650D" />
      <path d="M1162 380 L1146 398 L1166 393" fill="#18BC80" />
      <path d="M1224 500 L1240 507 L1224 514" fill="#347FF2" />
      <path d="M1162 616 L1146 602 L1166 607" fill="#A14FF3" />

      {/* outer dots */}
      <motion.circle cx="430" cy="342" r="6" fill="#625CF6" animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
      <motion.circle cx="430" cy="507" r="6" fill="#19BC7C" animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
      <motion.circle cx="430" cy="675" r="6" fill="#FF650D" animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} />
      <motion.circle cx="1240" cy="342" r="6" fill="#18BC80" animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.2 }} />
      <motion.circle cx="1240" cy="507" r="6" fill="#347FF2" animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
      <motion.circle cx="1240" cy="675" r="6" fill="#A14FF3" animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.8 }} />
    </svg>
  );
}

function Decoration() {
  return (
    <>
      {/* top-left split shape + grid */}
      {/* Top-left reference mark: two small, separated D-shaped halves.
          Locked to the reference at roughly x=56, y=42, w=121, h=108 on 1672x941. */}
      <div className="absolute left-[3.35%] top-[4.45%] h-[11.48%] w-[7.25%]">
        <div
          className="absolute left-0 top-0 h-full w-[49.5%] overflow-hidden bg-[#C8A5F4]"
          style={{
            borderRadius: "0 100% 100% 0 / 0 50% 50% 0",
            backgroundImage: "linear-gradient(rgba(92,57,145,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(92,57,145,.10) 1px, transparent 1px)",
            backgroundSize: "8px 8px",
          }}
        />
        <div
          className="absolute right-0 top-0 h-full w-[49.5%] overflow-hidden bg-[#4DDBA5]"
          style={{
            borderRadius: "0 100% 100% 0 / 0 50% 50% 0",
            backgroundImage: "linear-gradient(rgba(24,116,83,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(24,116,83,.10) 1px, transparent 1px)",
            backgroundSize: "8px 8px",
          }}
        />
        <div
          className="absolute -inset-[2px] -z-10 opacity-45"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.055) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        />
      </div>

      {/* top-right dots */}
      <div className="absolute right-[4.8%] top-[3.1%] h-[10%] w-[11%] opacity-55" style={{ backgroundImage: "radial-gradient(#D9DDE5 2px, transparent 2px)", backgroundSize: "20px 20px" }} />

      {/* orange circle + arrow + sparkle */}
      <div className="absolute right-[7.7%] top-[2.7%] h-[20%] w-[15%]">
        <div className="absolute right-[8%] top-0 h-[65px] w-[65px] rounded-full bg-[#FF700F]" />
        <svg className="absolute right-[18%] top-[20px]" width="110" height="82" viewBox="0 0 110 82">
          <path d="M0 73 C20 32 51 61 83 22" stroke="#101827" strokeWidth="2.6" fill="none" />
          <path d="M77 18 L95 20 L86 34" fill="#101827" />
        </svg>
        <div className="absolute right-[-1%] top-[-6px] text-[#18C79B]">
          <svg width="28" height="28" viewBox="0 0 24 24"><path fill="currentColor" d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" /></svg>
        </div>
      </div>

      {/* green rays left */}
      <div className="absolute left-[2.7%] top-[28%] text-[#3BCF8C]">
        <svg width="50" height="46" viewBox="0 0 50 46">
          <path d="M10 8 L18 17 M31 5 L29 18 M43 18 L33 24" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>

      {/* blue rays right */}
      <div className="absolute right-[3%] top-[46%] text-[#347FF2]">
        <svg width="45" height="50" viewBox="0 0 45 50">
          <path d="M18 4 L9 15 M34 17 L21 22 M36 31 L25 29" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>

      {/* bottom-left dots */}
      <div className="absolute bottom-[3%] left-[7%] h-[9%] w-[10%] opacity-55" style={{ backgroundImage: "radial-gradient(#D9DDE5 2px, transparent 2px)", backgroundSize: "20px 20px" }} />
      <div className="absolute bottom-[8.4%] left-[4.8%] flex gap-3">
        <span className="h-[14px] w-[14px] rounded-full bg-[#347FF2]" />
        <span className="h-[14px] w-[14px] rounded-full bg-[#FF700F]" />
        <span className="h-[14px] w-[14px] rounded-full bg-[#2BC47E]" />
      </div>

      {/* bottom-right ring + triangle + sparkle */}
      <div className="absolute bottom-[1.6%] right-[4.1%] h-[9%] w-[11%]">
        <div className="absolute right-[39%] top-0 h-[64px] w-[64px] rounded-full border-[6px] border-[#101827]" />
        <div className="absolute right-[48%] top-[26px] h-[14px] w-[14px] rounded-full bg-[#2BC47E]" />
        <div className="absolute right-[8%] top-[14px] h-0 w-0 border-b-[27px] border-l-[24px] border-r-[0px] border-b-[#554AF0] border-l-transparent" />
        <div className="absolute right-[-2%] top-[-7px] text-[#18C79B]"><svg width="25" height="25" viewBox="0 0 24 24"><path fill="currentColor" d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" /></svg></div>
      </div>
    </>
  );
}

function BenefitsBar() {
  const items = [
    { icon: Zap, title: "10x", sub: "Faster creation" },
    { icon: UserRound, title: "No design skills", sub: "required" },
    { icon: Smartphone, title: "Fully responsive", sub: "by default" },
    { icon: UsersRound, title: "Built for modern", sub: "teams" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="absolute bottom-[8.0%] left-1/2 z-50 flex h-[10%] w-[45%] -translate-x-1/2 items-center justify-between rounded-full border border-[#E8E3FF] bg-[#F6F3FF] px-[2.0%]"
    >
      {items.map(({ icon: Icon, title, sub }, i) => (
        <React.Fragment key={title}>
          {i > 0 && <div className="h-[43px] w-px bg-[#DDD7FF]" />}
          <div className="flex items-center gap-[11px]">
            <Icon size={22} strokeWidth={2.25} className="text-[#5149EF]" />
            <div className="text-left">
              <div className="text-[14px] font-extrabold leading-[1.05] text-[#101827]">{title}</div>
              <div className="mt-[4px] text-[12px] font-medium leading-none text-[#66758D]">{sub}</div>
            </div>
          </div>
        </React.Fragment>
      ))}
    </motion.div>
  );
}

export default function EcosystemSection() {
  return (
    <section className="w-full bg-white">
      <div
        className="relative mx-auto w-full max-w-[1672px] overflow-hidden bg-white font-sans max-[900px]:hidden"
        style={{ aspectRatio: `${DESIGN_W}/${DESIGN_H}` }}
      >
        <Decoration />

        {/* Header */}
        <div className="absolute left-1/2 top-[3.2%] z-30 w-[54%] -translate-x-1/2 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto flex w-fit items-center justify-center relative"
          >
            {/* Pulsing glow behind the badge */}
            <motion.div
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-[#5149EF] blur-md"
            />
            {/* The badge itself with a floating animation */}
            <motion.div 
              animate={{ y: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="relative flex items-center gap-2 rounded-full border border-[#5149EF]/30 bg-white px-[15px] py-[7px] text-[12px] font-extrabold text-[#5149EF] shadow-[0_0_15px_rgba(81,73,239,0.2)]"
            >
              {/* Shimmering/rotating sparkles */}
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <Sparkles size={14} />
              </motion.div>
              Built for Better Design
            </motion.div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-[20px] text-[54px] font-extrabold leading-[.99] tracking-[-2.5px] text-[#101827]"
          >
            A complete ecosystem
            <br />
            for modern <span className="text-[#5149EF]">design teams.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mx-auto mt-[22px] max-w-[760px] text-[16px] font-medium leading-[1.55] text-[#66758D]"
          >
            Everything you need to turn ideas into beautiful, production-ready websites<br />
            and apps — powered by AI.
          </motion.p>
        </div>

        {/* soft center glow + grid */}
        <div className="absolute left-1/2 top-[31%] h-[43%] w-[43%] -translate-x-1/2 rounded-full bg-[#DDF8EA]/70 blur-[55px]" />
        <div
          className="absolute left-1/2 top-[31%] h-[43%] w-[54%] -translate-x-1/2 rounded-[38px] opacity-65"
          style={{
            backgroundImage: "linear-gradient(rgba(45,55,72,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(45,55,72,.055) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            maskImage: "radial-gradient(ellipse at center, black 34%, transparent 76%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 34%, transparent 76%)",
          }}
        />

        {leftFeatures.map((item, index) => (
          <FeatureCard key={item.title} item={item} side="left" index={index} />
        ))}
        {rightFeatures.map((item, index) => (
          <FeatureCard key={item.title} item={item} side="right" index={index} />
        ))}

        <ConnectorLines />
        <BrowserMockup />
        <PhoneMockup />
        <BenefitsBar />
      </div>

      {/* compact fallback */}
      <div className="mx-auto hidden max-w-[900px] px-5 py-16 max-[900px]:block">
        <div className="text-center">
          <div className="mx-auto flex w-fit items-center justify-center relative">
            <motion.div
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-[#5149EF] blur-md"
            />
            <motion.div 
              animate={{ y: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="relative flex items-center gap-2 rounded-full border border-[#5149EF]/30 bg-white px-[15px] py-[7px] text-[12px] font-extrabold text-[#5149EF] shadow-[0_0_15px_rgba(81,73,239,0.2)]"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <Sparkles size={14} />
              </motion.div>
              Built for Better Design
            </motion.div>
          </div>
          <h2 className="mt-5 text-4xl font-extrabold leading-[1.02] tracking-[-1.5px] text-[#101827]">
            A complete ecosystem<br />for modern <span className="text-[#5149EF]">design teams.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-[#66758D]">
            Everything you need to turn ideas into beautiful, production-ready websites and apps — powered by AI.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {[...leftFeatures, ...rightFeatures].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-[20px] border border-[#E9ECF2] bg-white p-5 shadow-[0_15px_40px_rgba(31,41,55,.055)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{background:item.bg,color:item.color}}><Icon size={22}/></div>
                  <div>
                    <h3 className="font-extrabold text-[#101827]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-5 text-[#66758D]">{item.desc}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-extrabold text-[#5149EF]">Learn more <ArrowRight size={13}/></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
