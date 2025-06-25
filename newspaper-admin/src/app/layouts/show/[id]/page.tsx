"use client";

import { DateField, MarkdownField, Show, TextField } from "@refinedev/antd";
import { useOne, useShow } from "@refinedev/core";
import { Typography } from "antd";

const { Title } = Typography;

export default function BlogPostShow() {
  const { queryResult } = useShow({
    meta: {
      populate: ["category"],
    },
  });
  const { data, isLoading } = queryResult;

  const record = data?.data;

  const renderAvailableTextStyles = (value: any) => {
    let fonts: any[] = [];
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        fonts = parsed.fonts || [];
      } catch {
        fonts = [];
      }
    } else if (value && typeof value === 'object' && Array.isArray(value.fonts)) {
      fonts = value.fonts;
    }
    if (!fonts.length) return '-';
    return (
      <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #d9d9d9' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 'bold', fontSize: 12, border: '1px solid #d9d9d9', backgroundColor: '#fafafa' }}>Name</th>
            <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 'bold', fontSize: 12, border: '1px solid #d9d9d9', backgroundColor: '#fafafa' }}>Font family</th>
          </tr>
        </thead>
        <tbody>
          {fonts.map((font, idx) => (
            <tr key={idx}>
              <td style={{ padding: '4px 8px', fontSize: 12, border: '1px solid #d9d9d9' }}>{font.name}</td>
              <td style={{ padding: '4px 8px', fontFamily: font.fontFamily, fontSize: 12, border: '1px solid #d9d9d9' }}>{font.fontFamily}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={record?.id} />
      <Title level={5}>{"Column count"}</Title>
        <TextField value={record?.columnCount} />
      <Title level={5}>{"Page height"}</Title>
        <TextField value={record?.pageHeight} />
        <Title level={5}>{"Available text styles"}</Title>
        {renderAvailableTextStyles(record?.availableTextStyles)}
        <Title level={5}>{"pageWidth"}</Title>
        <TextField value={record?.pageWidth} />
        <Title level={5}>{"horizontalFieldsWidth"}</Title>
        <TextField value={record?.horizontalFieldsWidth} />
        <Title level={5}>{"verticalFieldsHeight"}</Title>
        <TextField value={record?.verticalFieldsHeight} />
        <Title level={5}>{"fontFamily"}</Title>
        <TextField value={record?.fontFamily} />
        <Title level={5}>{"pagesCount"}</Title>
        <TextField value={record?.pagesCount} />
    </Show>
  );
}
