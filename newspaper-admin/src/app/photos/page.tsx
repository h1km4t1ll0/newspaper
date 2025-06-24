"use client";

import { RoleContext } from "@app/RefineApp";
import UploadImage from "@components/Upload";
import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import MDEditor from "@uiw/react-md-editor";
import { Space, Table } from "antd";
import { useContext } from "react";

const relationsQuery = {
  populate: {
    article: {
      populate: "*",
    },
    photo: {
      populate: "*",
    },
    issue: {
      populate: "*",
    },
  },
};

type ArticleType = {
  name: string;
  text: string;
};

export default function BlogPostList() {
  const role = useContext(RoleContext);
  const { tableProps, filters } = useTable<
    {
      name: string;
      width: number;
      height: number;
      photo: string;
      article: ArticleType;
      createdAt: Date;
      updatedAt: Date;
      id: number | string;
    }[]
  >({
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

  return (
    <List
      createButtonProps={{
        hidden: !(role === "Authenticated" || role === "Photographer"),
      }}
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={"ID"} />
        <Table.Column dataIndex="name" title={"Name"} />
        <Table.Column
          title={"Issue"}
          dataIndex="issue"
          render={(_, record: BaseRecord) => {
            return record.issue?.name || "-";
          }}
        />
        <Table.Column 
          dataIndex="width" 
          title={"Width"} 
          render={(value) => {
            if (value === null || value === undefined || value === '') return '-';
            return `${value}px`;
          }}
        />
        <Table.Column 
          dataIndex="height" 
          title={"Height"} 
          render={(value) => {
            if (value === null || value === undefined || value === '') return '-';
            return `${value}px`;
          }}
        />
        <Table.Column
          dataIndex="photo"
          title={"Photo"}
          render={(value: any) =>
            value ? (
              <UploadImage
                value={{
                  url: value?.url,
                  id: value?.id,
                  fileName: `${value?.hash}${value?.ext}`,
                  type: value?.mime?.split("/")[0],
                  ext: value?.ext.replace(".", ""),
                }}
                index={0}
              />
            ) : (
              "-"
            )
          }
        />
        <Table.Column
          title={"Article"}
          dataIndex="article"
          render={(_, record: BaseRecord) => {
            const article = record.article;
            if (!article) return "-";
            
            return (
              <div 
                data-color-mode="light" 
                style={{ 
                  maxWidth: "300px",
                  maxHeight: "200px",
                  overflow: "auto",
                  border: "1px solid #f0f0f0",
                  borderRadius: "4px"
                }}
              >
                <MDEditor.Markdown
                  source={
                    typeof article.text === "string"
                      ? article.text
                      : JSON.stringify(article.text)
                  }
                  style={{
                    backgroundColor: "transparent",
                    padding: "10px",
                  }}
                />
              </div>
            );
          }}
        />
        <Table.Column
          title={"Actions"}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              {(role === "Authenticated" || role === "Photographer") && (
                <EditButton hideText size="small" recordItemId={record.id} />
              )}
              {(role === "Authenticated" || role === "Photographer") && (
                <DeleteButton hideText size="small" recordItemId={record.id} />
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
