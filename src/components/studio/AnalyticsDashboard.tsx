import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Monitor, 
  Smartphone, 
  Globe, 
  Calendar, 
  MapPin, 
  Clock,
  History,
  TrendingUp,
  Browser as BrowserIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { format, subDays, startOfDay, isWithinInterval } from 'date-fns';

interface Scan {
  id: string;
  code_id: string;
  device_type: string;
  browser: string;
  country: string;
  timestamp: string;
}

interface AnalyticsDashboardProps {
  code: {
    id: string;
    target_url: string;
    scan_count: number;
  };
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ code }) => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScans();
  }, [code.id]);

  const fetchScans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('code_id', code.id)
        .order('timestamp', { ascending: false })
        .limit(500);

      if (error) throw error;
      setScans(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Process data for charts
  const last30Days = Array.from({ length: 30 }).map((_, i) => {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'MMM dd');
    const count = scans.filter(s => {
      const scanDate = new Date(s.timestamp);
      return scanDate.toDateString() === date.toDateString();
    }).length;
    return { name: dateStr, scans: count };
  }).reverse();

  const devices = scans.reduce((acc: any, scan) => {
    acc[scan.device_type] = (acc[scan.device_type] || 0) + 1;
    return acc;
  }, {});

  const browsers = scans.reduce((acc: any, scan) => {
    acc[scan.browser] = (acc[scan.browser] || 0) + 1;
    return acc;
  }, {});

  const topBrowsers = Object.entries(browsers)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5);

  const countries = scans.reduce((acc: any, scan) => {
    acc[scan.country] = (acc[scan.country] || 0) + 1;
    return acc;
  }, {});

  const topCountries = Object.entries(countries)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics for {code.id}</h2>
          <p className="text-sm text-muted-foreground truncate max-w-md">{code.target_url}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-3xl font-bold">{code.scan_count}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Scans</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{scans.filter(s => isWithinInterval(new Date(s.timestamp), { start: subDays(new Date(), 7), end: new Date() })).length}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Last 7 Days</div>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <Card className="apple-card overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-6">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-bold uppercase tracking-wider">Scan Trends</CardTitle>
          </div>
          <CardDescription>Number of scans over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last30Days}>
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#888' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#888' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(0,0,0,0.05)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(10px)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="scans" 
                  stroke="#007AFF" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScans)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Device Breakdown */}
        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Monitor className="w-4 h-4" /> Device Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm font-bold">Desktop</div>
                  <div className="text-xs text-muted-foreground">{devices.Desktop || 0} scans</div>
                </div>
              </div>
              <div className="text-lg font-bold">{Math.round(((devices.Desktop || 0) / (scans.length || 1)) * 100)}%</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-sm font-bold">Mobile</div>
                  <div className="text-xs text-muted-foreground">{devices.Mobile || 0} scans</div>
                </div>
              </div>
              <div className="text-lg font-bold">{Math.round(((devices.Mobile || 0) / (scans.length || 1)) * 100)}%</div>
            </div>
            <div className="w-full bg-muted/30 h-2 rounded-full overflow-hidden flex">
              <div 
                className="bg-blue-500 h-full" 
                style={{ width: `${((devices.Desktop || 0) / (scans.length || 1)) * 100}%` }} 
              />
              <div 
                className="bg-purple-500 h-full" 
                style={{ width: `${((devices.Mobile || 0) / (scans.length || 1)) * 100}%` }} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Top Browsers */}
        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Globe className="w-4 h-4" /> Top Browsers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topBrowsers.map(([browser, count]: any) => (
                <div key={browser} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{browser}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{count}</span>
                    <div className="w-24 bg-muted/30 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full" 
                        style={{ width: `${(count / scans.length) * 100}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
              {topBrowsers.length === 0 && <p className="text-center text-xs text-muted-foreground py-4">No data yet</p>}
            </div>
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Top Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCountries.map(([country, count]: any) => (
                <div key={country} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{country}</span>
                  <Badge variant="secondary" className="rounded-full text-[10px]">{count}</Badge>
                </div>
              ))}
              {topCountries.length === 0 && <p className="text-center text-xs text-muted-foreground py-4">No data yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent History Table */}
      <Card className="apple-card overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-6">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <History className="w-4 h-4" /> Recent Scan History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[10px]">Time</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[10px]">Device</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[10px]">Browser</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-[10px]">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {scans.slice(0, 50).map(scan => (
                  <tr key={scan.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {format(new Date(scan.timestamp), 'MMM dd, HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {scan.device_type === 'Mobile' ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                        {scan.device_type}
                      </div>
                    </td>
                    <td className="px-6 py-4">{scan.browser}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-mono">{scan.country}</Badge>
                      </div>
                    </td>
                  </tr>
                ))}
                {scans.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No scan history recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
