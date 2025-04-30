"use client";

import { useTable } from "@refinedev/antd";
import { Space, Button, Card, Col, Row } from "antd";
import { EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { BaseRecord } from "@refinedev/core";
import { useRouter } from "next/navigation";
import {useContext} from "react";
import {RoleContext} from "@app/RefineApp";

const relationsQuery = {
    populate: {
        issues: {
            populate: "*"
        },
        layout: {
            populate: "*"
        },
        photo: {
            populate: '*',
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

const STRAPI_BASE_URL = "http://localhost:1338";

export default function NewspaperList() {
    const role = useContext(RoleContext);
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
    console.log(tableProps?.dataSource)

    const router = useRouter();

    // Assuming this is the base URL for your Strapi media (adjust this to your actual base URL)
    // or your production URL

    return (
        <div>
            <h1>All Newspapers</h1>
            {role === 'Authenticated' && <Space style={{ marginBottom: 16 }}>
                <Button type="primary" onClick={() => router.push("/newspapers/create")}>
                    Create Newspaper
                </Button>
            </Space>}
            <Row gutter={[16, 16]}>
                {tableProps?.dataSource?.map((newspaper: any) => (
                    <Col span={8} key={newspaper.id}>
                        <Card
                            hoverable
                            cover={newspaper.photo?.url ? <div style={{
                                height: '200px', // Fixed height for the container
                                overflow: 'hidden', // Hide overflow to prevent cropping
                                display: 'flex', // Use flexbox to center the image
                                justifyContent: 'center', // Center horizontally
                                alignItems: 'center', // Center vertically
                                padding: '10px' // Add padding around the image
                            }}>
                                <img
                                  alt="newspaper"
                                  style={{
                                      maxHeight: '100%', // Ensure the image does not exceed the container height
                                      maxWidth: '100%', // Ensure the image does not exceed the container width
                                      objectFit: 'contain' // Maintain aspect ratio and fit within the container
                                  }}
                                  src={`${STRAPI_BASE_URL}${newspaper.photo.url}`}
                                />
                            </div> : <div style={{
                                height: '200px', // Fixed height for the container
                                overflow: 'hidden', // Hide overflow to prevent cropping
                                display: 'flex', // Use flexbox to center the image
                                justifyContent: 'center', // Center horizontally
                                alignItems: 'center', // Center vertically
                                padding: '10px', // Add padding around the image
                                backgroundColor: "#f0f0f0"
                            }}>No  image</div>} // Load the image
                        >
                        <Card.Meta title={newspaper.name}/>
                            <p>Issues: {newspaper.issues.length}</p>
                            <Space>
                                {role === 'Authenticated' && <EditButton hideText size="small" recordItemId={newspaper.id}/> }
                                <ShowButton hideText size="small" recordItemId={newspaper.id}
                                            onClick={() => router.push(`/issues?newspaperId=${newspaper.id}`)}/>
                                {role === 'Authenticated' && <DeleteButton hideText size="small" recordItemId={newspaper.id}/>}
                            </Space>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}
