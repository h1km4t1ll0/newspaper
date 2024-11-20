"use client";

import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  MarkdownField,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Table } from "antd";
import ContentEditor from "@app/newspaper/ContentEditor";

export default function BlogPostList() {

  return (
   <ContentEditor/>
  );
}
