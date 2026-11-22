import { useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Paper, ToggleButton, ToggleButtonGroup,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Tooltip as MuiTooltip,
} from '@mui/material';
import { ArrowUpward, ArrowDownward, TrendingUpOutlined } from '@mui/icons-material';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LabelList,
} from 'recharts';
import DashboardService from '../services/DashboardService';
import { DashboardResponse } from '../types';
import { colors } from '../theme';

const formatVnd = (amount: number) => amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const formatCompactVnd = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}tr`;
  if (value >= 1_000) return `${Math.round(value / 1000)}k`;
  return String(value);
};

const formatDay = (isoDay: string) => {
  const d = new Date(isoDay);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xử lý', color: colors.camel },
  processing: { label: 'Đang xử lý', color: colors.camel },
  paid: { label: 'Đã thanh toán', color: colors.jade },
  delivered: { label: 'Đã giao', color: colors.jade },
  payment_error: { label: 'Lỗi thanh toán', color: colors.danger },
  cancelled: { label: 'Đã hủy', color: colors.danger },
};

const statusMeta = (status: string) => STATUS_META[status] ?? { label: status, color: colors.muted };

interface StatTileProps {
  label: string;
  value: string;
  deltaPct?: number;
}

const StatTile = ({ label, value, deltaPct }: StatTileProps) => {
  const hasDelta = typeof deltaPct === 'number';
  const isUp = hasDelta && deltaPct! >= 0;
  const deltaColor = !hasDelta ? colors.muted : isUp ? colors.jadeBright : colors.danger;

  return (
    <Paper sx={{ p: 2.5, flex: '1 1 200px', minWidth: 200 }}>
      <Typography variant="body2" sx={{ color: colors.muted, mb: 1 }}>{label}</Typography>
      <Typography variant="h4" sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, mb: 0.5 }}>
        {value}
      </Typography>
      {hasDelta ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isUp ? <ArrowUpward sx={{ fontSize: 14, color: deltaColor }} /> : <ArrowDownward sx={{ fontSize: 14, color: deltaColor }} />}
          <Typography variant="caption" sx={{ color: deltaColor, fontWeight: 600 }}>
            {Math.abs(deltaPct!).toFixed(1)}%
          </Typography>
          <Typography variant="caption" sx={{ color: colors.muted }}>so với kỳ trước</Typography>
        </Box>
      ) : (
        <Typography variant="caption" sx={{ color: colors.muted }}>Chưa đủ dữ liệu kỳ trước</Typography>
      )}
    </Paper>
  );
};

const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  const revenue = payload[0]?.value ?? 0;
  const orderCount = payload[0]?.payload?.order_count ?? 0;
  return (
    <Box sx={{ bgcolor: colors.surfaceRaised, border: `1px solid ${colors.border}`, borderRadius: 1, p: 1.5 }}>
      <Typography variant="caption" sx={{ color: colors.muted, display: 'block', mb: 0.5 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: colors.ink }}>{formatVnd(revenue)}</Typography>
      <Typography variant="caption" sx={{ color: colors.muted }}>{orderCount} đơn hàng</Typography>
    </Box>
  );
};

const TopProductTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <Box sx={{ bgcolor: colors.surfaceRaised, border: `1px solid ${colors.border}`, borderRadius: 1, p: 1.5 }}>
      <Typography variant="body2" sx={{ fontWeight: 700, color: colors.ink, mb: 0.5 }}>{row.name}</Typography>
      <Typography variant="caption" sx={{ color: colors.muted, display: 'block' }}>Đã bán: {row.quantity_sold}</Typography>
      <Typography variant="caption" sx={{ color: colors.muted }}>Doanh thu: {formatVnd(row.revenue)}</Typography>
    </Box>
  );
};

const AdminDashboardPage = () => {
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await DashboardService.getDashboard(days);
        setData(response.data);
        setError(null);
      } catch (err) {
        setError('Không tải được dữ liệu thống kê.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [days]);

  const handleDaysChange = (_e: React.MouseEvent<HTMLElement>, newDays: number | null) => {
    if (newDays !== null) setDays(newDays);
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const summary = data?.summary;
  const totalStatusCount = data?.order_status_breakdown.reduce((sum, s) => sum + s.count, 0) ?? 0;

  return (
    <Box sx={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpOutlined sx={{ color: colors.jade }} /> Tổng quan
        </Typography>
        <ToggleButtonGroup value={days} exclusive onChange={handleDaysChange} size="small">
          <ToggleButton value={7}>7 ngày</ToggleButton>
          <ToggleButton value={30}>30 ngày</ToggleButton>
          <ToggleButton value={90}>90 ngày</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {!data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: colors.jade }} />
        </Box>
      ) : (
        <>
          {/* KPI row */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            <StatTile label="Doanh thu" value={formatVnd(summary!.total_revenue)} deltaPct={summary!.revenue_change_pct} />
            <StatTile label="Đơn hàng" value={summary!.total_orders.toLocaleString('vi-VN')} deltaPct={summary!.orders_change_pct} />
            <StatTile label="Giá trị đơn trung bình" value={formatVnd(summary!.avg_order_value)} />
            <StatTile label="Khách hàng" value={summary!.total_customers.toLocaleString('vi-VN')} />
          </Box>

          {/* Revenue trend */}
          <Paper sx={{ p: 2.5, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Doanh thu theo ngày</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.revenue_timeseries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.jade} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={colors.jade} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={colors.border} strokeDasharray="0" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickFormatter={formatDay}
                  tick={{ fill: colors.muted, fontSize: 12 }}
                  axisLine={{ stroke: colors.border }}
                  tickLine={false}
                  interval={days > 30 ? Math.ceil(days / 10) : 'preserveStartEnd'}
                />
                <YAxis
                  tickFormatter={formatCompactVnd}
                  tick={{ fill: colors.muted, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip content={<RevenueTooltip />} cursor={{ stroke: colors.border, strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={colors.jade}
                  strokeWidth={2}
                  fill="url(#revenueFill)"
                  dot={false}
                  activeDot={{ r: 4, fill: colors.jade, stroke: colors.surface, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
            {/* Top products */}
            <Paper sx={{ p: 2.5, flex: '2 1 400px', minWidth: 320 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Sản phẩm bán chạy</Typography>
              {data.top_products.length === 0 ? (
                <Typography sx={{ color: colors.muted }}>Chưa có dữ liệu bán hàng trong kỳ này.</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(180, data.top_products.length * 48)}>
                  <BarChart
                    data={data.top_products}
                    layout="vertical"
                    margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                    barCategoryGap={12}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={160}
                      tick={{ fill: colors.ink, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(name: string) => (name.length > 22 ? `${name.slice(0, 22)}…` : name)}
                    />
                    <Tooltip content={<TopProductTooltip />} cursor={{ fill: colors.surfaceRaised }} />
                    <Bar dataKey="quantity_sold" fill={colors.jade} radius={[0, 4, 4, 0]} maxBarSize={20}>
                      <LabelList dataKey="quantity_sold" position="right" fill={colors.ink} fontSize={12} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Paper>

            {/* Order status breakdown */}
            <Paper sx={{ p: 2.5, flex: '1 1 260px', minWidth: 260 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Trạng thái đơn hàng</Typography>
              {totalStatusCount === 0 ? (
                <Typography sx={{ color: colors.muted }}>Chưa có đơn hàng nào.</Typography>
              ) : (
                <>
                  <Box sx={{ display: 'flex', width: '100%', height: 8, borderRadius: 4, overflow: 'hidden', mb: 2, gap: '2px' }}>
                    {data.order_status_breakdown.map((s) => (
                      <Box
                        key={s.status}
                        sx={{ width: `${(s.count / totalStatusCount) * 100}%`, bgcolor: statusMeta(s.status).color }}
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {data.order_status_breakdown.map((s) => (
                      <Box key={s.status} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: statusMeta(s.status).color }} />
                          <Typography variant="body2">{statusMeta(s.status).label}</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontFamily: '"IBM Plex Mono", monospace', color: colors.muted }}>
                          {s.count}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </Paper>
          </Box>

          {/* Recent orders */}
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Đơn hàng gần đây</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Mã đơn</TableCell>
                    <TableCell>Khách hàng</TableCell>
                    <TableCell>Tổng tiền</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Thời gian</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.recent_orders.map((o) => {
                    const meta = statusMeta(o.status);
                    return (
                      <TableRow key={o.id}>
                        <TableCell>{o.order_code}</TableCell>
                        <TableCell>{o.username ?? '—'}</TableCell>
                        <TableCell sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>{formatVnd(o.total_amount)}</TableCell>
                        <TableCell>
                          <MuiTooltip title={o.status}>
                            <Chip
                              label={meta.label}
                              size="small"
                              sx={{ bgcolor: `${meta.color}22`, color: meta.color, fontWeight: 600 }}
                            />
                          </MuiTooltip>
                        </TableCell>
                        <TableCell>{new Date(o.created_at).toLocaleString('vi-VN')}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default AdminDashboardPage;
