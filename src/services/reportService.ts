import api from './api';

export interface SalesByPeriodFilters {
  startDate?: string;
  endDate?: string;
  groupBy?: 'month' | 'week';
}

export interface SalesByPeriodItem {
  period: string;
  actual: number;
  projected: number;
}

export interface OpportunityReportFilters {
  startDate?: string;
  endDate?: string;
  stage?: number;
  ownerId?: string;
}

export interface OpportunityReportSummary {
  totalOpportunities: number;
  totalValue: number;
  wonCount: number;
  winRate: number;
  byStage: Array<{
    stage: number;
    stageName: string;
    count: number;
    totalValue: number;
  }>;
}

const reportService = {
  async getSalesByPeriod(filters: SalesByPeriodFilters): Promise<SalesByPeriodItem[]> {
    const response = await api.get('/reports/sales-by-period', { params: filters });
    return response.data;
  },

  async getOpportunityReport(filters: OpportunityReportFilters): Promise<OpportunityReportSummary> {
    const response = await api.get('/reports/opportunities', { params: filters });
    return response.data;
  }
};

export default reportService;
