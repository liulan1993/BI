"use client";

import React, { useState } from 'react';
import TabButton from './TabButton';

interface TabData {
    id: string;
    title: string;
    content: string;
}

interface InteractiveMenuProps {
    data: TabData[];
}

const InteractiveMenu: React.FC<InteractiveMenuProps> = ({ data }) => {
    const [activeTab, setActiveTab] = useState(data[0].id);
    const activeTabData = data.find(tab => tab.id === activeTab);

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 h-auto">
                {/* 左侧标签栏 */}
                <div className="lg:col-span-1 flex flex-col space-y-4 pr-2 h-[450px] self-start overflow-y-auto">
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

                {/* 右侧内容区 */}
                <div className="lg:col-span-2 rounded-2xl p-8 h-[450px] flex items-center justify-center">
                     <div className="text-center w-full h-full flex flex-col items-center justify-center">
                        <h2 className="text-2xl font-bold text-gray-100 mb-4">{activeTabData?.title}</h2>
                        <div className="w-full h-full flex-grow rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center">
                            <p className="text-gray-500">{activeTabData?.content}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InteractiveMenu;
