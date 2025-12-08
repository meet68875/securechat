// src/components/BackupExport.jsx
'use client';

import { useAppSelector } from '@/store/hooks';
import { Button } from 'primereact/button';

export default function BackupExport() {
  const messages = useAppSelector((state) => state.messages.list);

  const exportBackup = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      messages,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `securechat-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <Button
      label={`Export Backup (${messages.length} messages)`}
      icon="pi pi-download"
      onClick={exportBackup}
      tooltip="Download all messages as a JSON file"
      // Use p-button-success and p-button-sm for a smaller, standard utility button
      className="p-button-success p-button-sm" 
      disabled={messages.length === 0}
    />
  );
}