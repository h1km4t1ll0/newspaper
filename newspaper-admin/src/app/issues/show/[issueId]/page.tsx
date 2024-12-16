"use client";

import { useTable } from "@refinedev/antd";
import { useParams, useSearchParams } from "next/navigation";
import GridStack from "@components/Gridstack";
import { List, Space, Table } from "antd";

const layoutSettings = {
    rowHeight: 50,
    rowCount: 10,
};

const relationsQuery = {
    populate: {
        layout: {
            populate: {
                column: {
                    populate: "*",
                },
            },
        },
        rows: {
            populate: {
                column: {
                    populate: "*",
                },
            },
        },
    },
};

type IssueType = {
    id: string | number;
    name: string;
    PublishDate: string;
    newspaper: string | number;
    layout: {
        editorJSData: JSON;
        columnCount: number;
        headerHeight: number;
        availableTextStyles: JSON;
    };
};

export default function IssueShowPage() {
    const { issueId } = useParams(); // Extract issueId from the route
    const searchParams = useSearchParams();
    const newspaperId = searchParams.get("newspaperId"); // Extract newspaperId from query parameters

    const { tableProps } = useTable<IssueType>({
        resource: "issues",
        meta: relationsQuery,
        syncWithLocation: false,
        filters: {
            permanent: [
                {
                    field: "id",
                    operator: "eq",
                    value: issueId,
                },
                {
                    field: "newspaper",
                    operator: "eq",
                    value: newspaperId,
                },
            ],
        },
    });

    const issue = tableProps.dataSource?.[0]; // Get the first (and only) matching issue

    if (!issue) return <p>Loading or no issue found!</p>;

    return (
        <div>
            <h1>Issue Details</h1>
            <p>
                <strong>ID:</strong> {issue.id}
            </p>
            <p>
                <strong>Name:</strong> {issue.name}
            </p>
            <p>
                <strong>Publish Date:</strong> {issue.PublishDate}
            </p>
            <p>
                <strong>Newspaper:</strong> {issue.newspaper}
            </p>
            <h2>Layout</h2>
            <pre>{JSON.stringify(issue.layout, null, 2)}</pre>

            {/* Render GridStack */}
            <GridStack layoutSettings={layoutSettings} />
        </div>
    );
}
