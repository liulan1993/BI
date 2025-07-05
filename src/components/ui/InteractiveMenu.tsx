"use client";

import React, { useState } from 'react';
import TabButton from './TabButton';

interface TabData {
    id: string;
    title: string;
    content: React.ReactNode; // 允许内容是组件
}

interface InteractiveMenuProps {
    data: TabData[];
}

const InteractiveMenu: React.FC<InteractiveMenuProps> = ({ data }) => {
    const [activeTab, setActiveTab] = useState(data[0].id);
    const activeTabData = data.find(tab => tab.id === activeTab);

    return (
        <div className="w-full h-full flex items-start justify-center">
            <div className="w-full max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
                {/* 左侧固定栏 */}
                <div className="lg:sticky lg:top-24 self-start">
                    {/* 为按钮列表设置最大高度和内部滚动 */}
                    <div className="flex flex-col space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
                        {data.map(tab => (
                            <TabButton
                                key={tab.id}
                                isActive={activeTab === tab.id}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.title}
                            </TabButton>
                        ))}
                    </div>
                </div>

                {/* 右侧内容区 */}
                <div className="min-w-0">
                    {typeof activeTabData?.content === 'string' ? (
                        <div className="w-full h-full rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center min-h-[400px]">
                            <p className="text-gray-500">{activeTabData.content}</p>
                        </div>
                    ) : (
                        activeTabData?.content
                    )}
                </div>
            </div>
        </div>
    );
};

export default InteractiveMenu;
