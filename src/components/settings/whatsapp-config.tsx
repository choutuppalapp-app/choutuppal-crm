'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SettingsPanelHead } from './settings-panel-head';

export function WhatsAppConfig() {
  const t = useTranslations('Settings.whatsapp');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/whatsapp/config');
        const data = await res.json();
        if (data.connected) {
          setConnected(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, []);

  async function handleConnect() {
    try {
      setSaving(true);
      const res = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConnected(true);
        toast.success('Connected');
      } else {
        toast.error('Failed to connect');
      }
    } catch (e) {
      toast.error('Error connecting');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="animate-in fade-in-50 duration-200">
        <SettingsPanelHead title={t("title")} description={t("description")} />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="animate-in fade-in-50 duration-200">
      <SettingsPanelHead title={t("title")} description={t("description")} />
      <div className="grid gap-6">
        <Alert className="bg-card border-border">
          <div className="flex items-center gap-2">
            {connected ? (
              <CheckCircle2 className="size-4 text-primary" />
            ) : (
              <Zap className="size-4 text-muted-foreground" />
            )}
            <AlertTitle className="text-foreground mb-0">
              {connected ? 'Connected' : 'Not Connected'}
            </AlertTitle>
          </div>
          <AlertDescription className="text-muted-foreground">
            {connected ? 'WhatsApp integration is connected.' : 'Click connect to link WhatsApp.'}
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>WhatsApp Connection</CardTitle>
            <CardDescription>Connect via Environment Variables</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleConnect}
              disabled={saving || connected}
              className="bg-primary text-primary-foreground"
            >
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {connected ? 'Connected' : 'Connect'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
