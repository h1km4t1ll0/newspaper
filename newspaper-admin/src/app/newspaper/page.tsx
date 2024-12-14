"use client";

import { useEffect, useState } from "react";

const settings = {
    width: 1080,
    height: 1920,
    columnCount: 3,
    rowHeight: 50,
    rowMargin: [5, 5],
};

interface Block {
    content: string;
    cells: [number, number][]; // List of cell coordinates [(row, col), ...]
}

export default function BlogPostList() {
    const [blocks, setBlocks] = useState<Block[]>([]);

    const getRowCount = (height: number, rowHeight: number, rowMargin: number[]) => {
        return Math.floor(height / (rowHeight + rowMargin[0] + rowMargin[1]));
    };

    const rowCount = getRowCount(settings.height, settings.rowHeight, settings.rowMargin);

    const generateBlocks = (rawContent: string[][]) => {
        const blocks: Block[] = [];
        rawContent.forEach((column, colIndex) => {
            let currentRow = 0;

            column.forEach((text) => {
                // Simulate the block spanning rows (splitting content by length)
                const rowsSpanned = Math.ceil(text.length / 50); // Assume 50 chars fit in one cell
                const cells: [number, number][] = [];

                for (let i = 0; i < rowsSpanned; i++) {
                    if (currentRow + i < rowCount) {
                        cells.push([currentRow + i, colIndex]);
                    }
                }

                blocks.push({
                    content: text,
                    cells,
                });

                currentRow += rowsSpanned; // Move to the next available row
            });
        });

        return blocks;
    };

    // Example raw content
    const rawContent = [
        [
            "Column 1, Row 1: Long text that might overflow into thLong text that might overflow intoLong text that might overflow intoLong text that might overflow intoe next rows.",
            "Column 1, Row 2",
            "Column 1, Row 3: Another piece of text.",
        ],
        [
            "Column 2, Row 1",
            "Column 2, Row 2: Long text to test overflow.",
            "Column 2, Row 3",
        ],
        [
            "Column 3, Row 1: Overflow test with long content.",
            "Column 3, Row 2",
            "Column 3, Row 3",
        ],
    ];

    useEffect(() => {
        const clientBlocks = generateBlocks(rawContent);
        setBlocks(clientBlocks);
    }, [rowCount]);

    if (blocks.length === 0) {
        return null; // Wait for blocks to be calculated
    }

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "grid",
                gridTemplateColumns: `repeat(${settings.columnCount}, 1fr)`,
                gridAutoRows: `${settings.rowHeight}px`,
                gap: `${settings.rowMargin[0]}px ${settings.rowMargin[1]}px`,
                position: "relative",
            }}
        >
            {blocks.map((block, index) => (
                <div
                    key={index}
                    style={{
                        gridColumn: `${block.cells[0][1] + 1} / ${block.cells[block.cells.length - 1][1] + 2}`,
                        gridRow: `${block.cells[0][0] + 1} / ${
                            block.cells[block.cells.length - 1][0] + 2
                        }`,
                        border: "2px solid black", // Block border
                        background: "#f0f0f0", // Optional block background
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    {block.content}
                </div>
            ))}
        </div>
    );
}
