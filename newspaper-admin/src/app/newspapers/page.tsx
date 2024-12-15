"use client";

import { useTable } from "@refinedev/antd";
import { Space, Table, Button } from "antd";
import { EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { BaseRecord } from "@refinedev/core";
import { useRouter } from "next/navigation";

const relationsQuery = {
    populate: {
        issue: {
            populate: {
                layout: {
                    populate: "*"
                }
            }
        },
    },
};

type IssueType = {
    name: string,
    PublishDate: Date,
}

export default function NewspaperList() {
    const { tableProps } = useTable<{
        id: number | string;
        name: string;
        cover: string;
        columnCount: number;
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

    return (
        <div>
            <h1>All Newspapers</h1>
            <Space style={{ marginBottom: 16 }}>
                <Button type="primary" onClick={() => router.push("/newspapers/create")}>
                    Create Newspaper
                </Button>
            </Space>
            <Table {...tableProps} rowKey="id">
                <Table.Column title="ID" dataIndex="id" />
                <Table.Column title="Name" dataIndex="name" />
                <Table.Column title="Cover" dataIndex="cover" render={(photo: string) => <img src={photo} alt="newspaper" width={50} height={50} />} />
                <Table.Column title="Column Count" dataIndex="columnCount" />
                <Table.Column title="Font Family" dataIndex="fontFamily" />
                <Table.Column title="Height" dataIndex="height" />
                <Table.Column
                    title={"Issues"}
                    dataIndex="issues"
                    render={(_, record: BaseRecord) => JSON.stringify(record.issues)}
                />
                <Table.Column
                    title="Actions"
                    dataIndex="actions"
                    render={(_, record: BaseRecord) => (
                        <Space>
                            <EditButton hideText size="small" recordItemId={record.id} />
                            <ShowButton hideText size="small" recordItemId={record.id} />
                            <DeleteButton hideText size="small" recordItemId={record.id} />
                        </Space>
                    )}
                />
            </Table>
        </div>
    );
}
