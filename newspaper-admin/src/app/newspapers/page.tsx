"use client";

import { useTable } from "@refinedev/antd";
import { Space, Button, Card, Col, Row } from "antd";
import { EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { BaseRecord } from "@refinedev/core";
import { useRouter } from "next/navigation";

const relationsQuery = {
    populate: {
        issues: {
            populate: "*"
        },
        layout: {
            populate: "*"
        }
    },
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
};

type IssueType = {
    name: string,
    status: string,
    PublishDate: Date,
}

export default function NewspaperList() {
    const { tableProps } = useTable<{
        id: number | string;
        name: string;
        cover: string; // cover is a URL to the image
        layout: LayoutType;
        fontFamily: string;
        height: string;
        issues: IssueType[]
    }>({
        syncWithLocation: true,
        meta: relationsQuery,
        sorters: {
            initial: [
                {
                    field: "id",
                    order: "desc",
                },
            ],
        },
    });

    const router = useRouter();

    // Assuming this is the base URL for your Strapi media (adjust this to your actual base URL)
    const STRAPI_BASE_URL = "http://localhost:1337";  // or your production URL

    return (
        <div>
            <h1>All Newspapers</h1>
            <Space style={{ marginBottom: 16 }}>
                <Button type="primary" onClick={() => router.push("/newspapers/create")}>
                    Create Newspaper
                </Button>
            </Space>
            <Row gutter={[16, 16]}>
                {tableProps?.dataSource?.map((newspaper) => (
                    <Col span={8} key={newspaper.id}>
                        <Card
                            hoverable
                            cover={<img alt="newspaper" src={`${STRAPI_BASE_URL}${newspaper.cover}`} />} // Load the image
                        >
                            <Card.Meta title={newspaper.name} />
                            <p>Issues: {newspaper.issues.length}</p>
                            <Space>
                                <EditButton hideText size="small" recordItemId={newspaper.id} />
                                <ShowButton hideText size="small" recordItemId={newspaper.id} onClick={() => router.push(`/issues?newspaperId=${newspaper.id}`)} />
                                <DeleteButton hideText size="small" recordItemId={newspaper.id} />
                            </Space>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}
