import React, { useState } from "react";
import { Modal, Button, Typography } from "antd";

interface SplitTextModalProps {
  visible: boolean;
  text: string;
  onCancel: () => void;
  onOk: (splitIndices: number[]) => void;
}

const SplitTextModal: React.FC<SplitTextModalProps> = ({
  visible,
  text,
  onCancel,
  onOk,
}) => {
  const [splitIndices, setSplitIndices] = useState<number[]>([]);
  const words = text.split(" ");

  const toggleSplitIndex = (index: number) => {
    setSplitIndices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const getSplitPreview = () => {
    if (splitIndices.length === 0) {
      return [text];
    }
    const sortedIndices = [...splitIndices].sort((a, b) => a - b);
    const parts = [];
    let lastIndex = 0;
    for (const index of sortedIndices) {
      parts.push(words.slice(lastIndex, index + 1).join(" "));
      lastIndex = index + 1;
    }
    parts.push(words.slice(lastIndex).join(" "));
    return parts;
  };

  const handleOk = () => {
    onOk(splitIndices);
    setSplitIndices([]); // Reset for next time
  };

  const handleCancel = () => {
    onCancel();
    setSplitIndices([]); // Reset for next time
  };

  return (
    <Modal
      title="Split text into parts"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Split"
      cancelText="Cancel"
      zIndex={1100}
      width={800}
    >
      <div style={{ marginBottom: 16 }}>
        <p>
          <strong>Click between words to select where to split:</strong>
        </p>
        <div
          style={{
            maxHeight: 200,
            overflowY: "auto",
            border: "1px solid #d9d9d9",
            padding: "8px",
            lineHeight: "2",
            marginBottom: 16,
          }}
        >
          {words.map((word, index) => (
            <React.Fragment key={index}>
              <span>{word}</span>
              {index < words.length - 1 && (
                <Button
                  type="text"
                  size="small"
                  onClick={() => toggleSplitIndex(index)}
                  style={{
                    padding: "0 4px",
                    margin: "0 2px",
                    border: splitIndices.includes(index)
                      ? "1px solid #1890ff"
                      : "1px solid transparent",
                    color: splitIndices.includes(index) ? "#1890ff" : "inherit",
                  }}
                >
                  |
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>
        <div>
          <p>
            <strong>Preview:</strong>
          </p>
          <div
            style={{
              maxHeight: 200,
              overflowY: "auto",
              border: "1px solid #d9d9d9",
              padding: "8px",
            }}
          >
            {getSplitPreview().map((part, index) => (
              <Typography.Paragraph key={index}>{part}</Typography.Paragraph>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SplitTextModal; 