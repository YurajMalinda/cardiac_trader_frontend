import { useState, useEffect } from 'react';
import { Card, Button, Space, Alert, Select, Typography, Divider, Tag } from 'antd';
import { toolsAPI, marketAPI } from '../services/api';
import type { StockDTO } from '../types';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';

const { Text, Title } = Typography;

interface ToolsPanelProps {
  sessionId: string;
  onTimeBoost?: (secondsAdded: number) => void; // Callback to extend timer
}

const ToolsPanel = ({ sessionId, onTimeBoost }: ToolsPanelProps) => {
  const [stocks, setStocks] = useState<StockDTO[]>([]);
  const [hintStockId, setHintStockId] = useState<string>('');
  const [loadingHint, setLoadingHint] = useState(false);
  const [loadingBoost, setLoadingBoost] = useState(false);
  const [hintMessage, setHintMessage] = useState<string>('');
  const [hintAvailable, setHintAvailable] = useState<boolean>(false);
  const [timeBoostAvailable, setTimeBoostAvailable] = useState<boolean>(false);
  const [checkingAvailability, setCheckingAvailability] = useState(true);

  useEffect(() => {
    marketAPI.getAvailableStocks(sessionId).then(setStocks).catch(console.error);
  }, [sessionId]);

  // Check tool availability
  useEffect(() => {
    if (!sessionId) return;
    
    setCheckingAvailability(true);
    Promise.all([
      toolsAPI.checkToolAvailability(sessionId, 'HINT'),
      toolsAPI.checkToolAvailability(sessionId, 'TIME_BOOST')
    ])
      .then(([hintResponse, boostResponse]) => {
        setHintAvailable(hintResponse.available);
        setTimeBoostAvailable(boostResponse.available);
      })
      .catch((error) => {
        console.error('Failed to check tool availability:', error);
        setHintAvailable(false);
        setTimeBoostAvailable(false);
      })
      .finally(() => {
        setCheckingAvailability(false);
      });
  }, [sessionId]);

  const handleUseHint = async () => {
    if (!hintAvailable) {
      toast.warning('Hint tool is not available. Unlock it by achieving profit thresholds in a round.');
      return;
    }
    
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
        // Refresh availability (tool might be consumed)
        toolsAPI.checkToolAvailability(sessionId, 'HINT')
          .then((res) => setHintAvailable(res.available))
          .catch(console.error);
      } else {
        toast.error(response.message || 'Failed to use hint');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to use hint';
      toast.error(errorMessage);
      
      // If tool not available, update state
      if (errorMessage.includes('not available') || errorMessage.includes('not found')) {
        setHintAvailable(false);
      }
    } finally {
      setLoadingHint(false);
    }
  };

  const handleUseTimeBoost = async () => {
    if (!timeBoostAvailable) {
      toast.warning('Time Boost is not available. Unlock it by achieving profit thresholds in a round.');
      return;
    }
    
    setLoadingBoost(true);
    try {
      const response = await toolsAPI.useTimeBoost(sessionId, 30);
      // Time boost success response has newDuration, error response has success: false
      if ('newDuration' in response && response.newDuration) {
        const secondsAdded = response.secondsAdded || 30;
        toast.success(`Time boost activated! Added ${secondsAdded} seconds`);
        // Notify parent to extend the timer
        onTimeBoost?.(secondsAdded);
        // Refresh availability (tool might be consumed)
        toolsAPI.checkToolAvailability(sessionId, 'TIME_BOOST')
          .then((res) => setTimeBoostAvailable(res.available))
          .catch(console.error);
      } else if ('success' in response && !response.success) {
        toast.error(response.message || 'Failed to use time boost');
      } else {
        toast.success('Time boost activated!');
        onTimeBoost?.(30);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to use time boost';
      toast.error(errorMessage);
      
      // If tool not available, update state
      if (errorMessage.includes('not available') || errorMessage.includes('not found')) {
        setTimeBoostAvailable(false);
      }
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <Title level={5} style={{ margin: 0, color: '#fc8181' }}>
              💡 Hint Tool
            </Title>
            {checkingAvailability ? (
              <Tag color="default">Checking...</Tag>
            ) : hintAvailable ? (
              <Tag color="green">Available</Tag>
            ) : (
              <Tag color="red">Locked</Tag>
            )}
          </div>
          <Text style={{ fontSize: '12px', display: 'block', marginBottom: '16px', color: '#a0aec0' }}>
            {hintAvailable 
              ? "Get a hint about a stock's heart count"
              : "Unlock by achieving profit thresholds in a round"}
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
              loading={loadingHint || checkingAvailability} 
              disabled={!hintAvailable || checkingAvailability}
              block
              size="large"
              style={{
                background: hintAvailable ? '#f56565' : '#4a5568',
                border: 'none',
                fontWeight: 'bold',
                color: 'white',
                height: '44px',
                cursor: hintAvailable ? 'pointer' : 'not-allowed',
                opacity: hintAvailable ? 1 : 0.6
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <Title level={5} style={{ margin: 0, color: '#63b3ed' }}>
              ⚡ Time Boost
            </Title>
            {checkingAvailability ? (
              <Tag color="default">Checking...</Tag>
            ) : timeBoostAvailable ? (
              <Tag color="green">Available</Tag>
            ) : (
              <Tag color="red">Locked</Tag>
            )}
          </div>
          <Text style={{ fontSize: '12px', display: 'block', marginBottom: '16px', color: '#a0aec0' }}>
            {timeBoostAvailable 
              ? "Add 30 seconds to the round timer"
              : "Unlock by achieving profit thresholds in a round"}
          </Text>
          <Button 
            onClick={handleUseTimeBoost} 
            loading={loadingBoost || checkingAvailability} 
            disabled={!timeBoostAvailable || checkingAvailability}
            block
            size="large"
            style={{
              background: timeBoostAvailable ? '#4299e1' : '#4a5568',
              border: 'none',
              fontWeight: 'bold',
              color: 'white',
              height: '44px',
              cursor: timeBoostAvailable ? 'pointer' : 'not-allowed',
              opacity: timeBoostAvailable ? 1 : 0.6
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

