"use client";

import {DeleteButton, EditButton, List, ShowButton, useTable,} from "@refinedev/antd";
import {type BaseRecord, useCustom} from "@refinedev/core";
import {Space, Table} from "antd";
import UploadImage from "@components/Upload";
import React, {useContext} from "react";
import {RoleContext} from "@app/RefineApp";
import {API_URL} from "@utility/constants";
import qs from "qs";
import MDEditor from '@uiw/react-md-editor';

const relationsQuery = {
  populate: {
    article: {
      populate: "*",
    },
    photo: {
      populate: '*'
    }
  },
};

type ArticleType = {
  name: string,
  text: JSON,
}

const query = qs.stringify(
  {
    fields: '*',
    populate: {
      photos: {
        fields: '*',
        populate: {
          photo: {
            fields: '*',
          },
        },
      },
    },
  },
  {
    encodeValuesOnly: true, // prettify URL
  }
);

export default function BlogPostList() {
  const role = useContext(RoleContext);
  const {tableProps, filters} = useTable<{
    name: string,
    width: number,
    height: number,
    photo: string,
    article: ArticleType,
    createdAt: Date,
    updatedAt: Date,
    id: number | string,
  }[]>({
    syncWithLocation: true,
    meta: relationsQuery,
    sorters: {
      initial: [
        {
          field: 'id',
          order: 'desc',
        },
      ],
    },
  });

  const {refetch, data} = useCustom<{
    data: {
      id: number,
      attributes: {
        id: number,
        text: any,
        name: string,
        photos: {
          data: [{
            id: number,
            attributes: {
              name: string,
              width: number,
              height: number,
              createdAt: string,
              updatedAt: string,
              photo: {
                data: {
                  attributes: {
                    url: string,
                  },
                },
              },
            },
          }],
        },
      },
    }[],
  }>({
    url: `${API_URL}/api/articles?${query}`,
    method: "get",
  });

  return (
    <List createButtonProps={{hidden: !(role === 'Authenticated' || role === 'Photographer')}}>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={"ID"}/>
        <Table.Column dataIndex="width" title={"Width"}/>
        <Table.Column dataIndex="height" title={"Height"}/>
        <Table.Column
          dataIndex='photo'
          title={'Photo'}
          render={
            (value: any) => value ? (
              <UploadImage value={{
                url: value?.url,
                id: value?.id,
                fileName: `${value?.hash}${value?.ext}`,
                type: value?.mime?.split('/')[0],
                ext: value?.ext.replace('.', ''),
              }} index={0}/>
            ) : '-'
          }
        />
        {(role === 'Authenticated' || role === 'Writer') && <Table.Column
            title={"Article"}
            dataIndex="article"
            render={(_, record: BaseRecord) => {
              const val = data?.data.data.find((value) => value.id == record.id)?.attributes
              return (
                <div data-color-mode="light">
                  <MDEditor.Markdown 
                    source={typeof val?.text === "string" ? val.text : JSON.stringify(val?.text)} 
                    style={{ 
                      backgroundColor: 'transparent',
                      padding: '10px'
                    }}
                  />
                </div>
              )
            }}
        />}
        <Table.Column
          title={"Actions"}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              {(role === 'Authenticated' || role === 'Photographer') && <EditButton hideText size="small" recordItemId={record.id}/>}
              <ShowButton hideText size="small" recordItemId={record.id}/>
              {(role === 'Authenticated' || role === 'Photographer') && <DeleteButton hideText size="small" recordItemId={record.id}/>}
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
