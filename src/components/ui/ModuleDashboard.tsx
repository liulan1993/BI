"use client";

import React, { useState, useEffect } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, X as XIcon, Loader2, GripVertical } from "lucide-react";
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
    // 修复：强制使用深色主题文本颜色
    <div className="flex-1 p-4 md:p-10">
      <h1 className="text-xl md:text-2xl font-bold text-neutral-200">{title}</h1>
      <div className="mt-4 text-neutral-300">
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
      // 修复：强制使用深色主题背景色
      className={cn(
        "flex items-center justify-between group/fav rounded-md w-full",
        activeTab === id
          ? "bg-neutral-700"
          : "hover:bg-neutral-700/50"
      )}
    >
      <button {...attributes} {...listeners} className="p-2 cursor-grab touch-none">
        <GripVertical className="h-4 w-4 text-neutral-400" />
      </button>
      <button onClick={() => setActiveTab(id)} className="flex-1 py-2 px-1 text-left">
        {/* 修复：强制使用深色主题文本颜色 */}
        <span className={cn(
          "text-sm",
          activeTab === id ? "font-semibold text-pink-400" : "text-neutral-200"
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
      // 修复：强制使用深色主题背景色
      <div className={cn(
        "flex items-center justify-between group/sidebar rounded-md w-full",
        "transition-colors duration-150",
        activeTab === item.label
          ? "bg-neutral-700"
          : "hover:bg-neutral-700/50"
      )}>
        <button
          onClick={() => onTabClick(item.label)}
          style={{ paddingLeft }}
          className="flex-1 py-2 text-left"
        >
          {/* 修复：强制使用深色主题文本颜色 */}
          <span className={cn("text-neutral-200 whitespace-pre", fontSize, fontWeight)}>
            {item.label}
          </span>
        </button>
        {level === 2 && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(item.label);
            }} 
            // 修复：强制使用深色主题背景色
            className="p-2 mr-1 rounded-full hover:bg-neutral-600/50"
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
        // 修复：强制使用深色主题背景色
        className="flex items-center justify-between group/sidebar py-2 rounded-md w-full text-left hover:bg-neutral-700/50"
      >
        {/* 修复：强制使用深色主题文本颜色 */}
        <span className={cn("text-neutral-200", fontSize, fontWeight)}>
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
    "心血管-代谢域", "血压与血管健康模块"
  ]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      setIsLoading(true);
      try {
        const sessionResponse = await fetch('/api/auth/session');
        
        if (sessionResponse.ok) {
          setIsLoggedIn(true);
          const profileResponse = await fetch('/api/user-profile');
          if (profileResponse.ok) {
            const data = await profileResponse.json();
            setFavorites(data.favorites || []);
          } else {
            console.error("Failed to fetch favorites");
            setFavorites([]);
          }
        } else {
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
    
    const handleAuthChange = () => checkAuthAndLoadData();
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
        window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

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

  // 修复：更新菜单数据结构
  const links: MenuItem[] = [
    {
      id: "心血管-代谢域",
      label: "心血管-代谢域",
      subLinks: [
        {
          id: "血压与血管健康模块",
          label: "血压与血管健康模块",
          subLinks: [
            { id: "脉压(PP)", label: "脉压(PP)" },
            { id: "平均动脉压(MAP)", label: "平均动脉压(MAP)" },
            { id: "踝臂指数(ABI)", label: "踝臂指数(ABI)" },
            { id: "心踝血管指数(CAVI)", label: "心踝血管指数(CAVI)" },
            { id: "肺动脉收缩压(PASP)", label: "肺动脉收缩压(PASP)" },
            { id: "心脏-动脉耦合效率(VAC)", label: "心脏-动脉耦合效率(VAC)" },
          ]
        },
        {
          id: "血脂与动脉粥样硬化模块",
          label: "血脂与动脉粥样硬化模块",
          subLinks: [
            { id: "血浆动脉粥样硬化指数(AIP)", label: "血浆动脉粥样硬化指数(AIP)" },
            { id: "非高密度脂蛋白胆固醇(Non-HDL-C)", label: "非高密度脂蛋白胆固醇(Non-HDL-C)" },
            { id: "残余胆固醇(RC)", label: "残余胆固醇(RC)" },
            { id: "载脂蛋白B/载脂蛋白A1比值", label: "载脂蛋白B/载脂蛋白A1比值" },
            { id: "非高密度脂蛋白胆固醇/载脂蛋白B比值", label: "非高密度脂蛋白胆固醇/载脂蛋白B比值" },
            { id: "低密度脂蛋白胆固醇/载脂蛋白B比值", label: "低密度脂蛋白胆固醇/载脂蛋白B比值" },
            { id: "动脉粥样硬化性血脂异常(AD)", label: "动脉粥样硬化性血脂异常(AD)" },
            { id: "极低密度脂蛋白胆固醇(VLDL-C)", label: "极低密度脂蛋白胆固醇(VLDL-C)" },
            { id: "脂蛋白相关磷脂酶A2(Lp-PLA2)", label: "脂蛋白相关磷脂酶A2(Lp-PLA2)" },
            { id: "冠状动脉粥样硬化总负荷评分(TABS)", label: "冠状动脉粥样硬化总负荷评分(TABS)" },
          ]
        },
        {
          id: "血糖与胰岛素抵抗模块",
          label: "血糖与胰岛素抵抗模块",
          subLinks: [
            { id: "稳态模型胰岛素抵抗指数(HOMA-IR)", label: "稳态模型胰岛素抵抗指数(HOMA-IR)" },
            { id: "甘油三酯葡萄糖指数(TyG)", label: "甘油三酯葡萄糖指数(TyG)" },
            { id: "糖毒性-脂毒性复合指数(GLCI)", label: "糖毒性-脂毒性复合指数(GLCI)" },
            { id: "糖化血清蛋白/糖化血红蛋白比值", label: "糖化血清蛋白/糖化血红蛋白比值" },
            { id: "胰岛素生成指数(IGI)", label: "胰岛素生成指数(IGI)" },
            { id: "压力性高血糖指数(SHR)", label: "压力性高血糖指数(SHR)" },
          ]
        },
        {
          id: "心脏功能与结构模块",
          label: "心脏功能与结构模块",
          subLinks: [
            { id: "校正QT间期(QTc)", label: "校正QT间期(QTc)" },
            { id: "左心室质量指数(LVMI)", label: "左心室质量指数(LVMI)" },
            { id: "相对室壁厚度(RWT)", label: "相对室壁厚度(RWT)" },
            { id: "E/e比值", label: "E/e比值" },
            { id: "每搏输出量指数(SVI)", label: "每搏输出量指数(SVI)" },
            { id: "心脏功率输出(CPO)", label: "心脏功率输出(CPO)" },
            { id: "肌酸激酶同工酶/肌酸激酶比值", label: "肌酸激酶同工酶/肌酸激酶比值" },
          ]
        },
        {
          id: "代谢综合征与脂肪分布模块",
          label: "代谢综合征与脂肪分布模块",
          subLinks: [
            { id: "腰高比(WHtR)", label: "腰高比(WHtR)" },
            { id: "骨骼肌质量指数(SMI)", label: "骨骼肌质量指数(SMI)" },
            { id: "代谢综合征评分(MSS)", label: "代谢综合征评分(MSS)" },
            { id: "内脏脂肪指数(VAI)", label: "内脏脂肪指数(VAI)" },
            { id: "脂质蓄积指数(LAP)", label: "脂质蓄积指数(LAP)" },
            { id: "心脏代谢指数(CMI)", label: "心脏代谢指数(CMI)" },
          ]
        },
      ],
    },
    {
      id: "炎症-免疫-营养域",
      label: "炎症-免疫-营养域",
      subLinks: [
        {
          id: "全身炎症状态模块",
          label: "全身炎症状态模块",
          subLinks: [
            { id: "中性粒细胞与淋巴细胞比值(NLR)", label: "中性粒细胞与淋巴细胞比值(NLR)" },
            { id: "血小板与淋巴细胞比值(PLR)", label: "血小板与淋巴细胞比值(PLR)" },
            { id: "全身免疫炎症指数(SII)", label: "全身免疫炎症指数(SII)" },
            { id: "单核细胞与高密度脂蛋白胆固醇比值(MHR)", label: "单核细胞与高密度脂蛋白胆固醇比值(MHR)" },
            { id: "全身炎症反应指数(SIRI)", label: "全身炎症反应指数(SIRI)" },
            { id: "淋巴细胞/C反应蛋白比值(LCR)", label: "淋巴细胞/C反应蛋白比值(LCR)" },
            { id: "淋巴细胞/单核细胞比值(LMR)", label: "淋巴细胞/单核细胞比值(LMR)" },
            { id: "蛋白/C反应蛋白比值(ACRP)", label: "蛋白/C反应蛋白比值(ACRP)" },
            { id: "铁蛋白/血沉比值(Ferritin/ESR)", label: "铁蛋白/血沉比值(Ferritin/ESR)" },
            { id: "乳酸脱氢酶/铁蛋白比值(LDH/Ferritin)", label: "乳酸脱氢酶/铁蛋白比值(LDH/Ferritin)" },
          ]
        },
        {
          id: "营养状态评估模块",
          label: "营养状态评估模块",
          subLinks: [
            { id: "预后营养指数(PNI)", label: "预后营养指数(PNI)" },
            { id: "格拉斯哥预后评分(GPS/mGPS)", label: "格拉斯哥预后评分(GPS/mGPS)" },
            { id: "红细胞分布宽度与白蛋白比值(RAR)", label: "红细胞分布宽度与白蛋白比值(RAR)" },
            { id: "HALP评分", label: "HALP评分" },
            { id: "血小板与白蛋白比值(PAR)", label: "血小板与白蛋白比值(PAR)" },
            { id: "纤维蛋白原/白蛋白比值(FAR)", label: "纤维蛋白原/白蛋白比值(FAR)" },
            { id: "控制营养状态评分(CONUT Score)", label: "控制营养状态评分(CONUT Score)" },
            { id: "白蛋白/球蛋白比值(A/G)", label: "白蛋白/球蛋白比值(A/G)" },
            { id: "球蛋白(Globulin)", label: "球蛋白(Globulin)" },
          ]
        },
        {
          id: "综合与特殊免疫模块",
          label: "综合与特殊免疫模块",
          subLinks: [
            { id: "慢性病贫血评分(ACD Score)", label: "慢性病贫血评分(ACD Score)" },
            { id: "过敏性炎症指数(AII)", label: "过敏性炎症指数(AII)" },
            { id: "营养-炎症-免疫综合指数(NII)", label: "营养-炎症-免疫综合指数(NII)" },
            { id: "自身免疫激活强度(AAI)", label: "自身免疫激活强度(AAI)" },
          ]
        },
      ]
    },
    {
      id: "多器官功能域",
      label: "多器官功能域",
      subLinks: [
        {
          id: "肝功能模块",
          label: "肝功能模块",
          subLinks: [
            { id: "DR比值(AST/ALT)", label: "DR比值(AST/ALT)" },
            { id: "FIB-4 纤维化指数", label: "FIB-4 纤维化指数" },
            { id: "NAFLD纤维化评分(NFS)", label: "NAFLD纤维化评分(NFS)" },
            { id: "AST与血小板比率指数(APRI)", label: "AST与血小板比率指数(APRI)" },
            { id: "脂肪肝指数(FLI)", label: "脂肪肝指数(FLI)" },
            { id: "肝脏硬度/脾脏硬度比值", label: "肝脏硬度/脾脏硬度比值" },
            { id: "胆红素/白蛋白比值(BAR)", label: "胆红素/白蛋白比值(BAR)" },
            { id: "间接胆红素/直接胆红素比值(IBIL/DBIL)", label: "间接胆红素/直接胆红素比值(IBIL/DBIL)" },
            { id: "间接胆红素(IBIL)", label: "间接胆红素(IBIL)" },
            { id: "肝脏脂肪变性指数(HSI)", label: "肝脏脂肪变性指数(HSI)" },
            { id: "肝脏脂肪输出指数(HLEI)", label: "肝脏脂肪输出指数(HLEI)" },
          ]
        },
        {
          id: "肾功能模块",
          label: "肾功能模块",
          subLinks: [
            { id: "尿素氮/肌酐比值", label: "尿素氮/肌酐比值" },
            { id: "胱抑素C/肌酐比值(CysC/Cr)", label: "胱抑素C/肌酐比值(CysC/Cr)" },
            { id: "尿白蛋白/肌酐比值(UACR)", label: "尿白蛋白/肌酐比值(UACR)" },
            { id: "肾衰指数(RFI)", label: "肾衰指数(RFI)" },
            { id: "钠排泄分数(FENa)", label: "钠排泄分数(FENa)" },
            { id: "经肾小管钾浓度梯度(TTKG)", label: "经肾小管钾浓度梯度(TTKG)" },
            { id: "血清尿酸/肌酐比值(SUACR)", label: "血清尿酸/肌酐比值(SUACR)" },
            { id: "估算肾小球滤过率(eGFR)", label: "估算肾小球滤过率(eGFR)" },
            { id: "尿酸清除率分数(FEUA)", label: "尿酸清除率分数(FEUA)" },
            { id: "肾脏浓缩储备指数(RCRI)", label: "肾脏浓缩储备指数(RCRI)" },
          ]
        },
        {
          id: "血液系统与电解质模块",
          label: "血液系统与电解质模块",
          subLinks: [
            { id: "Mentzer 指数", label: "Mentzer 指数" },
            { id: "血清阴离子间隙(AG)", label: "血清阴离子间隙(AG)" },
            { id: "红细胞分布宽度/血小板比值(RPR)", label: "红细胞分布宽度/血小板比值(RPR)" },
            { id: "平均血小板体积/血小板比值(MPV/P)", label: "平均血小板体积/血小板比值(MPV/P)" },
            { id: "Delta比值(DR)", label: "Delta比值(DR)" },
            { id: "校正钙(CC)", label: "校正钙(CC)" },
            { id: "钙磷乘积(C-PP)", label: "钙磷乘积(C-PP)" },
            { id: "D-二聚体/纤维蛋白原比值(DFR)", label: "D-二聚体/纤维蛋白原比值(DFR)" },
            { id: "全血粘度梯度(BVG)", label: "全血粘度梯度(BVG)" },
            { id: "红细胞聚集-纤维蛋白原指数(EAFI)", label: "红细胞聚集-纤维蛋白原指数(EAFI)" },
            { id: "凝血酶原时间国际标准化比值(INR)", label: "凝血酶原时间国际标准化比值(INR)" },
          ]
        },
        {
          id: "内分泌与生殖模块",
          label: "内分泌与生殖模块",
          subLinks: [
            { id: "游离/总前列腺特异性抗原比值(f/t PSA)", label: "游离/总前列腺特异性抗原比值(f/t PSA)" },
            { id: "甲状腺稳态指数(TSHI)", label: "甲状腺稳态指数(TSHI)" },
            { id: "促甲状腺激素/游离T3比值(TSH/FT3)", label: "促甲状腺激素/游离T3比值(TSH/FT3)" },
            { id: "甲状腺外周转化指数(TPCI)", label: "甲状腺外周转化指数(TPCI)" },
            { id: "游离雄激素指数(FAI)", label: "游离雄激素指数(FAI)" },
            { id: "卵巢恶性肿瘤风险算法(ROMA)", label: "卵巢恶性肿瘤风险算法(ROMA)" },
            { id: "卵巢储备指数(ORI)", label: "卵巢储备指数(ORI)" },
            { id: "男性生殖健康综合评分(MRHS)", label: "男性生殖健康综合评分(MRHS)" },
          ]
        },
        {
          id: "其他功能模块",
          label: "其他功能模块",
          subLinks: [
            { id: "胃蛋白酶原比值(PGI/PGII)", label: "胃蛋白酶原比值(PGI/PGII)" },
            { id: "转铁蛋白饱和度(TSAT)", label: "转铁蛋白饱和度(TSAT)" },
            { id: "胃泌素-17(Gastrin-17)", label: "胃泌素-17(Gastrin-17)" },
            { id: "骨转换标志物比值(BTR)", label: "骨转换标志物比值(BTR)" },
            { id: "肺泡-动脉氧分压差(A-a Gradient)", label: "肺泡-动脉氧分压差(A-a Gradient)" },
            { id: "视力不均衡指数(VAII)", label: "视力不均衡指数(VAII)" },
            { id: "眼压波动风险指数(OPFR)", label: "眼压波动风险指数(OPFR)" },
            { id: "高频听力陡降斜率(HFHLS)", label: "高频听力陡降斜率(HFHLS)" },
            { id: "神经反射衰减指数(NRAI)", label: "神经反射衰减指数(NRAI)" },
            { id: "躯干核心稳定指数(CSI)", label: "躯干核心稳定指数(CSI)" },
          ]
        },
      ]
    },
    {
      id: "整合医学与跨领域",
      label: "整合医学与跨领域",
      subLinks: [
        {
          id: "系统性风险评分与衰弱模块",
          label: "系统性风险评分与衰弱模块",
          subLinks: [
            { id: "实验室衰弱指数(FI-Lab)", label: "实验室衰弱指数(FI-Lab)" },
            { id: "CHA2DS2-VASc评分", label: "CHA2DS2-VASc评分" },
            { id: "芬兰糖尿病风险评分(FINDRISC)", label: "芬兰糖尿病风险评分(FINDRISC)" },
            { id: "SCORE2/SCORE2-OP评分", label: "SCORE2/SCORE2-OP评分" },
            { id: "肾脏疾病预后风险方程(KFRE)", label: "肾脏疾病预后风险方程(KFRE)" },
            { id: "PIRO评分", label: "PIRO评分" },
            { id: "序贯性器官衰竭评估(SOFA)评分", label: "序贯性器官衰竭评估(SOFA)评分" },
          ]
        },
        {
          id: "跨系统炎症与代谢模块",
          label: "跨系统炎症与代谢模块",
          subLinks: [
            { id: "脱氢表雄酮/皮质醇比值(DHEA-S/C)", label: "脱氢表雄酮/皮质醇比值(DHEA-S/C)" },
            { id: "肌酐/胱抑素C比值(Cr/CysC)", label: "肌酐/胱抑素C比值(Cr/CysC)" },
            { id: "颈动脉内中膜厚度/左室射血分数比值(IMT/LVEF)", label: "颈动脉内中膜厚度/左室射血分数比值(IMT/LVEF)" },
            { id: "碱性磷酸酶/白蛋白比值(ALP/A)", label: "碱性磷酸酶/白蛋白比值(ALP/A)" },
            { id: "高敏肌钙蛋白/C反应蛋白比值(hs-cTn/hs-CRP)", label: "高敏肌钙蛋白/C反应蛋白比值(hs-cTn/hs-CRP)" },
            { id: "综合心肾炎症指数(I-CRI-I)", label: "综合心肾炎症指数(I-CRI-I)" },
            { id: "全身炎症-牙周炎评分(SIPS)", label: "全身炎症-牙周炎评分(SIPS)" },
            { id: "骨骼-肌肉共病指数(OSI)", label: "骨骼-肌肉共病指数(OSI)" },
            { id: "微血管炎症评分(MVIS)", label: "微血管炎症评分(MVIS)" },
            { id: "铁利用-炎症指数(IUII)", label: "铁利用-炎症指数(IUII)" },
            { id: "内脏脂肪-炎症乘积(VFIP)", label: "内脏脂肪-炎症乘积(VFIP)" },
            { id: "尿酸/高密度脂蛋白胆固醇比值(UHR)", label: "尿酸/高密度脂蛋白胆固醇比值(UHR)" },
            { id: "蛋白尿/视网膜病变/动脉硬化综合征(PRAS)", label: "蛋白尿/视网膜病变/动脉硬化综合征(PRAS)" },
            { id: "雄激素-炎症指数(AII-2)", label: "雄激素-炎症指数(AII-2)" },
            { id: "胃肠-肝轴失调评分(GLADS)", label: "胃肠-肝轴失调评分(GLADS)" },
            { id: "免疫衰老指数(ISI)", label: "免疫衰老指数(ISI)" },
            { id: "血管僵硬-肾损伤指数(ASRDI)", label: "血管僵硬-肾损伤指数(ASRDI)" },
            { id: "代谢健康-心血管结构指数(MHCSI)", label: "代谢健康-心血管结构指数(MHCSI)" },
          ]
        },
        {
          id: "宏观整合模块",
          label: "宏观整合模块",
          subLinks: [
            { id: "生物年龄-年代年龄差(B-C_Age_Gap)", label: "生物年龄-年代年龄差(B-C_Age_Gap)" },
            { id: "多维稳态失调评分(MHDS)", label: "多维稳态失调评分(MHDS)" },
            { id: "综合健康风险五分位数(GHRQ)", label: "综合健康风险五分位数(GHRQ)" },
            { id: "全局生理储备指数(GPRI)", label: "全局生理储备指数(GPRI)" },
            { id: "口腔菌群失调指数(ODI)", label: "口腔菌群失调指数(ODI)" },
            { id: "牙周炎症负荷指数(PIBI)", label: "牙周炎症负荷指数(PIBI)" },
          ]
        },
      ]
    },
  ];

  return (
    // 修复：强制使用深色主题背景色和边框色
    <div
      className={cn(
        "relative rounded-md flex flex-row bg-neutral-800 mx-auto border border-neutral-700 overflow-hidden",
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
      {/* 修复：强制使用深色主题背景色 */}
      <div className="h-full px-2 py-4 flex flex-col bg-neutral-800 w-[300px] md:w-[350px] flex-shrink-0">
        
        {/* --- 重点关注区域 --- */}
        <div className="flex-shrink-0 min-h-[100px] max-h-[40%] overflow-y-auto">
          {/* 修复：强制使用深色主题文本颜色 */}
          <h2 className="text-lg font-semibold px-3 py-2 text-neutral-200">重点关注</h2>
          <div className="flex flex-col gap-1 p-1">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
              </div>
            ) : favorites.length > 0 && isLoggedIn ? (
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
        {/* 修复：强制使用深色主题边框色 */}
        <hr className="my-4 border-neutral-700" />

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
      {/* 修复：强制使用深色主题背景色 */}
      <div className="flex bg-neutral-900 w-[1280px]">
        <PageContent title={activeTab} />
      </div>
    </div>
  );
}
