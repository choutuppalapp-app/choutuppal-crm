'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SettingsPanelHead } from './settings-panel-head';

export function WhatsAppConfig() {
  const t = useTranslations('Settings.whatsapp');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connected, setConnected] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumberId: '',
    whatsappBusinessId: '',
    accessToken: '',
    verifyToken: ''
  });

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/whatsapp/config');
        const data = await res.json();
        if (data.connected) {
          setConnected(true);
          setFormData({
            phoneNumberId: data.phoneNumberId || '',
            whatsappBusinessId: data.whatsappBusinessId || '',
            accessToken: data.accessToken || '',
            verifyToken: data.verifyToken || ''
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, []);

  const [testing, setTesting] = useState(false);

  async function handleTestApi() {
    try {
      setTesting(true);
      const res = await fetch('/api/whatsapp/test');
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('API connection successful!');
      } else {
        toast.error(data.error || 'Failed to connect to Meta API');
      }
    } catch (e) {
      toast.error('Error connecting to API');
    } finally {
      setTesting(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConnected(true);
        toast.success('Configuration saved');
      } else {
        toast.error(data.error || 'Failed to save configuration');
      }
    } catch (e) {
      toast.error('Error saving configuration');
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
            {connected ? 'WhatsApp integration is configured.' : 'Enter your WhatsApp credentials.'}
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>WhatsApp Connection</CardTitle>
            <CardDescription>Configure your WhatsApp API credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                <Input
                  id="phoneNumberId"
                  value={formData.phoneNumberId}
                  onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })}
                  placeholder="e.g. 1319461771247406"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsappBusinessId">WhatsApp Business ID</Label>
                <Input
                  id="whatsappBusinessId"
                  value={formData.whatsappBusinessId}
                  onChange={(e) => setFormData({ ...formData, whatsappBusinessId: e.target.value })}
                  placeholder="e.g. 1729361504779547"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token</Label>
                <Input
                  id="accessToken"
                  type="password"
                  value={formData.accessToken}
                  onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                  placeholder="EAA..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="verifyToken">Verify Token</Label>
                <Input
                  id="verifyToken"
                  type="password"
                  value={formData.verifyToken}
                  onChange={(e) => setFormData({ ...formData, verifyToken: e.target.value })}
                  placeholder="Your custom verify token"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-primary-foreground"
                >
                  {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Save Configuration
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestApi}
                  disabled={testing || !connected}
                >
                  {testing && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Test API
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
