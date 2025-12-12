import { Modal, Statistic, Row, Col, Table, Tag, Button } from 'antd';
import type { GameSummaryDTO, RoundSummaryDTO } from '../types';
import { DifficultyLevel } from '../types';

interface GameSummaryModalProps {
  summary: GameSummaryDTO;
  onClose: () => void;
}

const GameSummaryModal = ({ summary, onClose }: GameSummaryModalProps) => {
  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return '#48bb78';
      case DifficultyLevel.MEDIUM:
        return '#4299e1';
      case DifficultyLevel.HARD:
        return '#f56565';
      default:
        return '#718096';
    }
  };

  const getDifficultyLabel = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return '🟢 Easy';
      case DifficultyLevel.MEDIUM:
        return '🔵 Medium';
      case DifficultyLevel.HARD:
        return '🔴 Hard';
      default:
        return difficulty;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const roundColumns = [
    {
      title: <span style={{ color: '#e2e8f0', fontWeight: '600' }}>Round</span>,
      dataIndex: 'roundNumber',
      key: 'roundNumber',
      render: (round: number) => (
        <span style={{ fontWeight: 'bold', color: '#63b3ed', fontSize: '14px' }}>
          Round {round}
        </span>
      ),
    },
    {
      title: <span style={{ color: '#e2e8f0', fontWeight: '600' }}>Start Capital</span>,
      dataIndex: 'capitalAtStart',
      key: 'capitalAtStart',
      render: (value: number) => (
        <span style={{ color: '#cbd5e0' }}>${value.toFixed(2)}</span>
      ),
    },
    {
      title: <span style={{ color: '#e2e8f0', fontWeight: '600' }}>End Capital</span>,
      dataIndex: 'capitalAtEnd',
      key: 'capitalAtEnd',
      render: (value: number) => (
        <span style={{ color: '#cbd5e0' }}>${value.toFixed(2)}</span>
      ),
    },
    {
      title: <span style={{ color: '#e2e8f0', fontWeight: '600' }}>Profit/Loss</span>,
      dataIndex: 'profitLoss',
      key: 'profitLoss',
      render: (value: number, record: RoundSummaryDTO) => (
        <span
          style={{
            color: value >= 0 ? '#48bb78' : '#f56565',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          {value >= 0 ? '+' : ''}${value.toFixed(2)}
        </span>
      ),
    },
    {
      title: <span style={{ color: '#e2e8f0', fontWeight: '600' }}>P/L %</span>,
      dataIndex: 'profitLossPercentage',
      key: 'profitLossPercentage',
      render: (value: number) => (
        <span
          style={{
            color: value >= 0 ? '#48bb78' : '#f56565',
            fontWeight: 'bold',
          }}
        >
          {value >= 0 ? '+' : ''}
          {value.toFixed(2)}%
        </span>
      ),
    },
    {
      title: <span style={{ color: '#e2e8f0', fontWeight: '600' }}>Duration</span>,
      dataIndex: 'durationSeconds',
      key: 'durationSeconds',
      render: (seconds: number) => (
        <span style={{ color: '#a0aec0' }}>{formatDuration(seconds)}</span>
      ),
    },
  ];

  // Mark best and worst rounds in the data
  const roundsWithHighlights = summary.rounds.map((round) => ({
    ...round,
    isBest: round.roundNumber === summary.bestRoundNumber,
    isWorst: round.roundNumber === summary.worstRoundNumber,
  }));

  return (
    <Modal
      title={
        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#e2e8f0' }}>
          🏆 Final Game Summary
        </span>
      }
      open={true}
      onOk={onClose}
      onCancel={onClose}
      width={1400}
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
            background: '#48bb78',
            border: 'none',
            fontWeight: 'bold',
            height: '40px',
            padding: '0 32px',
          }}
        >
          Start New Game
        </Button>,
      ]}
    >
      {/* Overall Statistics */}
      <div
        style={{
          marginBottom: '24px',
          padding: '20px',
          background: 'linear-gradient(135deg, #2d5016 0%, #22543d 100%)',
          borderRadius: '12px',
          border: '2px solid #48bb78',
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <div
              style={{
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <Statistic
                title={
                  <span style={{ color: '#a0aec0', fontWeight: '600', fontSize: '12px' }}>
                    Difficulty
                  </span>
                }
                value={getDifficultyLabel(summary.difficultyLevel)}
                valueStyle={{
                  color: getDifficultyColor(summary.difficultyLevel),
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div
              style={{
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <Statistic
                title={
                  <span style={{ color: '#a0aec0', fontWeight: '600', fontSize: '12px' }}>
                    Starting Capital
                  </span>
                }
                value={summary.startingCapital}
                prefix="$"
                precision={2}
                valueStyle={{ color: '#63b3ed', fontSize: '18px', fontWeight: 'bold' }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div
              style={{
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <Statistic
                title={
                  <span style={{ color: '#a0aec0', fontWeight: '600', fontSize: '12px' }}>
                    Final Capital
                  </span>
                }
                value={summary.finalCapital}
                prefix="$"
                precision={2}
                valueStyle={{ color: '#63b3ed', fontSize: '18px', fontWeight: 'bold' }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div
              style={{
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <Statistic
                title={
                  <span style={{ color: '#a0aec0', fontWeight: '600', fontSize: '12px' }}>
                    Total Profit/Loss
                  </span>
                }
                value={summary.totalProfitLoss}
                prefix="$"
                precision={2}
                valueStyle={{
                  color: summary.totalProfitLoss >= 0 ? '#48bb78' : '#f56565',
                  fontSize: '20px',
                  fontWeight: 'bold',
                }}
              />
            </div>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} sm={12} md={12}>
            <div
              style={{
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <Statistic
                title={
                  <span style={{ color: '#a0aec0', fontWeight: '600', fontSize: '12px' }}>
                    Total P/L Percentage
                  </span>
                }
                value={summary.totalProfitLossPercentage}
                precision={2}
                suffix="%"
                valueStyle={{
                  color: summary.totalProfitLossPercentage >= 0 ? '#48bb78' : '#f56565',
                  fontSize: '20px',
                  fontWeight: 'bold',
                }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={12}>
            <div
              style={{
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <div style={{ color: '#a0aec0', fontWeight: '600', fontSize: '12px', marginBottom: '8px' }}>
                Best Round
              </div>
              {summary.bestRoundNumber && summary.bestRoundProfit !== undefined ? (
                <div>
                  <Tag
                    color="#48bb78"
                    style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      padding: '4px 12px',
                      border: 'none',
                    }}
                  >
                    Round {summary.bestRoundNumber}: +${summary.bestRoundProfit.toFixed(2)}
                  </Tag>
                </div>
              ) : (
                <span style={{ color: '#718096' }}>N/A</span>
              )}
              {summary.worstRoundNumber && summary.worstRoundProfit !== undefined && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ color: '#a0aec0', fontWeight: '600', fontSize: '12px', marginBottom: '4px' }}>
                    Worst Round
                  </div>
                  <Tag
                    color="#f56565"
                    style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      padding: '4px 12px',
                      border: 'none',
                    }}
                  >
                    Round {summary.worstRoundNumber}: ${summary.worstRoundProfit.toFixed(2)}
                  </Tag>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </div>

      {/* Round-by-Round Breakdown */}
      <div>
        <h4
          style={{
            color: '#e2e8f0',
            marginBottom: '16px',
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          📊 Round-by-Round Performance:
        </h4>
        <Table
          dataSource={roundsWithHighlights}
          columns={roundColumns}
          rowKey="roundId"
          pagination={false}
          size="small"
          style={{
            background: '#1a1f3a',
          }}
          rowClassName={(record) => {
            if (record.isBest) return 'best-round-row';
            if (record.isWorst) return 'worst-round-row';
            return '';
          }}
        />
        <style>{`
          .best-round-row {
            background: rgba(72, 187, 120, 0.1) !important;
            border-left: 3px solid #48bb78;
          }
          .worst-round-row {
            background: rgba(245, 101, 101, 0.1) !important;
            border-left: 3px solid #f56565;
          }
          .ant-table-tbody > tr.best-round-row:hover > td {
            background: rgba(72, 187, 120, 0.15) !important;
          }
          .ant-table-tbody > tr.worst-round-row:hover > td {
            background: rgba(245, 101, 101, 0.15) !important;
          }
        `}</style>
      </div>
    </Modal>
  );
};

export default GameSummaryModal;


