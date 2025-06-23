"use client";

import GridStack from "@components/Gridstack";
import { useTable } from "@refinedev/antd";
import { Layout } from "antd";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const { Header, Sider, Content } = Layout;

const relationsQuery = {
  populate: {
    newspaper: {
      populate: {
        layout: true,
        photo: true,
        issues: true,
      },
    },
    cover: {
      populate: "*",
    },
  },
};

type LayoutType = {
  editorJSData: JSON;
  columnCount: number;
  pageHeight: number;
  availableTextStyles: JSON;
  pageWidth: number;
  horizontalFieldsWidth: number;
  verticalFieldsHeight: number;
  fontFamily: string;
  pagesCount: number;
};

type NewspaperType = {
  id: string | number;
  name: string;
  cover: string;
  layout: LayoutType;
};

type IssueType = {
  id: string | number;
  status: string;
  name: string;
  PublishDate: string;
  newspaper: NewspaperType;
  cover: any;
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

  const [issue, setIssue] = useState<IssueType>();

  useEffect(() => {
    setIssue(tableProps.dataSource?.[0]);
  }, [tableProps, tableProps.dataSource?.length]);

  const [saved, setSaved] = useState(true);

  if (tableProps.loading || !issue) return <p>Loading...</p>;

  // Normal mode - with full layout
  return (
    <Layout style={{ height: "100vh" }}>
      <Layout>
        {/* ── Main Canvas ── */}
        <Content style={{ position: "relative", overflow: "auto" }}>
          <GridStack
            layoutSettings={issue.newspaper.layout as any}
            issueDate={issue.PublishDate}
            newspaperName={issue.newspaper.name}
            issueCover={issue.cover?.url}
            issueId={issue.id}
            issueStatus={issue.status}
          />
        </Content>
      </Layout>
    </Layout>
  );
}
