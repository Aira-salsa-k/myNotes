import React, { useState } from "react";
import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
  Globe,
  Target,
  Send,
  Bug,
  MessageSquare,
} from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { GridPattern } from "./grid-pattern";
import { Notification } from "./notification";
import { cn } from "../../lib/utils";

export function Footer() {
  const year = new Date().getFullYear();
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const socialLinks = [
    {
      icon: <InstagramIcon size={18} />,
      link: "https://instagram.com",
      label: "Instagram",
    },
    {
      icon: <Globe size={18} />,
      link: "https://nadanta.dev",
      label: "Website",
    },
    {
      icon: <GithubIcon size={18} />,
      link: "https://github.com",
      label: "Github",
    },
  ];

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "feedback"), {
        content: feedback,
        timestamp: serverTimestamp(),
        deviceInfo: navigator.userAgent,
      });

      setFeedback("");
      setNotification({
        type: "success",
        message: "Terima kasih! Feedback Anda telah terkirim.",
      });
    } catch (error) {
      console.error("Error sending feedback:", error);
      setNotification({
        type: "error",
        message: "Maaf, terjadi kesalahan saat mengirim feedback.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="relative mt-20 border-t border-white/5 bg-[#0b0b0b]/80 backdrop-blur-md overflow-hidden">
      {/* Background patterns */}
      <GridPattern
        width={67}
        height={67}
        strokeDasharray={"2 2"}
        className={cn(
          "[mask-image:linear-gradient(to_bottom,transparent_0%,white_30%,white_70%,transparent_100%)]",
          "opacity-20",
        )}
      />

      {/* Watermark Background */}
      {/* <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[13vw] font-[900] text-white/[0.02] tracking-[-0.06em] uppercase leading-none">
        -----------------------------------------------------
        </span>
      </div> */}

      <div className="max-w-[1600px] mx-auto px-6 sm:px-6 xl:px-7 2xl:px-16 pt-10 pb-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand Section */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-lime-500/10 rounded-xl border border-lime-500/20">
                <Target className="text-lime-300" size={24} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-white text-lg font-bold tracking-tight">
                  GoalPlanner
                </span>
                <span className="text-lime-300 text-[10px] font-black uppercase opacity-70">
                  /nadanta dev
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Tetapkan tujuan tahunanmu. Pecah menjadi misi bulanan, target
              mingguan, dan aksi harian yang real.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-lime-300/10 hover:border-lime-300/30 hover:text-lime-300 transition-all duration-300"
                  aria-label={item.label}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Feedback Section */}
          <div className="md:col-start-7 md:col-span-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <Bug className="text-lime-300" size={20} />
                <h4 className="text-white font-bold text-lg">
                  Feedback & Bug Report
                </h4>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Ada bug atau saran fitur ?
              </p>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Bagikan pemikiran Anda untuk membantu kami menjadi lebih baik.
              </p>
              <form onSubmit={handleSendFeedback} className="flex gap-3">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500">
                    <MessageSquare size={16} />
                  </div>
                  <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tulis saran atau laporan bug di sini..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/20 transition-all"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-lime-300 text-black px-6 rounded-2xl font-bold text-sm hover:bg-white transition-all shadow-lg shadow-lime-300/10 flex items-center justify-center gap-2 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Send size={16} />
                      <span className="hidden sm:inline">Kirim</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
          <p className="text-gray-500 text-xs font-medium">
            © {year} <span className="text-neutral-400">GoalPlanner</span>. All
            rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-[10px] text-gray-600 italic">
              Take your Action.
            </span>
          </div>
        </div>
      </div>

      {notification && (
        <Notification {...notification} onClose={() => setNotification(null)} />
      )}
    </footer>
  );
}
