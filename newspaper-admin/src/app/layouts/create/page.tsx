"use client";

import { Create, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Select } from "antd";

const { TextArea } = Input;

// Предустановленные значения
const FONT_OPTIONS = [
  { value: "Arial", label: "Arial" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Georgia", label: "Georgia" },
  { value: "Verdana", label: "Verdana" },
  { value: "Courier New", label: "Courier New" },
];

const COLUMN_COUNT_OPTIONS = [
  { value: 4, label: "4 columns" },
  { value: 8, label: "8 columns" },
  { value: 12, label: "12 columns" },
];

const PAGE_SIZE_PRESETS = [
  { value: "a4", label: "A4 (595×842)", width: 595, height: 842 },
  { value: "a5", label: "A5 (420×595)", width: 420, height: 595 },
  { value: "letter", label: "Letter (612×792)", width: 612, height: 792 },
  {
    value: "newspaper",
    label: "Newspaper format (800×1200)",
    width: 800,
    height: 1200,
  },
];

export default function BlogPostCreate() {
  const { formProps, saveButtonProps, form } = useForm({
    defaultFormValues: {
      columnCount: 12,
      pageHeight: 842,
      pageWidth: 595,
      horizontalFieldsWidth: 50,
      verticalFieldsHeight: 50,
      fontFamily: "Arial",
      pagesCount: 2,
      availableTextStyles: JSON.stringify({
        fonts: [
          { fontFamily: "Arial", name: "Arial" },
          { fontFamily: "Times New Roman", name: "Times New Roman" },
          { fontFamily: "Georgia", name: "Georgia" },
        ],
      }),
      editorJSData: JSON.stringify({ blocks: [] }),
    },
  });

  const handlePageSizeChange = (presetValue: string) => {
    const preset = PAGE_SIZE_PRESETS.find((p) => p.value === presetValue);
    if (preset) {
      form?.setFieldsValue({
        pageWidth: preset.width,
        pageHeight: preset.height,
      });
    }
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Name of layout"
          name="name"
          rules={[{ required: true, message: "Enter the name of layout" }]}
        >
          <Input placeholder="Example: Standart newspaper layout" />
        </Form.Item>

        <Form.Item
          label="Preset page size"
          help="Select a standard size or customize below"
        >
          <Select
            placeholder="Select page size"
            onChange={handlePageSizeChange}
            options={PAGE_SIZE_PRESETS.map((p) => ({
              value: p.value,
              label: p.label,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Page width (px)"
          name="pageWidth"
          rules={[{ required: true }]}
        >
          <InputNumber min={200} max={2000} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Page height (px)"
          name="pageHeight"
          rules={[{ required: true }]}
        >
          <InputNumber min={200} max={3000} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Number of columns"
          name="columnCount"
          rules={[{ required: true }]}
        >
          <Select options={COLUMN_COUNT_OPTIONS} />
        </Form.Item>

        <Form.Item
          label="Number of pages"
          name="pagesCount"
          rules={[{ required: true }]}
          help="Minimum 2 pages (first page is not editable)"
        >
          <InputNumber min={2} max={50} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Main font"
          name="fontFamily"
          rules={[{ required: true }]}
        >
          <Select
            options={FONT_OPTIONS}
            showSearch
            placeholder="Select a font"
          />
        </Form.Item>

        <Form.Item
          label="Horizontal fields (px)"
          name="horizontalFieldsWidth"
          help="Left and right margins"
        >
          <InputNumber min={0} max={200} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Vertical fields (px)"
          name="verticalFieldsHeight"
          help="Top and bottom margins"
        >
          <InputNumber min={0} max={200} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Available text styles (JSON)"
          name="availableTextStyles"
          help="Configuration of available fonts in JSON format"
        >
          <TextArea
            rows={4}
            placeholder='{"fonts": [{"fontFamily": "Arial", "name": "Arial"}]}'
          />
        </Form.Item>

        <Form.Item
          label="Editor Data (JSON)"
          name="editorJSData"
          help="Editor structured data (usually empty when created)"
        >
          <TextArea rows={3} placeholder='{"blocks": []}' />
        </Form.Item>
      </Form>
    </Create>
  );
}
