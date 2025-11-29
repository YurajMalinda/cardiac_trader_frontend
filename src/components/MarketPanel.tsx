import { useEffect, useState, useCallback, useRef } from "react";
import { Card, Table, Button, Tag, Modal } from "antd";
import { marketAPI } from "../services/api";
import type { StockDTO } from "../types";
import { DifficultyLevel } from "../types";
import { toast } from "react-toastify";

interface MarketPanelProps {
  sessionId: string;
  onStockSelect?: (stock: StockDTO) => void;
  selectedStockId?: string;
  roundNumber?: number; // Track round number to detect round changes
  onImagesLoaded?: () => void; // Callback when all images are loaded
  difficultyLevel?: DifficultyLevel; // Difficulty level for blur effect
  refreshTrigger?: number; // Trigger to refresh stocks list
}

const MarketPanel = ({
  sessionId,
  onStockSelect,
  selectedStockId,
  roundNumber,
  onImagesLoaded,
  difficultyLevel,
  refreshTrigger,
}: MarketPanelProps) => {
  const [stocks, setStocks] = useState<StockDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [newImageIds, setNewImageIds] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    stock: StockDTO;
  } | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const previousImageUrlsRef = useRef<Map<string, string>>(new Map());
  const previousRoundRef = useRef<number | undefined>(undefined);
  const imagesToLoadRef = useRef<Set<string>>(new Set());

  // Get blur amount based on difficulty
  const getBlurAmount = (difficulty?: DifficultyLevel): string => {
    if (!difficulty) return "0px";

    switch (difficulty) {
      case DifficultyLevel.EASY:
        return "2px"; // Slight blur
      case DifficultyLevel.MEDIUM:
        return "4px"; // Medium blur
      case DifficultyLevel.HARD:
        return "8px"; // Strong blur
      default:
        return "0px";
    }
  };

  const blurAmount = getBlurAmount(difficultyLevel);

  // Reset image history when round changes
  useEffect(() => {
    if (roundNumber !== undefined && roundNumber !== previousRoundRef.current) {
      previousImageUrlsRef.current.clear();
      previousRoundRef.current = roundNumber;
      setLoadedImages(new Set()); // Reset loaded images
      imagesToLoadRef.current.clear(); // Reset images to load

      // When round changes, mark all current stocks with images as needing to load
      stocks.forEach((stock) => {
        if (stock.id && stock.heartImageUrl) {
          imagesToLoadRef.current.add(stock.id);
        }
      });

      // Show all images as "new" when round starts
      const allIds = new Set<string>();
      stocks.forEach((stock) => {
        if (stock.id && stock.heartImageUrl) {
          allIds.add(stock.id);
        }
      });
      if (allIds.size > 0) {
        setNewImageIds(allIds);
        setTimeout(() => {
          setNewImageIds(new Set());
        }, 3000); // Show "NEW" badge for 3 seconds on round start
      } else {
        // No images to load, notify parent immediately
        onImagesLoaded?.();
      }
    }
  }, [roundNumber, stocks, onImagesLoaded]);

  // Track image loading
  const handleImageLoad = useCallback(
    (stockId: string) => {
      setLoadedImages((prev) => {
        const updated = new Set(prev);
        updated.add(stockId);

        // Check if all images are loaded
        const imagesToLoad = Array.from(imagesToLoadRef.current);
        if (
          imagesToLoad.length > 0 &&
          updated.size >= imagesToLoad.length &&
          imagesToLoad.every((id) => updated.has(id))
        ) {
          // All images loaded, notify parent
          setTimeout(() => {
            onImagesLoaded?.();
          }, 0);
        }

        return updated;
      });
    },
    [onImagesLoaded]
  );

  const loadStocks = useCallback(async () => {
    try {
      const data = await marketAPI.getAvailableStocks(sessionId);

      // Detect which images have changed
      const changedIds = new Set<string>();
      const previousUrls = previousImageUrlsRef.current;

      // Reset loaded images for new images
      const newImageIdsSet = new Set<string>();

      // Track all stocks with images
      const stocksWithImages = new Set<string>();

      data.forEach((stock) => {
        if (stock.id) {
          const previousUrl = previousUrls.get(stock.id);
          const currentUrl = stock.heartImageUrl;

          if (currentUrl) {
            stocksWithImages.add(stock.id);

            // Always track images that exist (for loading detection)
            imagesToLoadRef.current.add(stock.id);

            // If this is a new URL (different from previous or no previous)
            if (!previousUrl || previousUrl !== currentUrl) {
              changedIds.add(stock.id);
              newImageIdsSet.add(stock.id);

              // Reset loaded status for changed images
              setLoadedImages((prev) => {
                const updated = new Set(prev);
                updated.delete(stock.id);
                return updated;
              });
            }
          }

          // Update the reference
          if (currentUrl) {
            previousUrls.set(stock.id, currentUrl);
          } else {
            // If no image URL, remove from tracking
            imagesToLoadRef.current.delete(stock.id);
            setLoadedImages((prev) => {
              const updated = new Set(prev);
              updated.delete(stock.id);
              return updated;
            });
          }
        }
      });

      // Set new image IDs to trigger animation
      if (changedIds.size > 0 || newImageIdsSet.size > 0) {
        setNewImageIds(new Set([...changedIds, ...newImageIdsSet]));
        // Clear the animation after 2 seconds
        setTimeout(() => {
          setNewImageIds(new Set());
        }, 2000);
      }

      // Check if all tracked images are loaded
      const allTrackedImages = Array.from(imagesToLoadRef.current);
      const allLoaded =
        allTrackedImages.length > 0 &&
        allTrackedImages.every((id) => loadedImages.has(id));

      // If no images need loading OR all are already loaded, notify
      if (imagesToLoadRef.current.size === 0 || allLoaded) {
        onImagesLoaded?.();
      }

      setStocks(data);
    } catch {
      console.error("Failed to load stocks");
      // On error, notify that loading is done (so timer can start)
      onImagesLoaded?.();
    }
  }, [sessionId, onImagesLoaded, loadedImages]);

  useEffect(() => {
    loadStocks();
    const interval = setInterval(loadStocks, 10000);
    return () => clearInterval(interval);
  }, [loadStocks]);

  // Refresh stocks when refreshTrigger changes (e.g., after a trade)
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      loadStocks();
    }
  }, [refreshTrigger, loadStocks]);

  // Check if all images are loaded after stocks are set
  useEffect(() => {
    if (stocks.length > 0 && imagesToLoadRef.current.size > 0) {
      const imagesToLoad = Array.from(imagesToLoadRef.current);
      const allLoaded =
        imagesToLoad.length > 0 &&
        imagesToLoad.every((id) => loadedImages.has(id)) &&
        loadedImages.size >= imagesToLoad.length;

      if (allLoaded) {
        setTimeout(() => {
          onImagesLoaded?.();
        }, 100); // Small delay to ensure state is updated
      }
    } else if (stocks.length > 0 && imagesToLoadRef.current.size === 0) {
      // No images to load, notify immediately
      setTimeout(() => {
        onImagesLoaded?.();
      }, 100);
    }
  }, [stocks, loadedImages, onImagesLoaded]);

  // Fallback: Start timer after max 5 seconds even if images aren't loaded
  useEffect(() => {
    if (roundNumber !== undefined && imagesToLoadRef.current.size > 0) {
      const timeoutId = setTimeout(() => {
        onImagesLoaded?.();
      }, 5000); // Max 5 seconds wait

      return () => clearTimeout(timeoutId);
    }
  }, [roundNumber, onImagesLoaded]);

  const handleUpdatePrices = async () => {
    setLoading(true);
    try {
      await marketAPI.updateMarketPrices(sessionId);
      toast.success("Market prices updated!");
      loadStocks();
    } catch {
      toast.error("Failed to update prices");
    } finally {
      setLoading(false);
    }
  };

  const getSectorColor = (sector: string) => {
    switch (sector) {
      case "TECH":
        return "#3182ce";
      case "MEDICAL":
        return "#38a169";
      case "FINANCE":
        return "#d69e2e";
      default:
        return "#718096";
    }
  };

  const columns = [
    {
      title: (
        <span style={{ color: "#e2e8f0", fontWeight: "600" }}>Symbol</span>
      ),
      dataIndex: "symbol",
      key: "symbol",
      render: (text: string) => (
        <span
          style={{ fontWeight: "bold", fontSize: "14px", color: "#63b3ed" }}
        >
          {text}
        </span>
      ),
    },
    {
      title: (
        <span style={{ color: "#e2e8f0", fontWeight: "600" }}>Company</span>
      ),
      dataIndex: "companyName",
      key: "companyName",
      render: (text: string) => (
        <span style={{ fontSize: "13px", color: "#cbd5e0" }}>{text}</span>
      ),
    },
    {
      title: (
        <span style={{ color: "#e2e8f0", fontWeight: "600" }}>
          Heart Puzzle
        </span>
      ),
      dataIndex: "heartImageUrl",
      key: "heartImageUrl",
      render: (imageUrl: string, record: StockDTO) => {
        if (!imageUrl) return <span style={{ color: "#718096" }}>-</span>;
        const isNewImage = record.id ? newImageIds.has(record.id) : false;
        return (
          <div
            style={{
              width: 100,
              height: 100,
              border:
                selectedStockId === record.id
                  ? "3px solid #48bb78"
                  : isNewImage
                  ? "3px solid #f6ad55"
                  : "2px solid #4a5568",
              borderRadius: "8px",
              padding: "4px",
              cursor: "pointer",
              transition: "all 0.3s",
              background:
                selectedStockId === record.id
                  ? "#2d5016"
                  : isNewImage
                  ? "#4a2c2a"
                  : "#2d3748",
              position: "relative",
              boxShadow: isNewImage
                ? "0 0 15px rgba(246, 173, 85, 0.6)"
                : "none",
              animation: isNewImage ? "pulse 0.6s ease-in-out" : "none",
            }}
            onClick={() => onStockSelect?.(record)}
          >
            {isNewImage && (
              <div
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  background: "#f6ad55",
                  color: "#1a202c",
                  fontSize: "10px",
                  fontWeight: "bold",
                  padding: "2px 6px",
                  borderRadius: "10px",
                  zIndex: 10,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                NEW
              </div>
            )}
            <img
              src={imageUrl}
              alt="Heart puzzle"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                animation: isNewImage ? "fadeIn 0.5s ease-in" : "none",
                cursor: "zoom-in",
                filter: `blur(${blurAmount})`,
                transition: "filter 0.3s ease",
              }}
              onLoad={() => {
                if (record.id) {
                  handleImageLoad(record.id);
                }
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                // Still count as loaded if error (so timer can start)
                if (record.id) {
                  handleImageLoad(record.id);
                }
              }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent row selection
                setPreviewImage({ url: imageUrl, stock: record });
              }}
            />
            <style>{`
              @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
              }
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>
          </div>
        );
      },
    },
    {
      title: (
        <span style={{ color: "#e2e8f0", fontWeight: "600" }}>Sector</span>
      ),
      dataIndex: "sector",
      key: "sector",
      render: (sector: string) => (
        <Tag
          color={getSectorColor(sector)}
          style={{
            fontWeight: "600",
            border: "none",
            color: "#fff",
          }}
        >
          {sector}
        </Tag>
      ),
    },
    {
      title: <span style={{ color: "#e2e8f0", fontWeight: "600" }}>Price</span>,
      dataIndex: "marketPrice",
      key: "marketPrice",
      render: (value: number) => (
        <span
          style={{ color: "#48bb78", fontWeight: "bold", fontSize: "14px" }}
        >
          ${value.toFixed(2)}
        </span>
      ),
    },
    {
      title: <span style={{ color: "#e2e8f0", fontWeight: "600" }}>Owned</span>,
      dataIndex: "sharesOwned",
      key: "sharesOwned",
      render: (value: number) => (
        <span style={{ color: value > 0 ? "#63b3ed" : "#718096" }}>
          {value || 0}
        </span>
      ),
    },
  ];

  return (
    <Card
      title={
        <span
          style={{ fontSize: "18px", fontWeight: "bold", color: "#e2e8f0" }}
        >
          📈 Market Stocks
        </span>
      }
      extra={
        <Button
          onClick={handleUpdatePrices}
          loading={loading}
          type="primary"
          style={{ background: "#4299e1", border: "none" }}
        >
          🔄 Update Prices
        </Button>
      }
      className="h-full"
      style={{
        borderRadius: "12px",
        background: "#1a1f3a",
        border: "1px solid #2d3748",
      }}
      bodyStyle={{ padding: "20px" }}
    >
      <Table
        dataSource={stocks}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
        style={{
          background: "#1a1f3a",
        }}
        onRow={(record) => ({
          onClick: () => onStockSelect?.(record),
          style: {
            cursor: "pointer",
            backgroundColor:
              selectedStockId === record.id ? "#2d3748" : "transparent",
            transition: "background-color 0.2s",
          },
        })}
      />

      {/* Heart Puzzle Preview Modal */}
      <Modal
        open={previewImage !== null}
        onCancel={() => setPreviewImage(null)}
        footer={null}
        width={600}
        centered
        styles={{
          body: {
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "#1a1f3a",
          },
        }}
      >
        {previewImage && (
          <div style={{ width: "100%", textAlign: "center" }}>
            <div
              style={{
                marginBottom: "16px",
                color: "#e2e8f0",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              {previewImage.stock.symbol} - {previewImage.stock.companyName}
            </div>
            <div
              style={{
                background: "#2d3748",
                borderRadius: "12px",
                padding: "20px",
                border: "2px solid #4a5568",
                display: "inline-block",
              }}
            >
              <img
                src={previewImage.url}
                alt="Heart puzzle preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  filter: `blur(${blurAmount})`,
                  transition: "filter 0.3s ease",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div
              style={{
                marginTop: "16px",
                color: "#a0aec0",
                fontSize: "14px",
              }}
            >
              💡 Click outside to close
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default MarketPanel;
