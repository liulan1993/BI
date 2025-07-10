"use client";

import React, { useState, useEffect } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, X as XIcon, Loader2 } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Session, AuthChangeEvent } from "@supabase/supabase-js";

// --- 辅助函数 (来自 @/lib/utils) ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- 类型定义 (递归结构) ---
interface MenuItem {
  label: string;
  subLinks?: MenuItem[];
}

// --- 页面内容占位符组件 ---
const PageContent = ({ title }: { title: string }) => {
  return (
    <div className="flex-1 p-4 md:p-10">
      <h1 className="text-xl md:text-2xl font-bold text-neutral-800 dark:text-neutral-200">{title}</h1>
      <div className="mt-4 text-neutral-700 dark:text-neutral-300">
        <p>这是 {title} 页面的内容。您可以在此基础上构建具体的功能。</p>
      </div>
    </div>
  );
};

// --- 递归菜单项组件 ---
const RecursiveMenuBlock = ({
  item,
  level = 0,
  activeTab,
  onTabClick,
  openMenus,
  onMenuToggle,
  favorites,
  onFavoriteToggle,
}: {
  item: MenuItem;
  level?: number;
  activeTab: string;
  onTabClick: (label: string) => void;
  openMenus: string[];
  onMenuToggle: (label: string) => void;
  favorites: string[];
  onFavoriteToggle: (label: string) => void;
}) => {
  const hasSubLinks = !!item.subLinks && item.subLinks.length > 0;
  const isOpen = openMenus.includes(item.label);

  const paddingLeft = `${12 + level * 16}px`;
  const fontSize = level === 0 ? 'text-lg' : level === 1 ? 'text-base' : 'text-sm';
  const fontWeight = hasSubLinks ? 'font-semibold' : (activeTab === item.label ? 'font-semibold' : 'font-normal');
  const isFavorited = favorites.includes(item.label);

  if (!hasSubLinks) {
    return (
      <div className={cn(
        "flex items-center justify-between group/sidebar rounded-md w-full",
        "transition-colors duration-150",
        activeTab === item.label
          ? "bg-neutral-200 dark:bg-neutral-700"
          : "hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50"
      )}>
        <button
          onClick={() => onTabClick(item.label)}
          style={{ paddingLeft }}
          className="flex-1 py-2 text-left"
        >
          <span className={cn("text-neutral-700 dark:text-neutral-200 whitespace-pre", fontSize, fontWeight)}>
            {item.label}
          </span>
        </button>
        {level === 2 && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(item.label);
            }} 
            className="p-2 mr-1 rounded-full hover:bg-neutral-300/50 dark:hover:bg-neutral-600/50"
          >
            <Heart 
              className={cn(
                "h-4 w-4", 
                isFavorited ? "text-pink-500 fill-current" : "text-neutral-500"
              )} 
            />
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => onMenuToggle(item.label)}
        style={{ paddingLeft }}
        className="flex items-center justify-between group/sidebar py-2 rounded-md w-full text-left hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50"
      >
        <span className={cn("text-neutral-700 dark:text-neutral-200", fontSize, fontWeight)}>
          {item.label}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 mr-2 text-neutral-500 transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-1 pt-1">
              {item.subLinks?.map((subLink) => (
                <RecursiveMenuBlock
                  key={subLink.label}
                  item={subLink}
                  level={level + 1}
                  activeTab={activeTab}
                  onTabClick={onTabClick}
                  openMenus={openMenus}
                  onMenuToggle={onMenuToggle}
                  favorites={favorites}
                  onFavoriteToggle={onFavoriteToggle}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// --- 主演示/导出组件 ---
export default function ModuleDashboard() {
  const supabase = createClientComponentClient();
  const [activeTab, setActiveTab] = useState("脉压(PP)");
  const [openMenus, setOpenMenus] = useState<string[]>([
    "心血管-代谢域", "血压与血管健康模块", "血脂与动脉粥样硬化模块",
    "炎症-免疫-营养域", "多器官功能域", "整合医学与跨领域"
  ]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. 使用 onAuthStateChange 作为唯一可信源来管理认证状态和加载数据
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoading(true);
      if (session) {
        setIsLoggedIn(true);
        try {
          const response = await fetch('/api/user-profile');
          if (response.ok) {
            const data = await response.json();
            setFavorites(data.favorites || []);
          } else {
            console.error("Failed to fetch favorites");
            setFavorites([]);
          }
        } catch (error) {
          console.error("Error fetching favorites:", error);
          setFavorites([]);
        }
      } else {
        setIsLoggedIn(false);
        setFavorites([]);
      }
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // 2. 当“重点关注”列表变化时，自动保存到数据库 (带防抖效果)
  useEffect(() => {
    if (!isLoggedIn || isLoading) return;

    const handler = setTimeout(() => {
      const saveFavorites = async () => {
        try {
          await fetch('/api/user-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favorites }),
          });
        } catch (error) {
          console.error("Failed to save favorites:", error);
        }
      };
      saveFavorites();
    }, 800);

    return () => {
      clearTimeout(handler);
    };
  }, [favorites, isLoggedIn, isLoading]);


  const handleMenuToggle = (label: string) => {
    setOpenMenus(prev => prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleFavoriteToggle = (label: string) => {
    if (!isLoggedIn) {
      showToast("请先登录以使用收藏功能。");
      return;
    }
    setFavorites(prev => prev.includes(label) ? prev.filter(f => f !== label) : [...prev, label]);
  };

  const links: MenuItem[] = [
    {
      label: "心血管-代谢域",
      subLinks: [
        {
          label: "血压与血管健康模块",
          subLinks: [
            { label: "脉压(PP)" }, { label: "平均动脉压(MAP)" }, { label: "踝臂指数(ABI)" },
            { label: "心踝血管指数(CAVI)" }, { label: "肺动脉收缩压(PASP)" }, { label: "心脏-动脉耦合效率(VAC)" },
          ]
        },
        {
          label: "血脂与动脉粥样硬化模块",
          subLinks: [
            { label: "血浆动脉粥样硬化指数(AIP)" }, { label: "非高密度脂蛋白胆固醇(Non-HDL-C)" },
            { label: "残余胆固醇(RC)" }, { label: "载脂蛋白B/载脂蛋白A1比值" },
            { label: "非高密度脂蛋白胆固醇/载脂蛋白B比值" }, { label: "低密度脂蛋白胆固醇/载脂蛋白B比值" },
            { label: "动脉粥样硬化性血脂异常(AD)" }, { label: "极低密度脂蛋白胆固醇(VLDL-C)" },
            { label: "脂蛋白相关磷脂酶A2(Lp-PLA2)" }, { label: "冠状动脉粥样硬化总负荷评分(TABS)" },
          ]
        },
        { label: "血糖与胰岛素抵抗模块" }, { label: "心脏功能与结构模块" }, { label: "代谢综合征与脂肪分布模块" },
      ],
    },
    {
      label: "炎症-免疫-营养域",
      subLinks: [
        { label: "全身炎症状态模块" }, { label: "营养状态评估模块" }, { label: "综合与特殊免疫模块" },
      ]
    },
    {
      label: "多器官功能域",
      subLinks: [
        { label: "肝功能模块" }, { label: "肾功能模块" }, { label: "血液系统与电解质模块" },
        { label: "内分泌与生殖模块" }, { label: "其他功能模块" },
      ]
    },
    {
      label: "整合医学与跨领域",
      subLinks: [
        { label: "系统性风险评分与衰弱模块" }, { label: "跨系统炎症与代谢模块" }, { label: "宏观整合模块" },
      ]
    },
  ];

  return (
    <div
      className={cn(
        "relative rounded-md flex flex-row bg-gray-100 dark:bg-neutral-800 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen"
      )}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-5 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg z-50"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Component */}
      <div className="h-full px-2 py-4 flex flex-col bg-neutral-100 dark:bg-neutral-800 w-[300px] md:w-[350px] flex-shrink-0">
        
        {/* --- 重点关注区域 --- */}
        <div className="flex-shrink-0 min-h-[100px] max-h-[40%] overflow-y-auto">
          <h2 className="text-lg font-semibold px-3 py-2 text-neutral-800 dark:text-neutral-200">重点关注</h2>
          <div className="flex flex-col gap-1 p-1">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
              </div>
            ) : favorites.length > 0 ? (
              favorites.map(fav => (
                <div key={fav} className={cn(
                  "flex items-center justify-between group/fav rounded-md w-full",
                  activeTab === fav
                    ? "bg-neutral-200 dark:bg-neutral-700"
                    : "hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50"
                )}>
                  <button onClick={() => setActiveTab(fav)} className="flex-1 py-2 px-3 text-left">
                    <span className={cn(
                      "text-sm",
                      activeTab === fav ? "font-semibold text-pink-600 dark:text-pink-400" : "text-neutral-700 dark:text-neutral-200"
                    )}>
                      {fav}
                    </span>
                  </button>
                  <button onClick={() => handleFavoriteToggle(fav)} className="p-2 rounded-full opacity-50 group-hover/fav:opacity-100">
                    <XIcon className="h-3 w-3 text-neutral-500" />
                  </button>
                </div>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-neutral-500">
                {isLoggedIn ? "点击三级菜单旁的爱心进行收藏" : "登录后可使用收藏功能"}
              </p>
            )}
          </div>
        </div>

        {/* --- 分割线 --- */}
        <hr className="my-4 border-neutral-200 dark:border-neutral-700" />

        {/* --- 所有模块区域 --- */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <RecursiveMenuBlock
                key={link.label}
                item={link}
                activeTab={activeTab}
                onTabClick={setActiveTab}
                openMenus={openMenus}
                onMenuToggle={handleMenuToggle}
                favorites={favorites}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Page Content */}
      <div className="flex bg-white dark:bg-neutral-900 w-[1280px]">
        <PageContent title={activeTab} />
      </div>
    </div>
  );
}
