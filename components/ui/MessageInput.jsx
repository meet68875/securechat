// src/components/MessageInput.jsx
'use client';

import { useState } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';

export default function MessageInput({ onSend }) {
  const [text, setText] = useState('');

  const send = () => {
    if (text.trim()) {
      console.log("text", text);
      onSend(text);
      setText('');
    }
  };

  return (
    <div className="border-t border-surface-200 bg-surface-0 p-4">
      <div className="flex gap-3 max-w-5xl mx-auto items-end">
        <InputTextarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message... (Shift + Enter for new line)"
          autoResize
          rows={1}
          className="flex-1 p-inputtext-lg !shadow-none ring-1 ring-surface-300 focus:ring-primary-500 transition-shadow duration-200"
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
        />
        <Button
          icon="pi pi-send"
          tooltip="Send message (Enter)"
          onClick={send}
          disabled={!text.trim()}
          // Use p-button-primary for a strong visual send cue
          className="p-button-rounded p-button-primary p-button-lg shadow-md" 
        />
      </div>
    </div>
  );
}