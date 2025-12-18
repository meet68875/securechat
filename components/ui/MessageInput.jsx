'use client';

import { useState } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';

export default function MessageInput({ onSend }) {
  const [text, setText] = useState('');

  const send = () => {
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  return (
    <div className="border-t border-slate-100 bg-white p-4 lg:px-8">
      <div className="flex gap-3 max-w-5xl mx-auto items-end">
        <div className="flex-1 relative">
          <InputTextarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            autoResize
            rows={1}
            className="w-full py-3 px-4 pr-12 text-[15px] border border-slate-200 !rounded-2xl !shadow-none focus:border-indigo-500 ring-0 transition-all duration-200 ease-in-out bg-slate-50 focus:bg-white"
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
          />
        </div>

        {/* Send Button matched to "ME" Bubble colors */}
        <Button
          icon="pi pi-send"
          onClick={send}
          disabled={!text.trim()}
          className="p-button-rounded shadow-lg transform transition-transform active:scale-95"
          style={{ 
            backgroundColor: '#4F46E5', 
            border: 'none', 
            width: '48px', 
            height: '48px' 
          }}
        />
      </div>
    </div>
  );
}