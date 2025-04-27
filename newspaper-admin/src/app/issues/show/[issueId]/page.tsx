"use client";

import { useTable } from "@refinedev/antd";
import { useParams, useSearchParams } from "next/navigation";
import GridStack from "@components/Gridstack";
import {Button, Card, Col, Modal, Row} from "antd";
import { Layout, Badge, Spin } from "antd";
import {
    CheckCircleOutlined,
    EyeOutlined,
    SyncOutlined,
} from "@ant-design/icons";
import {useMemo, useState} from "react";
import {useCustom} from "@refinedev/core";
import {API_URL} from "@utility/constants";
import qs from "qs";
import ContentEditor from "@components/editor-js/ContentEditor";

const { Header, Sider, Content } = Layout;

const relationsQuery = {
    populate: {
        newspaper: {
            populate: {
                layout: {
                    populate: "*"
                }
            }
        },
        cover: {
            populate: "*"
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
    pagesCount: number,
}

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

    const issue = tableProps.dataSource?.[0]; // Get the first (and only) matching issue
    const [saved, setSaved] = useState(true);

    if (!issue) return <p>Loading or no issue found!</p>;

    return (
        <Layout style={{ height: "100vh" }}>
            {/* ── Sticky Header ── */}
            <Header
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1000,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 24px",
                    background: "#fff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
            >
                <h2 style={{ margin: 0, flex: 1 }}>{issue.name}</h2>

                <Badge
                    status={issue.status === "published" ? "success" : "warning"}
                    text={issue.status}
                    style={{ marginRight: 24 }}
                />

                <span style={{ marginRight: 24 }}>
          {new Date(issue.PublishDate).toLocaleString()}
        </span>

                <div style={{ marginLeft: 24 }}>
                    {saved ? (
                        <span style={{ color: "#52c41a" }}>
              <SyncOutlined spin={false} /> All changes saved
            </span>
                    ) : (
                        <span>
              <SyncOutlined spin /> Saving…
            </span>
                    )}
                </div>
            </Header>

            <Layout>
                {/* ── Main Canvas ── */}
                <Content style={{ position: "relative", overflow: "auto" }}>
                    <GridStack
                        layoutSettings={issue.newspaper.layout}
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
