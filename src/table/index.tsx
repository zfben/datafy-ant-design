import React from 'react'
import { DatafyType } from '..'
import {
  Button,
  Empty, Input, Radio, Space, Table
} from 'antd'
import { ColumnType } from 'antd/lib/table'
import {
  CheckOutlined, CloseOutlined, FilterFilled, SearchOutlined
} from '@ant-design/icons'
import { DatafyEmpty } from '../empty'
import { uniq, uniqBy } from 'lodash'
import dayjs from 'dayjs'

type BaseRow = {
  [key: string]: any
}

export type DatafyTableColumnProps<TRow extends BaseRow = any> = {
  key: string
  title?: string
  type?: DatafyType
  filters?: {
    text: string
    value: any
  }[]
  defaultSortOrder?: 'ascend' | 'descend'
  width?: number
  fixed?: 'left' | 'right' | boolean
  onFilter?(value: any, record: TRow) : boolean
  rowClassName?(record: TRow, index: number) : string
  render?(value: any, record: any, index: number): JSX.Element | string | null
  children?: DatafyTableColumnProps<TRow>[]
}

export type DatafyTableProps<TRow = any> = {
  rowKey?: string
  rowSelection?: {
    type: 'checkbox' | 'radio'
    onChange?: (selectedRowKeys: (string | number)[], selectedRows: TRow[]) => void
  }
  columns: (DatafyTableColumnProps<TRow> | undefined)[]
  dataSource: TRow[]
  style?: React.CSSProperties
  scroll?: any
  rowClassName?(record: TRow, index: number) : string
  rowWidth?: number
  remoteAction?: string
  expandable?: {
    defaultExpandAllRows?: boolean
    expandRowByClick?: boolean
    expandedRowRender: (
      record: TRow,
      index: number,
      indent: number,
      expanded: boolean
    ) => React.ReactNode
  }
  pagination?: false
  loading?: boolean
}

function processColumnProps<TRow extends BaseRow = any> (
  column: (ColumnType<TRow> & DatafyTableColumnProps<TRow>),
  rowWidth: number | undefined,
  dataSource: TRow[]) {
  column.dataIndex = column.key
  if (!column.title) column.title = column.key
  if (!column.type) column.type = 'string'
  if (!column.width) column.width = rowWidth || 200

  switch (column.type) {
    case 'number':
      column.sorter = (a: any, b: any) => (a[column.key] || 0) - (b[column.key] || 0)
      if (!column.render) column.render = (v: number | undefined) => <DatafyEmpty value={ v } />
      break
    case 'boolean':
      if (!column.render) column.render = (v: boolean) => (typeof v === 'undefined' ? <DatafyEmpty /> : v ? <CheckOutlined /> : <CloseOutlined />)
      if (!column.filterDropdown) column.filterDropdown = ({
        setSelectedKeys,
        selectedKeys,
        confirm
      }: {
        setSelectedKeys: (selectedKeys: React.Key[]) => void;
        selectedKeys: React.Key[];
        confirm(): void;
        clearFilters(): void;
      }) => (
        <Radio.Group
          style={ { padding: 8 } }
          buttonStyle='solid'
          value={ selectedKeys[0] }
          onChange={ e => {
            console.log(e.target.value)
            setSelectedKeys(e.target.value ? [e.target.value] : [])
            confirm()
          } }
        >
          <Radio.Button>全部</Radio.Button>
          <Radio.Button value={ 'true' }><CheckOutlined /></Radio.Button>
          <Radio.Button value={ 'false' }><CloseOutlined /></Radio.Button>
          <Radio.Button value={ 'empty' }><DatafyEmpty /></Radio.Button>
        </Radio.Group>
      )
      if (!column.onFilter) column.onFilter = (value: string | number | boolean, record: any) => {
        switch (value) {
          case 'true':
            return record[column.key] === true
          case 'false':
            return record[column.key] === false
          case 'empty':
            return typeof record[column.key] === 'undefined'
          default:
            return true
        }
      }
      break
    case 'money':
      column.sorter = (a: any, b: any) => (a[column.key] || 0) - (b[column.key] || 0)
      if (!column.render) column.render = (v: number | undefined) => (v ? `￥${v.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,').replace('.00', '')}` : <DatafyEmpty />)
      break
    case 'percent':
      column.sorter = (a: any, b: any) => (a[column.key] || 0) - (b[column.key] || 0)
      if (!column.render) column.render = (v: number | undefined) => (v !== undefined ? `${v.toFixed(2)}%` : <DatafyEmpty />)
      break
    case 'time':
      column.sorter = (a: any, b: any) => {
        if (!a[column.key]) return -1
        if (!b[column.key]) return 1
        return dayjs(a[column.key]).isBefore(dayjs(b[column.key])) ? -1 : 1
      }
      if (!column.render) column.render = (v: string | undefined) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : <DatafyEmpty />)
      break
    case 'image':
      if (!column.render) column.render = (v: string | undefined) => (v ? <img
        src={ v }
        style={ { width: '4rem' } } /> : <DatafyEmpty />)
      break
    case 'image[]':
      if (!column.render)
        column.render = (v: string[] | undefined) => (v?.length ?
          <>{v.map((url: string, i: number) => <img
            key={ i }
            src={ url }
            style={ {
              display: 'block',
              float: 'left',
              width: '4rem'
            } } />)}</> :
          <DatafyEmpty />)
      break
    case 'string[]':
      if (!column.render) column.render = (v: string[] | undefined) => (v?.length ? v.join(',') : <DatafyEmpty />)
      if (!column.filters) {
        const filters = uniq(dataSource.map(d => d[column.key]))
        if (filters.length < 30)
          column.filters = filters.map((r: any) => {
            if (!r) return {
              text: <DatafyEmpty />,
              value: r
            }
            return {
              value: r,
              text: r
            }
          })
      }
      if (!column.onFilter) column.onFilter = (value: string | number | boolean, record: any) => (value === null ? record[column.key].length === 0 : record[column.key].join('').includes(value))
      if (!column.filterDropdown) column.filterDropdown = function ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters
      }: {
        setSelectedKeys: (selectedKeys: React.Key[]) => void;
        selectedKeys: React.Key[];
        confirm(): void;
        clearFilters(): void;
      }) {
        return <div style={ { padding: 8 } }>
          <Input
            value={ selectedKeys[0] }
            onChange={ e => {
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            } }
            onPressEnter={ confirm }
            style={ {
              width: 188,
              marginBottom: 8,
              display: 'block'
            } }
          />
          <Space>
            <Button
              type="primary"
              icon={ <SearchOutlined /> }
              size="small"
              style={ { width: 90 } }
              onClick={ ()=> confirm() }
            >
              搜索
            </Button>
            <Button
              size="small"
              style={ { width: 90 } }
              onClick={ () => clearFilters() }
            >
              清空
            </Button>
          </Space>
        </div>
      }
      if (!column.filterIcon) column.filterIcon = function (filtered: boolean) {
        return <FilterFilled style={ { color: filtered ? '#1890ff' : undefined } } />
      }
      break
    case 'string':
      if (!column.render) column.render = (v: string[] | undefined) => <DatafyEmpty value={ v } />
      if (!column.filters) {
        const filters = uniqBy(dataSource, column.key)
        if (filters.length < 30)
          column.filters = filters.map((r: any) => {
            const value = r[column.key]
            if (!value) return {
              text: <DatafyEmpty />,
              value: 'empty'
            }
            return {
              value,
              text: value
            }
          })
      }

      if (column.filters && column.filters.length) break

      column.filterDropdown = function ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters
      }: {
        setSelectedKeys: (selectedKeys: React.Key[]) => void;
        selectedKeys: React.Key[];
        confirm(): void;
        clearFilters(): void;
      }) {
        return <div style={ { padding: 8 } }>
          <Input
            value={ selectedKeys[0] }
            onChange={ e => {
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            } }
            onPressEnter={ confirm }
            style={ {
              width: 188,
              marginBottom: 8,
              display: 'block'
            } }
          />
          <Space>
            <Button
              type="primary"
              icon={ <SearchOutlined /> }
              size="small"
              style={ { width: 90 } }
              onClick={ ()=> confirm() }
            >
              搜索
            </Button>
            <Button
              size="small"
              style={ { width: 90 } }
              onClick={ () => clearFilters() }
            >
              清空
            </Button>
          </Space>
        </div>
      }
      column.filterIcon = function (filtered: boolean) {
        return <FilterFilled style={ { color: filtered ? '#1890ff' : undefined } } />
      }
      if (!column.onFilter) column.onFilter = (value: string | number | boolean, record: TRow) => (value === 'empty' ? typeof record[column.key] === 'undefined' : String(record[column.key]).toLowerCase().includes(String(value).toLowerCase()))
  }

  if (column.filters && !column.onFilter) column.onFilter = (value: string | number | boolean, record: TRow) => (value === 'empty' ? (typeof record[column.key] === 'undefined' || record[column.key] === null) : record[column.key] === value)

  return column
}

export function DatafyTable<TRow extends BaseRow = any> (props: DatafyTableProps): JSX.Element {
  const [totalWidth, setTotalWidth] = React.useState<number>()
  const [tableColumns, setTableColumns] = React.useState<DatafyTableColumnProps<TRow>[]>()
  const [bordered, setBordered] = React.useState(false)

  if (!props.rowKey) props.rowKey = 'id'
  if (!props.style) props.style = {}

  React.useEffect(function () {
    if (!props.dataSource?.length) return

    let width = 0

    for (const column of props.columns as (ColumnType<TRow> & DatafyTableColumnProps<TRow>)[]) {
      if (!column) continue
      if (column.children) {
        column.title = column.key
        column.children.map(c => processColumnProps(c, props.rowWidth, props.dataSource))
        if (!bordered) setBordered(true)
      } else
        processColumnProps(column, props.rowWidth, props.dataSource)

      width += column.width || 0
    }
    if (typeof props.columns[0] === 'undefined')
      (props.columns[0] as DatafyTableColumnProps).fixed = 'left'

    setTotalWidth(width)
    setTableColumns(props.columns.filter(c => c) as DatafyTableColumnProps<TRow>[])
  }, [props.dataSource])

  if (!tableColumns?.length) return <Empty />

  return <Table<TRow>
    loading={ props.loading }
    rowClassName={ props.rowClassName }
    style={ props.style }
    rowKey={ props.rowKey }
    rowSelection={ props.rowSelection }
    size='small'
    bordered={ bordered }
    columns={ tableColumns }
    dataSource= { props.dataSource }
    scroll={ Object.assign({
      x: totalWidth,
      y: '80vh'
    }, scroll) }
    pagination={ typeof props.pagination !== 'undefined' ? props.pagination : {
      pageSize: 50,
      showTotal: (total, range) => `共 ${total} 条，第 ${range[0]}-${range[1]} 条`,
      showSizeChanger: false
    } }
    expandable={ props.expandable }
  />
}
