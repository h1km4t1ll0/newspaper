"use client";

import {DeleteButton, EditButton, List, ShowButton, useTable,} from "@refinedev/antd";
import {type BaseRecord, useCustom} from "@refinedev/core";
import {Space, Table} from "antd";
import UploadImage from "@components/Upload";
import React, {useCallback, useContext, useMemo} from "react";
import {RoleContext} from "@app/RefineApp";
import ContentEditor from "@components/editor-js/ContentEditor";
import {API_URL} from "@utility/constants";
import {axiosInstance} from "@utility/axios-instance";
import qs from "qs";

const relationsQuery = {
  populate: {
    photos: {
      populate: "*",
    },
    text: '*'
  },
};

type PhotoType = {
  name: string,
  width: number,
  height: number,
  photo: URL,
};

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

  const { refetch, data } = useCustom<{
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

  // const data = useMemo(async () => {return await refetch()}, [refetch])

  const {tableProps} = useTable<{
    name: string,
    photos: PhotoType[],
    text: JSON,
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

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={"ID"}/>
        <Table.Column dataIndex="name" title={"Name"}/>

        {(role === 'Authenticated' || role === 'Photographer') && <Table.Column
          width="200px"
          title={"Photos"}
          dataIndex="photos"
          render={(_, record: BaseRecord) => record.photos ? record.photos?.map((value) => {
            if (!value) {
              return
            }

            return (
              <UploadImage value={{
                url: value?.url,
                id: value?.id,
                fileName: `${value?.hash}${value?.ext}`,
                type: value?.mime?.split('/')[0],
                ext: value?.ext?.replace('.', ''),
              }} index={0}/>
            )
          }).filter(Boolean) : '-'}
        />}
        <Table.Column dataIndex="text" title={"Text"} render={(_, record: BaseRecord) => {

          console.log(record, 'record')
          const val = data?.data.data.find((value) => value.id == record.id)?.attributes
          return <ContentEditor
            readOnly
            value={typeof val.text === "string" ? null : val.text}
          />

        }}/>
        <Table.Column
          title={"Actions"}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              {(role === 'Authenticated' || role === 'Writer') && <EditButton hideText size="small" recordItemId={record.id}/>}
              <ShowButton hideText size="small" recordItemId={record.id}/>
              {(role === 'Authenticated' || role === 'Writer') && <DeleteButton hideText size="small" recordItemId={record.id}/>}
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
