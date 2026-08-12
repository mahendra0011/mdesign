import React from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Monitor,
  Smartphone,
  Zap,
  ArrowRight,
  Play,
  Home,
  CheckSquare,
  Calendar,
  Users,
  Settings,
  Menu,
  Plus,
  Bell,
  User,
} from "lucide-react";

const features = [
  {
    icon: <Monitor size={23} strokeWidth={1.8} />,
    color: "text-[#20c997]",
    bg: "bg-[#e9fbf4]",
    title: "Fully Responsive",
    desc: "AI generates layouts that adapt beautifully to any screen size.",
  },
  {
    icon: <Smartphone size={23} strokeWidth={1.8} />,
    color: "text-[#7657ff]",
    bg: "bg-[#f0ebff]",
    title: "Consistent Experience",
    desc: "Keep your brand, content, and style consistent across all devices.",
  },
  {
    icon: <Zap size={23} strokeWidth={1.8} />,
    color: "text-[#ff6b1a]",
    bg: "bg-[#fff0e7]",
    title: "Auto-Optimized",
    desc: "Smart spacing, typography, and components for the best UX.",
  },
];

const Avatar = ({ seed }) => (
  <img
    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
    alt=""
    className="w-full h-full object-cover"
  />
);

const Chart = ({ mobile = false }) => (
  <svg
    viewBox={mobile ? "0 0 160 55" : "0 0 250 80"}
    className="w-full h-full overflow-visible"
  >
    {/* grid */}
    <motion.line
      x1="0"
      y1={mobile ? "12" : "18"}
      x2={mobile ? "160" : "250"}
      y2={mobile ? "12" : "18"}
      stroke="#f1f3f7"
      strokeWidth="1"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0 }}
    />
    <motion.line
      x1="0"
      y1={mobile ? "28" : "39"}
      x2={mobile ? "160" : "250"}
      y2={mobile ? "28" : "39"}
      stroke="#f1f3f7"
      strokeWidth="1"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
    />
    <motion.line
      x1="0"
      y1={mobile ? "44" : "60"}
      x2={mobile ? "160" : "250"}
      y2={mobile ? "44" : "60"}
      stroke="#f1f3f7"
      strokeWidth="1"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    />

    {!mobile && (
      <>
        <text x="-15" y="20" fill="#a4acb8" fontSize="6">
          10
        </text>
        <text x="-15" y="41" fill="#a4acb8" fontSize="6">
          45
        </text>
        <text x="-15" y="62" fill="#a4acb8" fontSize="6">
          20
        </text>

        <text x="15" y="77" fill="#a4acb8" fontSize="6">
          Mon
        </text>
        <text x="52" y="77" fill="#a4acb8" fontSize="6">
          Tue
        </text>
        <text x="89" y="77" fill="#a4acb8" fontSize="6">
          Wed
        </text>
        <text x="126" y="77" fill="#a4acb8" fontSize="6">
          Thu
        </text>
        <text x="163" y="77" fill="#a4acb8" fontSize="6">
          Fri
        </text>
        <text x="200" y="77" fill="#a4acb8" fontSize="6">
          Sat
        </text>
        <text x="234" y="77" fill="#a4acb8" fontSize="6">
          Sun
        </text>
      </>
    )}

    <motion.path
      d={
        mobile
          ? "M 4 40 L 29 29 L 53 34 L 77 18 L 101 10 L 126 27 L 156 22"
          : "M 8 62 L 47 43 L 86 55 L 125 27 L 164 16 L 203 38 L 242 32"
      }
      fill="none"
      stroke="#635bff"
      strokeWidth={mobile ? "1.5" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="5 5"
      animate={{ strokeDashoffset: [10, 0] }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />

    {(mobile
      ? [
          [4, 40],
          [29, 29],
          [53, 34],
          [77, 18],
          [126, 27],
          [156, 22],
        ]
      : [
          [8, 62],
          [47, 43],
          [86, 55],
          [125, 27],
          [203, 38],
          [242, 32],
        ]
    ).map(([cx, cy], i) => (
      <motion.circle
        key={i}
        cx={cx}
        cy={cy}
        r={mobile ? "1.8" : "2"}
        fill="white"
        stroke="#635bff"
        strokeWidth="1.2"
        animate={{ r: mobile ? [1.8, 2.8, 1.8] : [2, 3, 2] }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
      />
    ))}

    {/* highlighted point */}
    <motion.circle
      cx={mobile ? "101" : "164"}
      cy={mobile ? "10" : "16"}
      r={mobile ? "3" : "3.5"}
      fill="white"
      stroke="#20c997"
      strokeWidth="1.8"
      animate={{ r: mobile ? [3, 4, 3] : [3.5, 4.5, 3.5] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />

    <motion.g
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <rect
        x={mobile ? "93" : "153"}
        y={mobile ? "-7" : "-8"}
        width="20"
        height="11"
        rx="3"
        fill="#20c997"
      />
      <text
        x={mobile ? "103" : "163"}
        y={mobile ? "1" : "0"}
        fill="white"
        fontSize={mobile ? "5" : "6"}
        fontWeight="700"
        textAnchor="middle"
      >
        60%
      </text>
    </motion.g>
  </svg>
);

const ResponsiveSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-[#fafafa] font-sans">
      {/* =========================================================
          BACKGROUND
      ========================================================= */}

      {/* Green Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 100,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
          pointer-events-none absolute z-0
          left-[57%] top-[35px]
          h-[820px] w-[820px]
          -translate-x-1/2
          rounded-full
          border-[32px] border-[#d9f8eb]
          opacity-80
        "
      />

      {/* Purple Background */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          pointer-events-none absolute z-[1]
          right-[4.8%] top-[23px]
          h-[770px] w-[350px]
          rotate-[7deg]
          overflow-hidden
          rounded-[40px]
          bg-[#9137eb]
          shadow-[0_25px_60px_rgba(96,45,190,0.18)]
        "
      >
        <div
          className="
            absolute inset-0 opacity-50
            bg-[linear-gradient(45deg,rgba(255,255,255,.12)_25%,transparent_25%,transparent_75%,rgba(255,255,255,.12)_75%),linear-gradient(45deg,rgba(255,255,255,.12)_25%,transparent_25%,transparent_75%,rgba(255,255,255,.12)_75%)]
            [background-position:0_0,20px_20px]
            [background-size:40px_40px]
          "
        />
      </motion.div>

      {/* Purple dotted curve */}
      <div className="pointer-events-none absolute right-[7%] top-[52px] z-[4] hidden lg:block">
        <svg width="160" height="150" viewBox="0 0 160 150">
          <path
            d="M10 57 C45 10,110 2,150 73"
            stroke="white"
            strokeWidth="2.5"
            strokeDasharray="6 7"
            fill="none"
          />

          <circle cx="10" cy="57" r="5.5" fill="white" />
          <circle cx="150" cy="73" r="5.5" fill="white" />

          <path
            d="M43 25 L60 49 L42 43 Z"
            fill="#111827"
          />
        </svg>
      </div>

      {/* =========================================================
          MAIN WRAPPER
      ========================================================= */}

      <div
        className="
          relative z-10 mx-auto
          min-h-[990px]
          w-full max-w-[1536px]
          px-[70px]
        "
      >
        {/* =======================================================
            LEFT CONTENT
        ======================================================= */}

        <div
          className="
            absolute left-[70px] top-[58px]
            z-30 w-[405px]
          "
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="
              inline-flex items-center gap-2
              rounded-full
              border border-[#dfe4ff]
              bg-[#f0f2ff]
              px-[15px] py-[8px]
              text-[12px] font-bold
              text-[#5148df]
              shadow-[0_2px_8px_rgba(80,70,220,.08)]
            "
          >
            <Globe size={15} />
            Web & Mobile Ready
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="
              relative mt-[32px]
              text-[62px]
              font-black
              leading-[1.08]
              tracking-[-2.8px]
              text-[#111827]
            "
          >
            One idea.
            <br />

            <span className="relative inline-block">
              Every screen.

              <svg
                className="
                  pointer-events-none absolute
                  -bottom-[8px] left-0
                  h-[15px] w-full
                "
                viewBox="0 0 420 15"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M3 7 Q100 13 205 7 T417 7"
                  fill="none"
                  stroke="#73dfc0"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray="420"
                  animate={{ strokeDashoffset: [420, 0, 420] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
              </svg>
            </span>

            {/* Star */}
            <motion.span
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="
                absolute
                right-[-52px]
                top-[17px]
                text-[#20c997]
              "
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="currentColor"
              >
                <path d="M20 0L24.2 15.8L40 20L24.2 24.2L20 40L15.8 24.2L0 20L15.8 15.8L20 0Z" />
              </svg>
            </motion.span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="
              mt-[34px]
              max-w-[395px]
              text-[16px]
              leading-[1.7]
              text-[#667085]
            "
          >
            Generate fully responsive websites and mobile
            interfaces from a single prompt. Perfect on every
            device, automatically.
          </motion.p>

          {/* Features */}
          <div className="mt-[44px] flex flex-col gap-[34px]">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.12,
                }}
                className="flex items-start gap-[20px]"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                  className={`
                    ${feature.bg}
                    ${feature.color}
                    flex h-[64px] w-[64px]
                    shrink-0 items-center justify-center
                    rounded-full
                    border border-white
                    shadow-[0_5px_16px_rgba(0,0,0,.05)]
                  `}
                >
                  {feature.icon}
                </motion.div>

                <div className="pt-[2px]">
                  <h4 className="text-[16px] font-extrabold text-[#111827]">
                    {feature.title}
                  </h4>

                  <p className="mt-[6px] max-w-[275px] text-[14px] leading-[1.65] text-[#667085]">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* =======================================================
            DESKTOP DASHBOARD
        ======================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="absolute z-10 left-[555px] top-[150px] h-[610px] w-[760px]"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-full overflow-hidden rounded-[27px] border border-[#edf0f5] bg-white shadow-[0_25px_65px_rgba(16,24,40,.12)]"
          >
          {/* Sidebar */}
          <div
            className="
              absolute left-0 top-0 bottom-0
              flex w-[58px]
              flex-col items-center
              border-r border-[#edf0f5]
              bg-[#f8fafc]
              pt-[22px]
            "
          >
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] bg-[#eef1ff] text-[#5952ee] shadow-sm">
              <Home size={19} />
            </motion.div>

            <div className="mt-[25px] text-[#9aa4b2]">
              <CheckSquare size={18} />
            </div>

            <div className="mt-[25px] text-[#9aa4b2]">
              <Calendar size={18} />
            </div>

            <div className="mt-[25px] text-[#9aa4b2]">
              <Users size={18} />
            </div>

            <div className="mt-auto mb-[23px] text-[#9aa4b2]">
              <Settings size={19} />
            </div>
          </div>

          {/* Dashboard Body */}
          <div className="absolute left-[58px] right-0 top-0 bottom-0 px-[40px] pt-[22px]">

            {/* Navbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[9px]">
                <div className="flex h-[31px] w-[31px] items-center justify-center rounded-[8px] bg-[#7657f5]">
                  <span className="text-[14px] font-bold text-white">
                    T
                  </span>
                </div>

                <span className="text-[16px] font-extrabold text-[#111827]">
                  Taskly
                </span>
              </div>

              <div className="flex items-center gap-[34px] text-[11px] font-bold text-[#667085]">
                <span>Product</span>
                <span>Features</span>
                <span>Pricing</span>
                <span>About</span>
              </div>

              <button className="rounded-[9px] bg-[#5148e9] px-[21px] py-[10px] text-[11px] font-bold text-white shadow-[0_6px_14px_rgba(81,72,233,.18)]">
                Get Started
              </button>
            </div>

            {/* Dashboard Content */}
            <div className="absolute left-[40px] right-[40px] top-[130px] bottom-[25px] flex gap-[27px]">

              {/* LEFT */}
              <div className="flex w-[43%] flex-col">

                <h3 className="text-[36px] font-black leading-[1.06] tracking-[-1.4px] text-[#111827]">
                  Work smarter,
                  <br />
                  <span className="text-[#5148e9]">
                    faster
                  </span>
                </h3>

                <p className="mt-[19px] max-w-[275px] text-[12px] leading-[1.7] text-[#667085]">
                  Taskly helps teams plan, collaborate, and get
                  things done.
                </p>

                <div className="mt-[29px] flex gap-[12px]">
                  <button className="rounded-[10px] bg-[#5148e9] px-[25px] py-[13px] text-[11px] font-bold text-white shadow-[0_10px_22px_rgba(81,72,233,.25)]">
                    Get Started
                    <br />
                    Free
                  </button>

                  <button className="flex items-center gap-[10px] rounded-[10px] border border-[#e4e7ec] bg-white px-[21px] py-[12px] text-[11px] font-bold text-[#344054]">
                    <Play size={13} fill="currentColor" />
                    <span>
                      Watch
                      <br />
                      Demo
                    </span>
                  </button>
                </div>

                {/* Team Activity */}
                <div className="mt-auto rounded-[17px] border border-[#edf0f4] bg-white p-[20px] shadow-[0_5px_18px_rgba(16,24,40,.035)]">
                  <div className="mb-[15px] text-[10px] font-bold text-[#111827]">
                    Team Activity
                  </div>

                  <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.1 }} className="flex items-center gap-[9px]">
                    <div className="h-[29px] w-[29px] overflow-hidden rounded-full bg-gray-100">
                      <Avatar seed="Sarah" />
                    </div>

                    <span className="flex-1 text-[9px] font-medium text-[#475467]">
                      Sarah completed 3 tasks
                    </span>

                    <span className="text-[8px] text-[#98a2b3]">
                      2h ago
                    </span>
                  </motion.div>

                  <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }} className="mt-[10px] flex items-center gap-[9px]">
                    <div className="h-[29px] w-[29px] overflow-hidden rounded-full bg-gray-100">
                      <Avatar seed="Mike" />
                    </div>

                    <span className="flex-1 text-[9px] font-medium text-[#475467]">
                      Mike updated project status
                    </span>

                    <span className="text-[8px] text-[#98a2b3]">
                      4h ago
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-1 flex-col gap-[18px]">

                {/* Stats */}
                <div className="flex gap-[17px]">
                  <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="flex-1 rounded-[17px] border border-[#edf0f4] bg-white p-[18px] shadow-[0_5px_18px_rgba(16,24,40,.04)]">
                    <div className="text-[8px] font-bold text-[#98a2b3]">
                      Total Projects
                    </div>

                    <div className="mt-[5px] text-[23px] font-black text-[#111827]">
                      24
                    </div>

                    <div className="mt-[3px] text-[8px] font-bold text-[#20c997]">
                      ↑ 42% this month
                    </div>
                  </motion.div>

                  <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="flex-1 rounded-[17px] border border-[#edf0f4] bg-white p-[18px] shadow-[0_5px_18px_rgba(16,24,40,.04)]">
                    <div className="text-[8px] font-bold text-[#98a2b3]">
                      Tasks Completed
                    </div>

                    <div className="mt-[5px] text-[23px] font-black text-[#111827]">
                      68%
                    </div>

                    <div className="mt-[3px] text-[8px] font-bold text-[#20c997]">
                      ↑ 8% this month
                    </div>
                  </motion.div>
                </div>

                {/* Chart */}
                <div className="h-[151px] rounded-[17px] border border-[#edf0f4] bg-white p-[19px] shadow-[0_5px_18px_rgba(16,24,40,.04)]">
                  <div className="mb-[7px] text-[10px] font-bold text-[#111827]">
                    Project Overview
                  </div>

                  <div className="h-[93px] w-full">
                    <Chart />
                  </div>
                </div>

                {/* Recent Tasks */}
                <div className="flex-1 rounded-[17px] border border-[#edf0f4] bg-white p-[19px] shadow-[0_5px_18px_rgba(16,24,40,.04)]">
                  <div className="mb-[13px] text-[10px] font-bold text-[#111827]">
                    Recent Tasks
                  </div>

                  <div className="space-y-[12px] text-[9px] text-[#475467]">
                    <motion.div animate={{ x: [0, 3, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0 }}>Design homepage</motion.div>
                    <motion.div animate={{ x: [0, 3, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}>API integration</motion.div>

                    <motion.div animate={{ x: [0, 3, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} className="text-[#98a2b3] line-through">
                      Team meeting
                    </motion.div>

                    <motion.div animate={{ x: [0, 3, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}>Fix breadcrumb issue</motion.div>
                  </div>

                  <div className="mt-[14px] flex items-center gap-1 text-[8px] font-bold text-[#5148e9]">
                    View all tasks
                    <ArrowRight size={9} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          </motion.div>
        </motion.div>

        {/* =======================================================
            PHONE
        ======================================================= */}

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.7,
            delay: 0.2,
          }}
          className="absolute z-30 left-[1190px] top-[250px] h-[620px] w-[255px]"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="h-full w-full overflow-hidden rounded-[39px] border-[8px] border-[#f8fafc] bg-white shadow-[0_25px_65px_rgba(16,24,40,.20)] ring-1 ring-[#e5e7eb]"
          >
          {/* Status */}
          <div className="flex items-center justify-between px-[27px] pt-[17px]">
            <span className="text-[10px] font-bold text-[#111827]">
              9:41
            </span>

            <div className="flex items-center gap-[4px]">
              <div className="h-[9px] w-[11px] rounded-[2px] bg-[#111827]" />
              <div className="h-[9px] w-[11px] rounded-[2px] bg-[#111827]" />
              <div className="h-[9px] w-[19px] rounded-[2px] bg-[#111827]" />
            </div>
          </div>

          {/* Navbar */}
          <div className="mt-[14px] flex items-center justify-between px-[24px]">
            <div className="flex items-center gap-[8px]">
              <div className="flex h-[27px] w-[27px] items-center justify-center rounded-[7px] bg-[#7657f5]">
                <span className="text-[12px] font-bold text-white">
                  T
                </span>
              </div>

              <span className="text-[15px] font-extrabold text-[#111827]">
                Taskly
              </span>
            </div>

            <Menu size={19} />
          </div>

          {/* Content */}
          <div className="px-[24px] pt-[30px]">
            <h3 className="text-[27px] font-black leading-[1.08] tracking-[-.8px] text-[#111827]">
              Work smarter,
              <br />
              <span className="text-[#5148e9]">
                faster
              </span>
            </h3>

            <p className="mt-[14px] text-[11px] leading-[1.65] text-[#667085]">
              Taskly helps teams plan, collaborate,
              <br />
              and get things done.
            </p>

            <motion.button animate={{ boxShadow: ["0 10px 20px rgba(81,72,233,0.25)", "0 10px 25px rgba(81,72,233,0.5)", "0 10px 20px rgba(81,72,233,0.25)"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="mt-[24px] w-full rounded-[11px] bg-[#5148e9] py-[14px] text-[12px] font-bold text-white">
              Get Started Free
            </motion.button>

            {/* Completed */}
            <div className="mt-[33px] flex items-center justify-between rounded-[17px] border border-[#edf0f4] bg-white p-[16px] shadow-[0_5px_18px_rgba(16,24,40,.04)]">
              <div>
                <div className="text-[8px] font-bold text-[#98a2b3]">
                  Tasks Completed
                </div>

                <div className="mt-[5px] text-[22px] font-black text-[#111827]">
                  68%
                </div>

                <div className="mt-[3px] text-[8px] font-bold text-[#20c997]">
                  ↑ 8% this month
                </div>
              </div>

              <div className="relative h-[57px] w-[57px]">
                <svg
                  viewBox="0 0 36 36"
                  className="-rotate-90"
                >
                  <path
                    d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                    fill="none"
                    stroke="#eef0f3"
                    strokeWidth="5"
                  />

                  <path
                    d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                    fill="none"
                    stroke="#20c997"
                    strokeWidth="5"
                    strokeDasharray="68,100"
                  />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-[11px] w-[11px] rounded-[3px] bg-[#f0f2f4]" />
                </div>
              </div>
            </div>

            {/* Mobile chart */}
            <div className="mt-[21px] rounded-[17px] border border-[#edf0f4] bg-white p-[16px] shadow-[0_5px_18px_rgba(16,24,40,.04)]">
              <div className="mb-[9px] text-[9px] font-bold text-[#111827]">
                Project Overview
              </div>

              <div className="h-[80px]">
                <Chart mobile />
              </div>
            </div>
          </div>

          {/* Bottom Nav */}
          <div className="absolute bottom-0 left-0 right-0 bg-white">
            <div className="border-t border-[#edf0f4] px-[22px] pt-[16px]">
              <div className="flex items-center justify-between">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0 }}><Home size={18} className="text-[#5148e9]" /></motion.div>
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}><CheckSquare size={18} className="text-[#98a2b3]" /></motion.div>

                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} className="relative -top-[8px] flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#5148e9] text-white shadow-[0_8px_18px_rgba(81,72,233,.35)]">
                  <Plus size={19} />
                </motion.div>

                <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}><Bell size={18} className="text-[#98a2b3]" /></motion.div>
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}><User size={18} className="text-[#98a2b3]" /></motion.div>
              </div>

              <div className="mx-auto mt-[8px] mb-[6px] h-[5px] w-[130px] rounded-full bg-[#e5e7eb]" />
            </div>
          </div>
          </motion.div>
        </motion.div>

        {/* =======================================================
            BOTTOM BANNER
        ======================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="
            absolute z-40
            left-[430px] top-[785px]
            flex h-[116px] w-[615px]
            items-center justify-between
            rounded-[24px]
            border border-[#edf0f4]
            bg-white
            px-[23px]
            shadow-[0_20px_50px_rgba(16,24,40,.07)]
          "
        >
          <div className="flex items-center gap-[17px]">
            <div className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-[17px] bg-[#554cf0] text-white shadow-[0_10px_22px_rgba(85,76,240,.22)]">
              <Monitor size={27} strokeWidth={1.7} />
            </div>

            <div>
              <h4 className="text-[15px] font-extrabold text-[#111827]">
                Designed for Web. Perfect for Mobile.
              </h4>

              <p className="mt-[5px] text-[12px] leading-[1.55] text-[#667085]">
                AI ensures every layout looks stunning
                <br />
                on every device.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-[23px] pr-[12px]">
            <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0 }} className="flex flex-col items-center gap-[6px]">
              <Monitor
                size={27}
                strokeWidth={1.4}
                className="text-[#667085]"
              />
              <span className="h-[6px] w-[6px] rounded-full bg-[#20c997]" />
            </motion.div>

            <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="flex flex-col items-center gap-[6px]">
              <svg
                width="24"
                height="28"
                viewBox="0 0 25 28"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                className="text-[#667085]"
              >
                <rect
                  x="3"
                  y="2"
                  width="19"
                  height="24"
                  rx="2"
                />
              </svg>
              <span className="h-[6px] w-[6px] rounded-full bg-[#20c997]" />
            </motion.div>

            <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} className="flex flex-col items-center gap-[6px]">
              <Smartphone
                size={24}
                strokeWidth={1.4}
                className="text-[#667085]"
              />
              <span className="h-[6px] w-[6px] rounded-full bg-[#20c997]" />
            </motion.div>
          </div>
        </motion.div>

        {/* =======================================================
            DOT DECORATION
        ======================================================= */}

        <div className="absolute left-[83px] top-[810px] z-0 hidden lg:block">
          <div
            className="
              h-[65px] w-[135px]
              rotate-[-15deg]
              opacity-60
              bg-[radial-gradient(#d6d9df_2.5px,transparent_2.5px)]
              [background-size:20px_20px]
            "
          />

          <div className="mt-[3px] flex gap-[9px] pl-[19px]">
            <span className="h-[12px] w-[12px] rounded-full bg-[#f87171]" />
            <span className="h-[12px] w-[12px] rounded-full bg-[#fbbf24]" />
            <span className="h-[12px] w-[12px] rounded-full bg-[#22c55e]" />
          </div>
        </div>
      </div>

      {/* =========================================================
          MOBILE
      ========================================================= */}

      <style>{`
        @media (max-width: 1200px) {
          section > div.relative.z-10 {
            transform: scale(0.9);
            transform-origin: top center;
          }
        }

        @media (max-width: 1024px) {
          section > div.relative.z-10 {
            transform: none;
            min-height: auto;
            padding: 70px 30px 100px;
          }

          section > div.relative.z-10 > div {
            position: relative;
            left: auto !important;
            right: auto !important;
            top: auto !important;
            bottom: auto !important;
            transform: none !important;
          }

          section > div.relative.z-10 > div:nth-child(4) {
            margin-top: 50px;
          }

          section > div.relative.z-10 > div:nth-child(5) {
            display: none;
          }

          section > div.relative.z-10 > div:nth-child(6) {
            margin: 40px auto 0;
            width: min(615px, 100%);
          }
        }

        @media (max-width: 640px) {
          section > div.relative.z-10 {
            padding: 45px 20px 60px;
          }

          section > div.relative.z-10 > div:first-child {
            width: 100%;
          }

          section h2 {
            font-size: 45px;
          }

          section > div.relative.z-10 > div:nth-child(4) {
            margin-top: 35px;
            width: 100%;
            height: auto;
          }

          section > div.relative.z-10 > div:nth-child(4) > div:first-child {
            display: none;
          }

          section > div.relative.z-10 > div:nth-child(6) {
            height: auto;
            padding: 18px;
          }

          section > div.relative.z-10 > div:nth-child(6) > div:last-child {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};

export default ResponsiveSection;
