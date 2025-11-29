import { Modal, Statistic, Row, Col, Table, Tag, Space, Button } from 'antd';
import type { RoundResultDTO } from '../types';

interface RoundResultModalProps {
  result: RoundResultDTO;
  onClose: () => void;
}

const RoundResultModal = ({ result, onClose }: RoundResultModalProps) => {
  const getSectorColor = (sector: string) => {
    switch (sector) {
      case 'TECH': return '#3182ce';
      case 'MEDICAL': return '#38a169';
      case 'FINANCE': return '#d69e2e';
      default: return '#718096';
    }
  };

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
      render: (text: string) => <span style={{ color: '#cbd5e0' }}>{text}</span>,
    },
    {
      title: <span style={{ color: '#e2e8f0', fontWeight: '600' }}>Sector</span>,
      dataIndex: 'sector',
      key: 'sector',
      render: (sector: string) => (
        <Tag 
          color={getSectorColor(sector)} 
          style={{ 
            fontWeight: '600',
            border: 'none',
            color: '#fff'
          }}
        >
          {sector}
        </Tag>
      ),
    },
    {
      title: <span style={{ color: '#e2e8f0', fontWeight: '600' }}>True Price</span>,
      dataIndex: 'marketPrice',
      key: 'marketPrice',
      render: (value: number) => (
        <span style={{ color: '#48bb78', fontWeight: 'bold', fontSize: '14px' }}>
          ${value.toFixed(2)}
        </span>
      ),
    },
  ];

  return (
    <Modal
      title={
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#e2e8f0' }}>
          🎯 Round {result.roundNumber} Results
        </span>
      }
      open={true}
      onOk={onClose}
      onCancel={onClose}
      width={1200}
      centered
      style={{ maxHeight: '90vh', overflow: 'hidden' }}
      styles={{
        content: {
          background: '#1a1f3a',
          border: '1px solid #2d3748',
        },
        header: {
          background: '#1a1f3a',
          borderBottom: '1px solid #2d3748',
        },
        body: {
          background: '#1a1f3a',
          padding: '24px',
          maxHeight: 'calc(90vh - 110px)',
          overflowY: 'auto',
        },
        footer: {
          background: '#1a1f3a',
          borderTop: '1px solid #2d3748',
        },
      }}
      footer={[
        <Button 
          key="close" 
          type="primary" 
          onClick={onClose}
          size="large"
          style={{
            background: result.gameComplete ? '#48bb78' : '#4299e1',
            border: 'none',
            fontWeight: 'bold',
            height: '40px',
            padding: '0 32px',
          }}
        >
          {result.gameComplete ? 'Close' : 'Next Round →'}
        </Button>,
      ]}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <div style={{
            padding: '12px',
            background: '#2d3748',
            borderRadius: '8px',
            border: '1px solid #4a5568',
          }}>
            <Statistic
              title={<span style={{ color: '#a0aec0', fontWeight: '600', fontSize: '12px' }}>Starting Capital</span>}
              value={result.capitalAtStart}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#63b3ed', fontSize: '18px', fontWeight: 'bold' }}
            />
          </div>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <div style={{
            padding: '12px',
            background: '#2d3748',
            borderRadius: '8px',
            border: '1px solid #4a5568',
          }}>
            <Statistic
              title={<span style={{ color: '#a0aec0', fontWeight: '600', fontSize: '12px' }}>Ending Capital</span>}
              value={result.capitalAtEnd}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#63b3ed', fontSize: '18px', fontWeight: 'bold' }}
            />
          </div>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <div style={{
            padding: '12px',
            background: '#2d3748',
            borderRadius: '8px',
            border: '1px solid #4a5568',
          }}>
            <Statistic
              title={<span style={{ color: '#a0aec0', fontWeight: '600', fontSize: '12px' }}>Profit/Loss</span>}
              value={result.profitLoss}
              prefix="$"
              precision={2}
              valueStyle={{
                color: result.profitLoss >= 0 ? '#48bb78' : '#f56565',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            />
          </div>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <div style={{
            padding: '12px',
            background: '#2d3748',
            borderRadius: '8px',
            border: '1px solid #4a5568',
          }}>
            <Statistic
              title={<span style={{ color: '#a0aec0', fontWeight: '600', fontSize: '12px' }}>P/L %</span>}
              value={result.profitLossPercentage}
              precision={2}
              suffix="%"
              valueStyle={{
                color: result.profitLossPercentage >= 0 ? '#48bb78' : '#f56565',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            />
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {result.unlockedTools.length > 0 && (
          <Col xs={24} sm={12}>
            <div style={{
              padding: '12px',
              background: '#2d3748',
              borderRadius: '8px',
              border: '1px solid #4a5568',
              height: '100%',
            }}>
              <h4 style={{ color: '#e2e8f0', marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>
                🎁 Unlocked Tools:
              </h4>
              <Space wrap>
                {result.unlockedTools.map((tool, index) => (
                  <Tag 
                    key={index} 
                    color="#48bb78"
                    style={{
                      border: 'none',
                      color: '#fff',
                      fontWeight: '600',
                      padding: '4px 10px',
                      fontSize: '12px',
                    }}
                  >
                    {tool === 'HINT' ? '💡 Hint' : tool === 'TIME_BOOST' ? '⚡ Time Boost' : tool}
                  </Tag>
                ))}
              </Space>
            </div>
          </Col>
        )}
        
        <Col xs={24} sm={result.unlockedTools.length > 0 ? 12 : 24}>
          <div>
            <h4 style={{ 
              color: '#e2e8f0', 
              marginBottom: '12px', 
              fontSize: '14px', 
              fontWeight: '600' 
            }}>
              📊 Revealed Stocks:
            </h4>
            <Table
              dataSource={result.revealedStocks}
              columns={columns}
              rowKey="id"
              pagination={false}
              size="small"
              style={{
                background: '#1a1f3a',
              }}
              scroll={{ y: 300 }}
            />
          </div>
        </Col>
      </Row>

      {result.gameComplete && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: 'linear-gradient(135deg, #2d5016 0%, #22543d 100%)',
          borderRadius: '8px',
          border: '2px solid #48bb78',
          textAlign: 'center',
        }}>
          <h3 style={{
            color: '#48bb78',
            fontSize: '20px',
            fontWeight: 'bold',
            margin: 0,
          }}>
            🎉 Game Complete! 🎉
          </h3>
          <p style={{
            color: '#a0aec0',
            marginTop: '6px',
            marginBottom: 0,
            fontSize: '13px',
          }}>
            Congratulations on completing all 3 rounds!
          </p>
        </div>
      )}
    </Modal>
  );
};

export default RoundResultModal;

