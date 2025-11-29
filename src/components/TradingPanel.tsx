import { useState, useEffect } from 'react';
import { Card, Form, InputNumber, Button, Space, Select, Typography, Tag, Alert } from 'antd';
import { tradingAPI, marketAPI } from '../services/api';
import type { StockDTO, TradeResponseDTO } from '../types';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';

const { Text, Title } = Typography;

interface TradingPanelProps {
  sessionId: string;
  onTrade?: () => void;
  selectedStock?: StockDTO | null;
}

const TradingPanel = ({ sessionId, onTrade, selectedStock }: TradingPanelProps) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [stocks, setStocks] = useState<StockDTO[]>([]);
  const [lastTradeResult, setLastTradeResult] = useState<TradeResponseDTO | null>(null);

  useEffect(() => {
    marketAPI.getAvailableStocks(sessionId).then(setStocks).catch(console.error);
  }, [sessionId]);

  useEffect(() => {
    if (selectedStock) {
      form.setFieldsValue({ stockId: selectedStock.id });
    }
  }, [selectedStock, form]);

  const handleBuy = async (values: { stockId: string; shares: number }) => {
    setLoading(true);
    setLastTradeResult(null);
    try {
      const stock = stocks.find(s => s.id === values.stockId);
      const response = await tradingAPI.buyStock(sessionId, {
        stockId: values.stockId,
        shares: values.shares,
      });
      
      setLastTradeResult(response);
      
      const stockSymbol = response.stockSymbol || stock?.symbol || 'Stock';
      toast.success(
        `✅ Purchased ${response.shares} share(s) of ${stockSymbol} at $${response.pricePerShare?.toFixed(2)} each`,
        { autoClose: 4000 }
      );
      
      // Refresh stocks list to update "Owned" column
      marketAPI.getAvailableStocks(sessionId).then(setStocks).catch(console.error);
      
      form.resetFields();
      onTrade?.();
      
      // Clear the notification after 5 seconds
      setTimeout(() => {
        setLastTradeResult(null);
      }, 5000);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message || 'Failed to buy stock'
      );
      setLastTradeResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async (values: { stockId: string; shares: number }) => {
    setLoading(true);
    setLastTradeResult(null);
    try {
      const stock = stocks.find(s => s.id === values.stockId);
      const response = await tradingAPI.sellStock(sessionId, {
        stockId: values.stockId,
        shares: values.shares,
      });
      
      setLastTradeResult(response);
      
      const stockSymbol = response.stockSymbol || stock?.symbol || 'Stock';
      toast.success(
        `✅ Sold ${response.shares} share(s) of ${stockSymbol} at $${response.pricePerShare?.toFixed(2)} each`,
        { autoClose: 4000 }
      );
      
      // Refresh stocks list to update "Owned" column
      marketAPI.getAvailableStocks(sessionId).then(setStocks).catch(console.error);
      
      form.resetFields();
      onTrade?.();
      
      // Clear the notification after 5 seconds
      setTimeout(() => {
        setLastTradeResult(null);
      }, 5000);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message || 'Failed to sell stock'
      );
      setLastTradeResult(null);
    } finally {
      setLoading(false);
    }
  };

  const selectedStockInfo = selectedStock || stocks.find(s => s.id === form.getFieldValue('stockId'));

  return (
    <Card 
      title={
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#e2e8f0' }}>
          💰 Trading
        </span>
      }
      className="h-full"
      style={{ 
        borderRadius: '12px',
        background: '#1a1f3a',
        border: '1px solid #2d3748'
      }}
      bodyStyle={{ padding: '20px' }}
    >
      {selectedStockInfo && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '16px', 
          background: '#2d3748',
          borderRadius: '8px',
          border: '1px solid #4a5568'
        }}>
          <Title level={5} style={{ margin: 0, color: '#63b3ed', marginBottom: '8px' }}>
            {selectedStockInfo.symbol} - {selectedStockInfo.companyName}
          </Title>
          <Space>
            <Text strong style={{ color: '#cbd5e0' }}>Price:</Text>
            <Text style={{ color: '#48bb78', fontWeight: 'bold' }}>
              ${selectedStockInfo.marketPrice?.toFixed(2)}
            </Text>
            <Tag color="#3182ce" style={{ border: 'none', color: '#fff' }}>
              {selectedStockInfo.sector}
            </Tag>
          </Space>
        </div>
      )}

      {lastTradeResult && (
        <Alert
          message={
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {lastTradeResult.transactionType === 'BUY' ? '✅ Purchase' : '✅ Sale'} Successful!
              </div>
              <div style={{ fontSize: '12px', color: '#a0aec0' }}>
                {lastTradeResult.shares} share(s) of {lastTradeResult.stockSymbol} @ ${lastTradeResult.pricePerShare?.toFixed(2)}
                <br />
                Total: ${lastTradeResult.totalValue?.toFixed(2)} | Remaining Cash: ${lastTradeResult.remainingCash?.toFixed(2)}
              </div>
            </div>
          }
          type="success"
          closable
          onClose={() => setLastTradeResult(null)}
          style={{
            marginBottom: '20px',
            background: '#22543d',
            border: '1px solid #48bb78',
            borderRadius: '8px',
          }}
        />
      )}

      <Form form={form} layout="vertical">
        <Form.Item
          name="stockId"
          label={<span style={{ fontWeight: '600', color: '#e2e8f0' }}>Select Stock</span>}
          rules={[{ required: true, message: 'Please select a stock' }]}
        >
          <Select
            placeholder="Choose a stock or click on heart puzzle"
            showSearch
            optionFilterProp="children"
            style={{ width: '100%' }}
            onChange={(value) => {
              const stock = stocks.find(s => s.id === value);
              if (stock) {
                form.setFieldsValue({ stockId: value });
              }
            }}
          >
            {stocks.map((stock) => (
              <Select.Option key={stock.id} value={stock.id}>
                {stock.symbol} - {stock.companyName} (${stock.marketPrice?.toFixed(2)})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="shares"
          label={<span style={{ fontWeight: '600', color: '#e2e8f0' }}>Number of Shares</span>}
          rules={[
            { required: true, message: 'Please enter number of shares' },
            { type: 'number', min: 1, message: 'Must be at least 1 share' },
          ]}
        >
          <InputNumber 
            min={1} 
            style={{ width: '100%' }} 
            placeholder="Enter shares to buy/sell"
            size="large"
          />
        </Form.Item>
        <Space size="middle" style={{ width: '100%' }} direction="vertical">
          <Button
            type="primary"
            onClick={() => {
              form.validateFields().then((values) => handleBuy(values));
            }}
            loading={loading}
            size="large"
            block
            style={{
              background: '#48bb78',
              border: 'none',
              fontWeight: 'bold',
              height: '48px'
            }}
          >
            💚 Buy Stock
          </Button>
          <Button
            danger
            onClick={() => {
              form.validateFields().then((values) => handleSell(values));
            }}
            loading={loading}
            size="large"
            block
            style={{
              fontWeight: 'bold',
              height: '48px',
              background: '#f56565',
              border: 'none'
            }}
          >
            ❌ Sell Stock
          </Button>
        </Space>
        <div style={{ marginTop: '20px', padding: '12px', background: '#2d3748', borderRadius: '6px', border: '1px solid #4a5568' }}>
          <Text style={{ fontSize: '12px', color: '#a0aec0' }}>
            💡 Tip: Click on a heart puzzle image in the Market panel to quickly select that stock for trading!
          </Text>
        </div>
      </Form>
    </Card>
  );
};

export default TradingPanel;

