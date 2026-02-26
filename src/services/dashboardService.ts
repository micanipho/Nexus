import api from './api';

export interface DashboardOverview {
  opportunities: {
    totalCount: number;
    activeCount: number;
    wonCount: number;
    lostCount: number;
    totalValue: number;
    wonValue: number;
    pipelineValue: number;
    winRate: number;
    averageDealSize: number;
    averageSalesCycle: number;
  };
  pipeline: {
    stages: Array<{
      stage: number;
      stageName: string;
      count: number;
      totalValue: number;
      averageProbability: number;
      conversionToNext: number;
    }>;
    conversionRate: number;
    weightedPipelineValue: number;
  };
  activities: {
    totalCount: number;
    upcomingCount: number;
    overdueCount: number;
    completedTodayCount: number;
    completedThisWeekCount: number;
    byType: Record<string, number>;
  };
  contracts: {
    totalActiveCount: number;
    expiringThisMonthCount: number;
    expiringThisQuarterCount: number;
    totalContractValue: number;
    averageContractValue: number;
  };
  revenue: {
    thisMonth: number;
    thisQuarter: number;
    thisYear: number;
    projectedThisMonth: number;
    projectedThisQuarter: number;
    projectedThisYear: number;
    monthlyTrend: Array<{
      year: number;
      month: number;
      monthName: string;
      actual: number;
      projected: number;
    }>;
  };
}

export interface SalesPerformance {
  topPerformers: Array<{
    userId: string;
    userName: string;
    wonDeals: number;
    revenue: number;
    winRate: number;
  }>;
  averageDealsPerUser: number;
  averageRevenuePerUser: number;
}

export interface ActivitiesSummary {
  totalCount: number;
  upcomingCount: number;
  overdueCount: number;
  completedTodayCount: number;
  byType: Record<string, number>;
}

export interface PipelineMetricsDetail {
  stages: Array<{
    stage: number;
    stageName: string;
    count: number;
    totalValue: number;
    averageProbability: number;
    conversionToNext: number;
  }>;
  conversionRate: number;
  weightedPipelineValue: number;
}

const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    const response = await api.get('/dashboard/overview');
    return response.data;
  },
  
  async getPipelineMetrics(): Promise<PipelineMetricsDetail> {
    const response = await api.get('/dashboard/pipeline-metrics');
    return response.data;
  },

  async getSalesPerformance(topCount: number = 5): Promise<SalesPerformance> {
    const response = await api.get('/dashboard/sales-performance', { params: { topCount } });
    return response.data;
  },

  async getActivitiesSummary(): Promise<ActivitiesSummary> {
    const response = await api.get('/dashboard/activities-summary');
    return response.data;
  },

  async getContractsExpiring(days: number = 30): Promise<any[]> {
    const response = await api.get('/dashboard/contracts-expiring', { params: { days } });
    return response.data;
  }
};

export default dashboardService;
