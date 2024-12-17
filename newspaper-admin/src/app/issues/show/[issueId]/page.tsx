"use client";

import { useTable } from "@refinedev/antd";
import { useParams, useSearchParams } from "next/navigation";
import GridStack from "@components/Gridstack";

const relationsQuery = {
    populate: {
        newspaper: {
            populate: {
                layout: {
                    populate: "*"
                }
            }
        }
    }
};

type LayoutType = {
    editorJSData: JSON,
    columnCount: number,
    pageHeight: number,
    availableTextStyles: JSON,
    pageWidth: number,
    horizontalFieldsWidth: number,
    verticalFieldsHeight: number,
    fontFamily: string,
}

type NewspaperType = {
    id: string | number;
    name: string;
    cover: string;
    layout: LayoutType;
};

type IssueType = {
    id: string | number;
    name: string;
    PublishDate: string;
    newspaper: NewspaperType;
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
                    field: "newspaper.id",
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
                <strong>Newspaper:</strong> {issue.newspaper.id}
            </p>

            {/* Render GridStack */}
            <GridStack layoutSettings={issue.newspaper.layout} />
        </div>
    );
}
