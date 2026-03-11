import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Key, Copy, Trash2, Globe, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'ki_';
  for (let i = 0; i < 40; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
  return key;
}

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export function ApiManagementTab() {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(["analytics", "revenue"]);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadKeys(); }, []);

  const loadKeys = async () => {
    const { data } = await supabase.from('api_keys').select('*').order('created_at', { ascending: false });
    if (data) setApiKeys(data as any);
  };

  const createKey = async () => {
    if (!newKeyName || !user) return;
    setCreating(true);
    try {
      const rawKey = generateApiKey();
      const keyHash = await hashKey(rawKey);
      
      const { error } = await supabase.from('api_keys').insert({
        name: newKeyName,
        key_hash: keyHash,
        key_prefix: rawKey.substring(0, 11),
        permissions: newKeyPermissions,
        created_by: user.id,
      });

      if (error) throw error;
      setGeneratedKey(rawKey);
      setNewKeyName("");
      loadKeys();
      toast.success("API key created");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCreating(false);
    }
  };

  const deleteKey = async (id: string) => {
    await supabase.from('api_keys').delete().eq('id', id);
    loadKeys();
    toast.success("API key deleted");
  };

  const toggleKey = async (id: string, isActive: boolean) => {
    await supabase.from('api_keys').update({ is_active: !isActive }).eq('id', id);
    loadKeys();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const baseUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/platform-api`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> API Keys</CardTitle>
          <CardDescription>Manage API keys for external dashboard access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Key Name</Label>
              <Input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="e.g., Financial Dashboard" />
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="flex flex-wrap gap-2">
                {['analytics', 'revenue', 'all'].map(p => (
                  <Badge 
                    key={p} 
                    variant={newKeyPermissions.includes(p) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setNewKeyPermissions(prev => 
                      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
                    )}
                  >
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
            <Button onClick={createKey} disabled={creating || !newKeyName} className="w-full gap-2">
              <Plus className="h-4 w-4" /> Create API Key
            </Button>
          </div>

          {generatedKey && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg space-y-2">
              <p className="text-sm font-medium text-green-600">New API Key (copy now — won't be shown again!):</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted p-2 rounded flex-1 break-all">{generatedKey}</code>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(generatedKey)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <ScrollArea className="h-64">
            <div className="space-y-2">
              {apiKeys.map(key => (
                <div key={key.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{key.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{key.key_prefix}...</p>
                    <div className="flex gap-1 mt-1">
                      {key.permissions.map(p => <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => toggleKey(key.id, key.is_active)}>
                      <Badge variant={key.is_active ? 'default' : 'destructive'}>{key.is_active ? 'Active' : 'Disabled'}</Badge>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteKey(key.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {apiKeys.length === 0 && <p className="text-center text-muted-foreground py-4">No API keys yet</p>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> API Documentation</CardTitle>
          <CardDescription>Endpoints for your financial dashboards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              { method: 'GET', path: '/overview', desc: 'Full platform overview (users + subscriptions + tickets + anti-cheat + revenue + content)' },
              { method: 'GET', path: '/users', desc: 'User analytics: total, active, retention, signups' },
              { method: 'GET', path: '/subscriptions', desc: 'Subscription data: tiers, expiring, recent subscribers' },
              { method: 'GET', path: '/tickets', desc: 'Support tickets: open, resolved, by priority/status' },
              { method: 'GET', path: '/anti-cheat', desc: 'Anti-cheat flags: severity, event types, flagged users' },
              { method: 'GET', path: '/revenue', desc: 'Revenue data: MRR, ARR, subscriptions, charges' },
              { method: 'GET', path: '/content', desc: 'Content metrics: lessons, exams, completions' },
            ].map((ep, i) => (
              <div key={i} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="font-mono text-xs">{ep.method}</Badge>
                  <code className="text-xs">{ep.path}</code>
                </div>
                <p className="text-xs text-muted-foreground">{ep.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <p className="text-sm font-medium">Example Request:</p>
            <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{`curl -H "x-api-key: ki_your_key_here" \\
  ${baseUrl}/overview`}
            </pre>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => copyToClipboard(`curl -H "x-api-key: ki_your_key_here" ${baseUrl}/overview`)}>
              <Copy className="h-3 w-3" /> Copy
            </Button>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm font-medium mb-2">Base URL:</p>
            <div className="flex items-center gap-2">
              <code className="text-xs break-all flex-1">{baseUrl}</code>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(baseUrl)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
