import { Card, Table, Statistic, Row, Col, Tag } from 'antd';
import type { PortfolioDTO } from '../types';

interface PortfolioPanelProps {
  portfolio: PortfolioDTO | null;
}

const PortfolioPanel = ({ portfolio }: PortfolioPanelProps) => {
  const columns = [
    {
      title: <span style={{ color: '#e2e8f0', fontWeight: '600' }}>Symbol</span>,
      dataIndex: 'symbol',
      key: 'symbol',
      render: (text: string) => (
        <span style={{ fontWeight: 'bold', color: '#63b3ed', fontSize: '14px' }}>{text}</span>
      ),
    },
    {
      title: <span style={{ color: '#e2e8f0', fontWeight: '600' }}>Company</span>,
      dataIndex: 'companyName',
      key: 'companyName',
      render: (text: string) => <span style={{ fontSize: '13px', color: '#cbd5e0' }}>{text}</span>,
    },
    {
      title: <span style={{ color: '#e2e8f0', fontWeight: '600' }}>Shares</span>,
      dataIndex: 'shares',
      key: 'shares',
      render: (value: number) => (
        <span style={{ fontWeight: '600', color: '#63b3ed' }}>{value}</span>
      ),
    },
    {
      title: <span style={{ color: '#e2e8f0', fontWeight: '600' }}>Avg Price</span>,
      dataIndex: 'averagePrice',
      key: 'averagePrice',
      render: (value: number) => (
        <span style={{ color: '#a0aec0' }}>${value.toFixed(2)}</span>
      ),
    },
    {
      title: <span style={{ color: '#e2e8f0', fontWeight: '600' }}>Current Price</span>,
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      render: (value: number) => (
        <span style={{ color: '#48bb78', fontWeight: 'bold' }}>${value.toFixed(2)}</span>
      ),
    },
    {
      title: <span style={{ color: '#e2e8f0', fontWeight: '600' }}>Total Value</span>,
      dataIndex: 'totalValue',
      key: 'totalValue',
      render: (value: number) => (
        <span style={{ color: '#63b3ed', fontWeight: 'bold' }}>${value.toFixed(2)}</span>
      ),
    },
    {
      title: <span style={{ color: '#e2e8f0', fontWeight: '600' }}>P/L</span>,
      dataIndex: 'profitLoss',
      key: 'profitLoss',
      render: (value: number) => (
        <Tag 
          color={value >= 0 ? '#48bb78' : '#f56565'} 
          style={{ 
            fontWeight: 'bold',
            border: 'none',
            color: '#fff'
          }}
        >
          {value >= 0 ? '+' : ''}${value.toFixed(2)}
        </Tag>
      ),
    },
    {
      title: <span style={{ color: '#e2e8f0', fontWeight: '600' }}>P/L %</span>,
      dataIndex: 'profitLossPercentage',
      key: 'profitLossPercentage',
      render: (value: number) => (
        <Tag 
          color={value >= 0 ? '#48bb78' : '#f56565'} 
          style={{ 
            fontWeight: 'bold',
            border: 'none',
            color: '#fff'
          }}
        >
          {value >= 0 ? '+' : ''}{value.toFixed(2)}%
        </Tag>
      ),
    },
  ];

  if (!portfolio) {
    return (
      <Card 
        title={<span style={{ fontSize: '18px', fontWeight: 'bold', color: '#e2e8f0' }}>💼 Portfolio</span>}
        className="h-full"
        style={{ 
          borderRadius: '12px',
          background: '#1a1f3a',
          border: '1px solid #2d3748'
        }}
        bodyStyle={{ padding: '20px' }}
      >
        <span style={{ color: '#a0aec0' }}>No portfolio data available</span>
      </Card>
    );
  }

  return (
    <Card 
      title={<span style={{ fontSize: '18px', fontWeight: 'bold', color: '#e2e8f0' }}>💼 Portfolio</span>}
      className="h-full"
      style={{ 
        borderRadius: '12px',
        background: '#1a1f3a',
        border: '1px solid #2d3748'
      }}
      bodyStyle={{ padding: '20px' }}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Statistic
            title={<span style={{ color: '#a0aec0', fontWeight: '600', fontSize: '13px' }}>Cash</span>}
            value={portfolio.cash}
            prefix="$"
            precision={2}
            valueStyle={{ color: '#63b3ed', fontSize: '22px', fontWeight: 'bold' }}
          />
        </Col>
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Statistic
            title={<span style={{ color: '#a0aec0', fontWeight: '600', fontSize: '13px' }}>Stock Value</span>}
            value={portfolio.totalStockValue}
            prefix="$"
            precision={2}
            valueStyle={{ color: '#48bb78', fontSize: '22px', fontWeight: 'bold' }}
          />
        </Col>
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Statistic
            title={<span style={{ color: '#a0aec0', fontWeight: '600', fontSize: '13px' }}>Total Value</span>}
            value={portfolio.totalPortfolioValue}
            prefix="$"
            precision={2}
            valueStyle={{ color: '#9f7aea', fontSize: '22px', fontWeight: 'bold' }}
          />
        </Col>
      </Row>
      <Table
        dataSource={portfolio.holdings}
        columns={columns}
        rowKey="stockId"
        pagination={false}
        size="small"
        style={{ background: '#1a1f3a' }}
      />
    </Card>
  );
};

export default PortfolioPanel;

