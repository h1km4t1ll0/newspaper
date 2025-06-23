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
  { value: 4, label: "4 колонки" },
  { value: 8, label: "8 колонок" },
  { value: 12, label: "12 колонок" },
];

const PAGE_SIZE_PRESETS = [
  { value: "a4", label: "A4 (595×842)", width: 595, height: 842 },
  { value: "a5", label: "A5 (420×595)", width: 420, height: 595 },
  { value: "letter", label: "Letter (612×792)", width: 612, height: 792 },
  {
    value: "newspaper",
    label: "Газетный формат (800×1200)",
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
          label="Название макета"
          name="name"
          rules={[{ required: true, message: "Введите название макета" }]}
        >
          <Input placeholder="Например: Стандартный макет газеты" />
        </Form.Item>

        <Form.Item
          label="Предустановленный размер страницы"
          help="Выберите стандартный размер или настройте вручную ниже"
        >
          <Select
            placeholder="Выберите размер страницы"
            onChange={handlePageSizeChange}
            options={PAGE_SIZE_PRESETS.map((p) => ({
              value: p.value,
              label: p.label,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Ширина страницы (px)"
          name="pageWidth"
          rules={[{ required: true }]}
        >
          <InputNumber min={200} max={2000} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Высота страницы (px)"
          name="pageHeight"
          rules={[{ required: true }]}
        >
          <InputNumber min={200} max={3000} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Количество колонок"
          name="columnCount"
          rules={[{ required: true }]}
        >
          <Select options={COLUMN_COUNT_OPTIONS} />
        </Form.Item>

        <Form.Item
          label="Количество страниц"
          name="pagesCount"
          rules={[{ required: true }]}
          help="Минимум 2 страницы (первая страница не редактируется)"
        >
          <InputNumber min={2} max={50} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Основной шрифт"
          name="fontFamily"
          rules={[{ required: true }]}
        >
          <Select
            options={FONT_OPTIONS}
            showSearch
            placeholder="Выберите шрифт"
          />
        </Form.Item>

        <Form.Item
          label="Горизонтальные поля (px)"
          name="horizontalFieldsWidth"
          help="Отступы слева и справа"
        >
          <InputNumber min={0} max={200} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Вертикальные поля (px)"
          name="verticalFieldsHeight"
          help="Отступы сверху и снизу"
        >
          <InputNumber min={0} max={200} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Доступные стили текста (JSON)"
          name="availableTextStyles"
          help="Конфигурация доступных шрифтов в формате JSON"
        >
          <TextArea
            rows={4}
            placeholder='{"fonts": [{"fontFamily": "Arial", "name": "Arial"}]}'
          />
        </Form.Item>

        <Form.Item
          label="Данные редактора (JSON)"
          name="editorJSData"
          help="Структурированные данные EditorJS (обычно пустые при создании)"
        >
          <TextArea rows={3} placeholder='{"blocks": []}' />
        </Form.Item>
      </Form>
    </Create>
  );
}
