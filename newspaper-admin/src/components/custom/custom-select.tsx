import {type FC, ReactNode, useState } from "react";
import {Form, Select} from "antd";
import { useSelect} from "@refinedev/antd";
import type { Rule } from "antd/es/form";
import type { CrudFilter, MetaQuery } from "@refinedev/core";
import type { NamePath, StoreValue } from "antd/es/form/interface";

type Props = {
  resource: string;
  name?: NamePath<any>;
  label?: string;
  mode?: "multiple" | "tags";
  optionLabel?: string | ((item: any) => string);
  optionValue?: string | ((item: any) => string);
  rules?: Rule[];
  meta?: MetaQuery;
  placeholder?: ReactNode;
  filters?: CrudFilter[];
  onChange?: (value: any, option: any | any[]) => void;
  getValueProps?: (value: StoreValue) => Record<string, unknown>;
  value?: any;
};

const CustomSelect: FC<Props> = ({
                                   resource,
                                   optionLabel,
                                   optionValue,
                                   label,
                                   name,
                                   mode,
                                   rules,
                                   meta,
                                   filters,
                                   placeholder,
                                   onChange,
                                   value,
                                   getValueProps,
                                 }) => {
  const [pageSize, setPageSize] = useState<number>(20);

  const { selectProps, query } = useSelect({
    resource,
    meta,
    filters,
    optionLabel: optionLabel as any,
    optionValue: optionValue as any,
    pagination: { pageSize, mode: "server" },
  });

  const handleScroll = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const target = event.target as HTMLDivElement;
    if (
      target.scrollTop + target.clientHeight >= target.scrollHeight - 50 &&
      query.data?.total &&
      query.data.total > pageSize &&
      !query.isFetching
    ) {
      setPageSize((prev) => prev + 20);
    }
  };

  return (
    <Form.Item label={label} name={name} rules={rules} getValueProps={getValueProps}>
      <Select
        {...selectProps}
        onPopupScroll={handleScroll}
        mode={mode}
        placeholder={placeholder}
        onChange={onChange}
        style={{ minWidth: "180px" }}
        value={value}
      />
    </Form.Item>
  );
};

export default CustomSelect;
