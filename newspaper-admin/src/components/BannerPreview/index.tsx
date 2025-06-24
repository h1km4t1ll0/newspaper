import { useCustom } from "@refinedev/core";
import { API_URL } from "@utility/constants";
import { Card, Select, Row, Col } from "antd";
import { useState, useEffect } from "react";
import styled from "styled-components";

const PreviewContainer = styled.div`
  background: #f0f2f5;
  padding: 20px;
  border-radius: 8px;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BannerPreviewBox = styled.div<{ width: number; height: number }>`
  background: white;
  border: 2px solid #d9d9d9;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Arial, sans-serif;
  font-size: 14px;
  color: #666;
  text-align: center;
  padding: 20px;
  box-sizing: border-box;
  transition: all 0.3s ease;
  
  /* Banner dimensions based on columns and rows */
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  min-width: 100px;
  min-height: 100px;
  max-width: 400px;
  max-height: 300px;
`;

type Layout = {
  id: number;
  columnCount: number;
  pageWidth: number;
  pageHeight: number;
  horizontalFieldsWidth: number;
  verticalFieldsHeight: number;
};

type BannerPreviewProps = {
  name?: string;
  widthInColumns?: number;
  heightInRows?: number;
  title?: string;
};

export const BannerPreview: React.FC<BannerPreviewProps> = ({
  name,
  widthInColumns = 2,
  heightInRows = 2,
  title = "Banner Preview"
}) => {
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null);
  const [layouts, setLayouts] = useState<Layout[]>([]);

  // Load layouts list
  const { data: layoutsData } = useCustom<{
    data: Array<{
      id: number;
      attributes: Layout;
    }>;
  }>({
    url: `${API_URL}/api/layouts`,
    method: "get",
  });

  useEffect(() => {
    if (layoutsData?.data?.data) {
      const layoutList = layoutsData.data.data.map(item => ({
        ...item.attributes,
        id: item.id
      }));
      setLayouts(layoutList);
      
      // Select first layout by default
      if (layoutList.length > 0 && !selectedLayout) {
        setSelectedLayout(layoutList[0]);
      }
    }
  }, [layoutsData]);

  const calculateBannerWidth = () => {
    if (!selectedLayout) return widthInColumns * 50;
    
    // Calculate width of one column
    const columnWidth = (selectedLayout.pageWidth - selectedLayout.horizontalFieldsWidth * 2) / selectedLayout.columnCount;
    return widthInColumns * columnWidth;
  };

  const calculateBannerHeight = () => {
    if (!selectedLayout) return heightInRows * 40;
    
    // Calculate height of one row
    const rowHeight = 40; // assume 20 rows
    return heightInRows * rowHeight;
  };

  const bannerWidth = calculateBannerWidth();
  const bannerHeight = calculateBannerHeight();

  return (
    <Card title={title} style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Select
            placeholder="Select layout for size calculation"
            value={selectedLayout?.id}
            onChange={(value) => {
              const layout = layouts.find(l => l.id === value);
              setSelectedLayout(layout || null);
            }}
            style={{ width: '100%', marginBottom: 16 }}
          >
            {layouts.map(layout => (
              <Select.Option key={layout.id} value={layout.id}>
                Layout {layout.id} ({layout.columnCount} columns, {layout.pageWidth}px width)
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col span={24}>
          <PreviewContainer>
            <BannerPreviewBox width={bannerWidth} height={bannerHeight}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {name || 'Banner'}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {widthInColumns} × {heightInRows}
                </div>
                <div style={{ fontSize: '10px', color: '#999', marginTop: '8px' }}>
                  {Math.round(bannerWidth)}px × {Math.round(bannerHeight)}px
                </div>
                {selectedLayout && (
                  <div style={{ fontSize: '9px', color: '#ccc', marginTop: '4px' }}>
                    Layout {selectedLayout.id}
                  </div>
                )}
              </div>
            </BannerPreviewBox>
          </PreviewContainer>
        </Col>
      </Row>
    </Card>
  );
}; 