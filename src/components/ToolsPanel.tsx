import { useState, useEffect } from 'react';
import { Card, Button, Space, Alert, Select, Typography, Divider } from 'antd';
import { toolsAPI, marketAPI } from '../services/api';
import type { StockDTO } from '../types';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';

const { Text, Title } = Typography;

interface ToolsPanelProps {
  sessionId: string;
}

const ToolsPanel = ({ sessionId }: ToolsPanelProps) => {
  const [stocks, setStocks] = useState<StockDTO[]>([]);
  const [hintStockId, setHintStockId] = useState<string>('');
  const [loadingHint, setLoadingHint] = useState(false);
  const [loadingBoost, setLoadingBoost] = useState(false);
  const [hintMessage, setHintMessage] = useState<string>('');

  useEffect(() => {
    marketAPI.getAvailableStocks(sessionId).then(setStocks).catch(console.error);
  }, [sessionId]);

  const handleUseHint = async () => {
    if (!hintStockId) {
      toast.warning('Please select a stock first');
      return;
    }
    setLoadingHint(true);
    try {
      const response = await toolsAPI.useHint(sessionId, hintStockId);
      if (response.success) {
        setHintMessage(response.message);
        toast.success('Hint used successfully!');
      } else {
        toast.error(response.message || 'Failed to use hint');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message || 'Failed to use hint'
      );
    } finally {
      setLoadingHint(false);
    }
  };

  const handleUseTimeBoost = async () => {
    setLoadingBoost(true);
    try {
      const response = await toolsAPI.useTimeBoost(sessionId, 30);
      // Time boost success response has newDuration, error response has success: false
      if ('newDuration' in response && response.newDuration) {
        toast.success(`Time boost activated! Added ${response.secondsAdded} seconds`);
      } else if ('success' in response && !response.success) {
        toast.error(response.message || 'Failed to use time boost');
      } else {
        toast.success('Time boost activated!');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message || 'Failed to use time boost'
      );
    } finally {
      setLoadingBoost(false);
    }
  };

  return (
    <Card 
      title={<span style={{ fontSize: '18px', fontWeight: 'bold', color: '#e2e8f0' }}>🛠️ Tools</span>}
      className="h-full"
      style={{ 
        borderRadius: '12px',
        background: '#1a1f3a',
        border: '1px solid #2d3748'
      }}
      bodyStyle={{ padding: '20px' }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div style={{
          padding: '20px',
          background: '#2d3748',
          borderRadius: '8px',
          border: '1px solid #4a5568'
        }}>
          <Title level={5} style={{ margin: 0, color: '#fc8181', marginBottom: '12px' }}>
            💡 Hint Tool
          </Title>
          <Text style={{ fontSize: '12px', display: 'block', marginBottom: '16px', color: '#a0aec0' }}>
            Get a hint about a stock's heart count
          </Text>
          <Space style={{ width: '100%' }} direction="vertical" size="small">
            <Select
              placeholder="Select Stock"
              value={hintStockId}
              onChange={(value) => setHintStockId(value)}
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="children"
            >
              {stocks.map((stock) => (
                <Select.Option key={stock.id} value={stock.id}>
                  {stock.symbol} - {stock.companyName}
                </Select.Option>
              ))}
            </Select>
            <Button 
              onClick={handleUseHint} 
              loading={loadingHint} 
              block
              size="large"
              style={{
                background: '#f56565',
                border: 'none',
                fontWeight: 'bold',
                color: 'white',
                height: '44px'
              }}
            >
              💡 Use Hint
            </Button>
          </Space>
          {hintMessage && (
            <Alert
              message={hintMessage}
              type="info"
              style={{ marginTop: '16px' }}
              onClose={() => setHintMessage('')}
              closable
            />
          )}
        </div>

        <Divider style={{ borderColor: '#4a5568', margin: '16px 0' }} />

        <div style={{
          padding: '20px',
          background: '#2d3748',
          borderRadius: '8px',
          border: '1px solid #4a5568'
        }}>
          <Title level={5} style={{ margin: 0, color: '#63b3ed', marginBottom: '12px' }}>
            ⚡ Time Boost
          </Title>
          <Text style={{ fontSize: '12px', display: 'block', marginBottom: '16px', color: '#a0aec0' }}>
            Add 30 seconds to the round timer
          </Text>
          <Button 
            onClick={handleUseTimeBoost} 
            loading={loadingBoost} 
            block
            size="large"
            style={{
              background: '#4299e1',
              border: 'none',
              fontWeight: 'bold',
              color: 'white',
              height: '44px'
            }}
          >
            ⚡ Add 30 Seconds
          </Button>
        </div>
      </Space>
    </Card>
  );
};

export default ToolsPanel;

