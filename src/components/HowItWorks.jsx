import React from "react";
import {
  Zap,
  Sparkles,
  Edit2,
  Upload,
  ChevronRight,
  Plus,
  Square,
  Mic,
  Globe,
  ChevronDown,
  MousePointer2,
  Users,
  Cloud,
} from "lucide-react";
import { motion } from "framer-motion";

/* =========================================================
   FIGMA LOGO
========================================================= */

const FigmaLogo = () => (
  <svg
    width="18"
    height="27"
    viewBox="0 0 38 57"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 28.5C19 33.7467 14.7467 38 9.5 38C4.25329 38 0 33.7467 0 28.5C0 23.2533 4.25329 19 9.5 19C14.7467 19 19 23.2533 19 28.5Z"
      fill="#1ABCFE"
    />
    <path
      d="M0 47.5C0 52.7467 4.25329 57 9.5 57C14.7467 57 19 52.7467 19 47.5V38H9.5C4.25329 38 0 42.2533 0 47.5Z"
      fill="#0ACF83"
    />
    <path
      d="M19 0H9.5C4.25329 0 0 4.25329 0 9.5C0 14.7467 4.25329 19 9.5 19H19V0Z"
      fill="#F24E1E"
    />
    <path
      d="M19 19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19V19Z"
      fill="#FF7262"
    />
    <path
      d="M38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5Z"
      fill="#A259FF"
    />
  </svg>
);

/* =========================================================
   DECORATIVE D LOGO
========================================================= */

const DLogo = () => (
  <motion.div 
    animate={{ y: [0, -5, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    className="flex items-center gap-[2px] opacity-[0.96]"
  >
    <div
      className="
        w-[42px]
        h-[80px]
        bg-gradient-to-br
        from-[#9D4EDD]
        to-[#B65CFF]
        rounded-l-[42px]
      "
    />

    <div
      className="
        w-[42px]
        h-[80px]
        bg-gradient-to-br
        from-[#32C98A]
        to-[#21C98A]
        rounded-r-[42px]
      "
    />
  </motion.div>
);

/* =========================================================
   TOP RIGHT TRAFFIC LIGHTS
========================================================= */

const TrafficLights = () => (
  <motion.div
    animate={{ y: [0, -5, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    className="
      absolute
      right-[58px]
      top-[39px]
      hidden
      lg:flex
      items-center
      gap-[9px]
      z-20
      pointer-events-none
    "
  >
    <span className="w-[15px] h-[15px] rounded-full bg-[#FF6B00]" />
    <span className="w-[15px] h-[15px] rounded-full bg-[#FFC107]" />
    <span className="w-[15px] h-[15px] rounded-full bg-[#20C997]" />
  </motion.div>
);

/* =========================================================
   TOP RIGHT DECORATION
========================================================= */

const TopRightDecoration = () => (
  <div
    className="
      absolute
      right-[9%]
      top-[110px]
      w-[230px]
      h-[180px]
      pointer-events-none
      hidden
      lg:block
    "
  >
    {/* dots */}

    <div
      className="
        absolute
        right-0
        top-0
        w-[108px]
        h-[96px]
        opacity-45
        bg-[radial-gradient(circle,#D7DCE8_1.6px,transparent_1.8px)]
        [background-size:14px_14px]
      "
    />

    {/* curve */}

    <svg
      className="absolute left-0 top-[32px] w-[190px] h-[125px]"
      viewBox="0 0 190 125"
      fill="none"
    >
      <motion.path
        d="M18 104 C18 65 46 43 87 43 C125 43 138 20 154 8"
        stroke="#1B2435"
        strokeWidth="2.2"
        strokeDasharray="4 4"
        animate={{ strokeDashoffset: [8, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
      />

      <circle
        cx="18"
        cy="104"
        r="4.5"
        fill="white"
        stroke="#8993A5"
        strokeWidth="2"
      />

      <circle
        cx="154"
        cy="8"
        r="4.5"
        fill="white"
        stroke="#8993A5"
        strokeWidth="2"
      />
    </svg>

    {/* cursor */}

    <motion.div
      animate={{ x: [0, -10, 10, 0], y: [0, -15, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute right-[1px] top-[2px]"
    >
      <MousePointer2
        size={28}
        className="text-[#172033]"
        fill="#172033"
        strokeWidth={1.8}
      />
    </motion.div>
  </div>
);

/* =========================================================
   CONNECTOR
========================================================= */

const Connector = ({ color = "#6366F1" }) => (
  <div
    className="
      hidden
      lg:block
      absolute
      top-[148px]
      left-full
      w-[92px]
      h-[64px]
      z-0
      pointer-events-none
    "
  >
    <svg
      className="absolute inset-0 w-full h-full overflow-visible"
      viewBox="0 0 92 64"
      fill="none"
    >
      <motion.path
        d="M0 58 C18 58 20 10 46 10 C70 10 73 58 92 58"
        stroke="#9EA5B4"
        strokeWidth="1.8"
        strokeDasharray="5 5"
        animate={{ strokeDashoffset: [10, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
    </svg>

    <div
      className="
        absolute
        left-1/2
        top-[1px]
        -translate-x-1/2
        w-[28px]
        h-[28px]
        rounded-full
        flex
        items-center
        justify-center
        text-white
        border-[4px]
        border-white
        shadow-[0_4px_10px_rgba(0,0,0,.08)]
      "
      style={{ backgroundColor: color }}
    >
      <ChevronRight size={13} strokeWidth={3} />
    </div>
  </div>
);

/* =========================================================
   STEP CARD
========================================================= */

const StepCard = ({
  number,
  title,
  desc,
  color,
  bg,
  icon,
  children,
  connector,
}) => (
  <div className="relative">
    {connector}

    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="
        relative
        z-10
        w-full
        h-[430px]
        bg-white
        rounded-[26px]
        border
        border-[#EDF0F5]
        shadow-[0_8px_30px_rgba(30,41,59,0.045)]
        px-[30px]
        pt-[40px]
        pb-[26px]
        flex
        flex-col
      "
    >
      {/* Floating icon */}

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className={`
          absolute
          -top-[25px]
          left-[40px]
          w-[55px]
          h-[55px]
          rounded-[15px]
          ${bg}
          text-white
          flex
          items-center
          justify-center
          shadow-[0_8px_16px_rgba(0,0,0,.12)]
        `}
      >
        <motion.div animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
          {icon}
        </motion.div>
      </motion.div>

      {/* Header */}

      <div className="text-center">
        <div
          className={`
            inline-flex
            items-center
            justify-center
            w-[43px]
            h-[43px]
            rounded-full
            ${color}
            bg-opacity-10
            font-bold
            text-[17px]
            mb-[14px]
          `}
        >
          {number}
        </div>

        <h3
          className="
            text-[17px]
            font-extrabold
            text-[#101828]
            leading-[1.2]
            mb-[12px]
          "
        >
          {title}
        </h3>

        <p
          className="
            text-[12px]
            leading-[1.7]
            text-[#667085]
            max-w-[235px]
            mx-auto
          "
        >
          {desc}
        </p>
      </div>

      {/* Visual */}

      <div className="mt-auto w-full flex justify-center">
        {children}
      </div>
    </motion.div>
  </div>
);

/* =========================================================
   STEP 1 — PROMPT
========================================================= */

const PromptVisual = () => (
  <div
    className="
      w-full
      h-[172px]
      rounded-[13px]
      bg-white
      border
      border-[#E8EBF0]
      shadow-[0_4px_12px_rgba(15,23,42,.05)]
      p-[15px]
      flex
      flex-col
    "
  >
    <p
      className="
        text-[12px]
        leading-[1.75]
        text-[#667085]
        text-left
        font-medium
        pr-2
      "
    >
      Build a modern SaaS landing page for a task management app
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className="
          inline-block
          ml-[2px]
          w-[1.5px]
          h-[12px]
          bg-[#98A2B3]
          align-middle
        "
      />
    </p>

    <div
      className="
        mt-auto
        flex
        items-center
        justify-between
        pt-[11px]
      "
    >
      <div className="flex items-center gap-[14px] text-[#98A2B3]">
        <Plus size={15} />
        <Square size={14} />
        <Globe size={15} />
      </div>

      <div
        className="
          flex
          items-center
          gap-[5px]
          text-[#5B5CF0]
          text-[11px]
          font-bold
        "
      >
        Glide
        <ChevronDown size={12} />
        <Mic size={14} className="ml-[4px]" />
      </div>
    </div>
  </div>
);

/* =========================================================
   STEP 2 — GENERATE
========================================================= */

const GenerateVisual = () => (
  <div
    className="
      w-full
      h-[170px]
      rounded-[13px]
      border
      border-[#EDF0F5]
      bg-[#FBFCFE]
      p-[12px]
      relative
      overflow-hidden
    "
  >
    {/* arrow */}

    <div
      className="
        absolute
        top-[8px]
        left-1/2
        -translate-x-1/2
        text-[#22C99A]
      "
    >
      <span className="text-[18px]">↓</span>
    </div>

    <div
      className="
        flex
        items-end
        gap-[7px]
        h-full
        pt-[24px]
      "
    >
      {/* Left layout */}

      <div
        className="
          w-[32%]
          h-[128px]
          rounded-[6px]
          bg-white
          border
          border-[#EDF0F5]
          p-[6px]
          opacity-55
        "
      >
        <div className="h-[31px] bg-[#F0F2F5] rounded-[4px] mb-[7px]" />
        <div className="h-[10px] bg-[#F0F2F5] rounded-[3px] mb-[7px]" />
        <div className="h-[48px] bg-[#F0F2F5] rounded-[4px] mt-auto" />
      </div>

      {/* Center selected layout */}

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="
          w-[38%]
          h-[145px]
          rounded-[7px]
          bg-white
          border-[2px]
          border-[#A9B5FF]
          p-[7px]
          shadow-[0_4px_12px_rgba(99,102,241,.08)]
        "
      >
        <div className="h-[24px] bg-[#F0F2F5] rounded-[3px] mb-[7px]" />

        <div className="h-[8px] bg-[#F0F2F5] rounded-[3px] mb-[7px]" />

        <div className="flex gap-[4px] mb-[7px]">
          <div className="flex-1 h-[17px] bg-[#F0F2F5] rounded-[3px]" />
          <div className="flex-1 h-[17px] bg-[#F0F2F5] rounded-[3px]" />
          <div className="flex-1 h-[17px] bg-[#F0F2F5] rounded-[3px]" />
        </div>

        <div className="h-[43px] bg-[#EEF2FF] border border-[#C7D2FE] rounded-[4px]" />
      </motion.div>

      {/* Right layout */}

      <div
        className="
          w-[32%]
          h-[128px]
          rounded-[6px]
          bg-white
          border
          border-[#EDF0F5]
          p-[6px]
          opacity-55
        "
      >
        <div className="h-[45px] bg-[#F0F2F5] rounded-[4px] mb-[7px]" />

        <div className="h-[10px] bg-[#F0F2F5] rounded-[3px] mb-[7px]" />

        <div className="flex gap-[4px]">
          <div className="flex-1 h-[27px] bg-[#F0F2F5] rounded-[3px]" />
          <div className="flex-1 h-[27px] bg-[#F0F2F5] rounded-[3px]" />
        </div>
      </div>
    </div>
  </div>
);

/* =========================================================
   STEP 3 — CUSTOMIZE
========================================================= */

const CustomizeVisual = () => (
  <div className="w-full">
    {/* Font */}

    <div
      className="
        h-[54px]
        bg-white
        border
        border-[#E8EBF0]
        rounded-[12px]
        px-[14px]
        flex
        items-center
        justify-between
        shadow-[0_3px_10px_rgba(15,23,42,.035)]
      "
    >
      <div className="flex items-center gap-[9px]">
        <span className="font-serif font-bold text-[16px] text-[#111827]">
          Aa
        </span>

        <span className="text-[12px] text-[#98A2B3]">
          Inter
        </span>
      </div>

      <ChevronDown size={14} className="text-[#98A2B3]" />
    </div>

    {/* Colors */}

    <div
      className="
        mt-[9px]
        h-[53px]
        bg-white
        border
        border-[#EDF0F5]
        rounded-[12px]
        px-[14px]
        flex
        items-center
        gap-[13px]
      "
    >
      <div className="w-[22px] h-[22px] rounded-[6px] bg-[#5B5CF0]" />

      <div className="w-[22px] h-[22px] rounded-[6px] bg-[#20C997]" />

      <div className="w-[22px] h-[22px] rounded-[6px] bg-[#FF9800]" />

      <div className="w-[22px] h-[22px] rounded-[6px] bg-black" />

      <div
        className="
          w-[22px]
          h-[22px]
          rounded-[6px]
          border
          border-dashed
          border-[#98A2B3]
          flex
          items-center
          justify-center
        "
      >
        <Plus size={11} className="text-[#667085]" />
      </div>
    </div>

    {/* Layout */}

    <div
      className="
        mt-[8px]
        h-[42px]
        bg-white
        border
        border-[#EDF0F5]
        rounded-[11px]
        flex
        items-center
        justify-around
      "
    >
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className={`
            w-[21px]
            h-[21px]
            rounded-[3px]
            border
            ${
              item === 3
                ? "border-[#667085] bg-[#F4F5F7]"
                : "border-[#D0D5DD]"
            }
          `}
        />
      ))}
    </div>

    {/* Slider */}

    <div className="relative mt-[10px] px-[2px]">
      <div className="h-[5px] bg-[#E7E8FA] rounded-full">
        <motion.div 
          animate={{ width: ["58%", "80%", "30%", "58%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="h-full bg-[#5B5CF0] rounded-full" 
        />
      </div>

      <motion.div
        animate={{ left: ["58%", "80%", "30%", "58%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="
          absolute
          top-1/2
          -translate-y-1/2
          -translate-x-1/2
          w-[14px]
          h-[14px]
          rounded-full
          bg-[#5B5CF0]
          border-[2px]
          border-white
          shadow-sm
        "
      />
    </div>
  </div>
);

/* =========================================================
   STEP 4 — EXPORT
========================================================= */

const ExportItem = ({ children, icon, delay = 0 }) => (
  <motion.div
    animate={{ y: [0, -3, 0] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay }}
    className="
      h-[51px]
      bg-white
      border
      border-[#E8EBF0]
      rounded-[10px]
      shadow-[0_3px_10px_rgba(15,23,42,.05)]
      px-[15px]
      flex
      items-center
      gap-[12px]
    "
  >
    <div className="w-[23px] flex items-center justify-center">
      {icon}
    </div>

    <span className="text-[12px] font-bold text-[#1D2939]">
      {children}
    </span>
  </motion.div>
);

const ExportVisual = () => (
  <div className="w-full flex flex-col gap-[9px]">
    <ExportItem icon={<FigmaLogo />} delay={0}>
      Figma
    </ExportItem>

    <ExportItem
      delay={0.4}
      icon={
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="3"
            stroke="currentColor"
            strokeWidth="2.2"
          />

          <path
            d="M19 12a7 7 0 0 0-14 0"
            stroke="currentColor"
            strokeWidth="2.2"
          />
        </svg>
      }
    >
      React
    </ExportItem>

    <ExportItem
      icon={
        <span className="text-[10px] font-black font-mono text-[#344054]">
          {"</>"}
        </span>
      }
    >
      HTML / CSS
    </ExportItem>
  </div>
);

/* =========================================================
   FEATURE
========================================================= */

const Feature = ({
  icon,
  iconClass = "",
  title,
  text,
}) => (
  <div className="flex items-start gap-[11px]">
    <div
      className={`
        mt-[1px]
        shrink-0
        ${iconClass}
      `}
    >
      {icon}
    </div>

    <div>
      <h4
        className="
          text-[11px]
          font-extrabold
          text-[#101828]
          mb-[4px]
          whitespace-nowrap
        "
      >
        {title}
      </h4>

      <p
        className="
          text-[10px]
          leading-[1.45]
          text-[#667085]
        "
      >
        {text}
      </p>
    </div>
  </div>
);

/* =========================================================
   BOTTOM BANNER
========================================================= */

const BottomBanner = () => (
  <div
    className="
      w-full
      min-h-[110px]
      rounded-[26px]
      border
      border-[#ECECF7]
      bg-gradient-to-r
      from-[#F8F5FF]
      via-[#FBFBFF]
      to-[#F3FBF9]
      px-[28px]
      py-[20px]
      flex
      items-center
      gap-[42px]
    "
  >
    {/* Intro */}

    <div
      className="
        flex
        items-center
        gap-[17px]
        min-w-[430px]
      "
    >
      <div
        className="
          w-[55px]
          h-[55px]
          rounded-[14px]
          bg-[#5B5CF0]
          text-white
          flex
          items-center
          justify-center
          shadow-[0_8px_18px_rgba(91,92,240,.2)]
        "
      >
        <Sparkles size={25} />
      </div>

      <div>
        <h3
          className="
            text-[15px]
            font-extrabold
            text-[#101828]
            mb-[5px]
          "
        >
          Built for speed. Designed for versatility.
        </h3>

        <p className="text-[11px] text-[#667085]">
          Go from idea to beautiful UI in seconds, not hours.
        </p>
      </div>
    </div>

    {/* Features */}

    <div
      className="
        flex-1
        grid
        grid-cols-4
        gap-[27px]
      "
    >
      <Feature
        icon={<Zap size={19} />}
        iconClass="text-[#20C997]"
        title="Lightning Fast"
        text={
          <>
            Generate in
            <br />
            seconds.
          </>
        }
      />

      <Feature
        icon={
          <div className="grid grid-cols-2 gap-[2px]">
            {[1, 2, 3, 4].map((x) => (
              <span
                key={x}
                className="
                  w-[7px]
                  h-[7px]
                  rounded-[2px]
                  bg-[#6366F1]
                "
              />
            ))}
          </div>
        }
        title="Production Ready"
        text={
          <>
            Clean, consistent
            <br />
            and ready to build.
          </>
        }
      />

      <Feature
        icon={<Users size={19} />}
        iconClass="text-[#FF8A00]"
        title="AI That Understands"
        text={
          <>
            Smarter prompts,
            <br />
            better results.
          </>
        }
      />

      <Feature
        icon={<Cloud size={19} />}
        iconClass="text-[#6366F1]"
        title="Loved by Designers"
        text={
          <>
            Trusted by 12,000+
            <br />
            designers & teams.
          </>
        }
      />
    </div>
  </div>
);

/* =========================================================
   MAIN SECTION
========================================================= */

const HowItWorks = () => {
  return (
    <section
      className="
        relative
        w-full
        overflow-hidden
        rounded-t-[28px]
        bg-[#FDFDFD]
        font-sans
        pt-[36px]
        pb-[34px]
      "
    >
      {/* =====================================================
          DECORATIONS
      ===================================================== */}

      {/* Left D */}

      <div
        className="
          absolute
          left-[2%]
          top-[180px]
          hidden
          lg:block
        "
      >
        <DLogo />
      </div>

      {/* Right decoration */}

      <TrafficLights />
      <TopRightDecoration />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div
        className="
          relative
          z-10
          max-w-[1384px]
          mx-auto
          px-5
          lg:px-0
        "
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="flex flex-col items-center text-center">
          {/* Badge */}

          <div
            className="
              inline-flex
              items-center
              gap-[7px]
              h-[36px]
              px-[17px]
              rounded-full
              bg-[#F1F2FF]
              border
              border-[#E8E8FF]
              text-[#5362EF]
              text-[12px]
              font-bold
              mb-[15px]
            "
          >
            <Zap
              size={14}
              fill="#5362EF"
            />

            How It Works
          </div>

          {/* Heading */}

          <h2
            className="
              text-[#111827]
              font-black
              tracking-[-2.5px]
              text-[54px]
              leading-[1.08]
              mb-[17px]
            "
          >
            From prompt to perfect design
            <br />
            in{" "}
            <span className="text-[#20C997]">
              4 simple steps.
            </span>
          </h2>

          {/* Subtitle */}

          <p
            className="
              text-[#667085]
              text-[17px]
              leading-[1.55]
              font-medium
            "
          >
            Our AI understands your idea and turns it into beautiful,
            <br />
            production-ready UI designs—automatically.
          </p>
        </div>

        {/* ===================================================
            STEPS
        =================================================== */}

        <div
          className="
            relative
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-4
            gap-[30px]
            lg:gap-[64px]
            mt-[82px]
          "
        >
          {/* =================================================
              STEP 1
          ================================================= */}

          <StepCard
            number="01"
            title="Describe Your Idea"
            desc="Type a prompt in plain language. Tell our AI what you want to build."
            color="text-[#6366F1]"
            bg="bg-[#6366F1]"
            icon={<Sparkles size={25} />}
            connector={<Connector color="#6366F1" />}
          >
            <PromptVisual />

            <div
              className="
                absolute
                -bottom-[1px]
                -left-[18px]
                text-[#6366F1]
              "
            >
              <Sparkles
                size={18}
                fill="#6366F1"
              />
            </div>
          </StepCard>

          {/* =================================================
              STEP 2
          ================================================= */}

          <StepCard
            number="02"
            title="AI Generates"
            desc="Our AI instantly creates multiple high-quality UI options for you."
            color="text-[#20C997]"
            bg="bg-[#20C997]"
            icon={<Sparkles size={25} />}
            connector={<Connector color="#20C997" />}
          >
            <GenerateVisual />

            <div
              className="
                absolute
                -bottom-[2px]
                right-[-4px]
                text-[#20C997]
              "
            >
              <Sparkles
                size={21}
                fill="#20C997"
              />
            </div>
          </StepCard>

          {/* =================================================
              STEP 3
          ================================================= */}

          <StepCard
            number="03"
            title="Customize & Refine"
            desc="Edit layouts, colors, fonts, and components exactly how you like."
            color="text-[#FF9800]"
            bg="bg-[#FF9800]"
            icon={<Edit2 size={23} />}
            connector={<Connector color="#FF9800" />}
          >
            <CustomizeVisual />

            <div
              className="
                absolute
                -bottom-[2px]
                right-[8px]
                text-[#FF9800]
              "
            >
              <Sparkles
                size={16}
                fill="#FF9800"
              />
            </div>
          </StepCard>

          {/* =================================================
              STEP 4
          ================================================= */}

          <StepCard
            number="04"
            title="Export & Ship"
            desc="Export clean assets or handoff to your dev team with ease."
            color="text-[#6366F1]"
            bg="bg-[#6366F1]"
            icon={<Upload size={23} />}
          >
            <ExportVisual />

            <div
              className="
                absolute
                -bottom-[3px]
                -right-[17px]
                w-[15px]
                h-[15px]
                rounded-full
                bg-[#6366F1]
              "
            />
          </StepCard>
        </div>

        {/* ===================================================
            BOTTOM BANNER
        =================================================== */}

        <div className="mt-[68px]">
          <BottomBanner />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;