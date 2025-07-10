"use client";

import React, { useState, useEffect } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, X as XIcon, Loader2, GripVertical } from "lucide-react";
// 删除了不再使用的 supabase 客户端导入
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// import type { Session } from "@supabase/supabase-js";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


// --- 辅助函数 (来自 @/lib/utils) ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- 类型定义 (递归结构) ---
interface MenuItem {
  id: string; // 使用 id 来确保唯一性
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

// --- 可排序的重点关注项 ---
function SortableFavoriteItem({ id, activeTab, setActiveTab, handleFavoriteToggle }: { id: string, activeTab: string, setActiveTab: (id: string) => void, handleFavoriteToggle: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between group/fav rounded-md w-full",
        activeTab === id
          ? "bg-neutral-200 dark:bg-neutral-700"
          : "hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50"
      )}
    >
      <button {...attributes} {...listeners} className="p-2 cursor-grab touch-none">
        <GripVertical className="h-4 w-4 text-neutral-400" />
      </button>
      <button onClick={() => setActiveTab(id)} className="flex-1 py-2 px-1 text-left">
        <span className={cn(
          "text-sm",
          activeTab === id ? "font-semibold text-pink-600 dark:text-pink-400" : "text-neutral-700 dark:text-neutral-200"
        )}>
          {id}
        </span>
      </button>
      <button onClick={() => handleFavoriteToggle(id)} className="p-2 rounded-full opacity-50 group-hover/fav:opacity-100">
        <XIcon className="h-3 w-3 text-neutral-500" />
      </button>
    </div>
  );
}


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
                  key={subLink.id}
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
  const [activeTab, setActiveTab] = useState("脉压(PP)");
  const [openMenus, setOpenMenus] = useState<string[]>([
    "心血管-代谢域", "血压与血管健康模块", "血脂与动脉粥样硬化模块",
    "炎症-免疫-营养域", "多器官功能域", "整合医学与跨领域"
  ]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  // 关键修改：替换认证逻辑
  // 1. 使用 effect 来检查会话并加载数据
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      setIsLoading(true);
      try {
        // 使用与 AppHeader 一致的会话检查端点
        const sessionResponse = await fetch('/api/auth/session');
        
        if (sessionResponse.ok) {
          setIsLoggedIn(true);
          // 登录成功，获取用户收藏列表
          const profileResponse = await fetch('/api/user-profile');
          if (profileResponse.ok) {
            const data = await profileResponse.json();
            setFavorites(data.favorites || []);
          } else {
            console.error("Failed to fetch favorites");
            setFavorites([]);
          }
        } else {
          // 未登录
          setIsLoggedIn(false);
          setFavorites([]);
        }
      } catch (error) {
        console.error("Error checking session or fetching profile:", error);
        setIsLoggedIn(false);
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthAndLoadData();
    
    // 监听 'auth-change' 事件，以便在登录/退出后刷新数据，无需重载页面
    const handleAuthChange = () => checkAuthAndLoadData();
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
        window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []); // 空依赖数组，仅在挂载时运行一次初始检查

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFavorites((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const links: MenuItem[] = [
    {
      id: "心血管-代谢域",
      label: "心血管-代谢域",
      subLinks: [
        {
          id: "血压与血管健康模块",
          label: "血压与血管健康模块",
          subLinks: [
            { id: "脉压(PP)", label: "脉压(PP)" }, { id: "平均动脉压(MAP)", label: "平均动脉压(MAP)" }, { id: "踝臂指数(ABI)", label: "踝臂指数(ABI)" },
            { id: "心踝血管指数(CAVI)", label: "心踝血管指数(CAVI)" }, { id: "肺动脉收缩压(PASP)", label: "肺动脉收缩压(PASP)" }, { id: "心脏-动脉耦合效率(VAC)", label: "心脏-动脉耦合效率(VAC)" },
          ]
        },
        {
          id: "血脂与动脉粥样硬化模块",
          label: "血脂与动脉粥样硬化模块",
          subLinks: [
            { id: "血浆动脉粥样硬化指数(AIP)", label: "血浆动脉粥样硬化指数(AIP)" }, { id: "非高密度脂蛋白胆固醇(Non-HDL-C)", label: "非高密度脂蛋白胆固醇(Non-HDL-C)" },
            { id: "残余胆固醇(RC)", label: "残余胆固醇(RC)" }, { id: "载脂蛋白B/载脂蛋白A1比值", label: "载脂蛋白B/载脂蛋白A1比值" },
            { id: "非高密度脂蛋白胆固醇/载脂蛋白B比值", label: "非高密度脂蛋白胆固醇/载脂蛋白B比值" }, { id: "低密度脂蛋白胆固醇/载脂蛋白B比值", label: "低密度脂蛋白胆固醇/载脂蛋白B比值" },
            { id: "动脉粥样硬化性血脂异常(AD)", label: "动脉粥样硬化性血脂异常(AD)" }, { id: "极低密度脂蛋白胆固醇(VLDL-C)", label: "极低密度脂蛋白胆固醇(VLDL-C)" },
            { id: "脂蛋白相关磷脂酶A2(Lp-PLA2)", label: "脂蛋白相关磷脂酶A2(Lp-PLA2)" }, { id: "冠状动脉粥样硬化总负荷评分(TABS)", label: "冠状动脉粥样硬化总负荷评分(TABS)" },
          ]
        },
        { id: "血糖与胰岛素抵抗模块", label: "血糖与胰岛素抵抗模块" }, { id: "心脏功能与结构模块", label: "心脏功能与结构模块" }, { id: "代谢综合征与脂肪分布模块", label: "代谢综合征与脂肪分布模块" },
      ],
    },
    {
      id: "炎症-免疫-营养域",
      label: "炎症-免疫-营养域",
      subLinks: [
        { id: "全身炎症状态模块", label: "全身炎症状态模块" }, { id: "营养状态评估模块", label: "营养状态评估模块" }, { id: "综合与特殊免疫模块", label: "综合与特殊免疫模块" },
      ]
    },
    {
      id: "多器官功能域",
      label: "多器官功能域",
      subLinks: [
        { id: "肝功能模块", label: "肝功能模块" }, { id: "肾功能模块", label: "肾功能模块" }, { id: "血液系统与电解质模块", label: "血液系统与电解质模块" },
        { id: "内分泌与生殖模块", label: "内分泌与生殖模块" }, { id: "其他功能模块", label: "其他功能模块" },
      ]
    },
    {
      id: "整合医学与跨领域",
      label: "整合医学与跨领域",
      subLinks: [
        { id: "系统性风险评分与衰弱模块", label: "系统性风险评分与衰弱模块" }, { id: "跨系统炎症与代谢模块", label: "跨系统炎症与代谢模块" }, { id: "宏观整合模块", label: "宏观整合模块" },
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
            ) : favorites.length > 0 && isLoggedIn ? ( // 增加 isLoggedIn 判断
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={favorites}
                  strategy={verticalListSortingStrategy}
                >
                  {favorites.map(fav => (
                    <SortableFavoriteItem 
                      key={fav} 
                      id={fav} 
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      handleFavoriteToggle={handleFavoriteToggle}
                    />
                  ))}
                </SortableContext>
              </DndContext>
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
                key={link.id}
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