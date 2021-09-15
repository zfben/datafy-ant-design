import React from 'react'
import { Typography } from 'antd'
import { isNil } from 'lodash'

export function DatafyEmpty (options?: {
  value?: any;
  text?: string;
}) {
  return !options || isNil(options.value) || (Array.isArray(options.value) && !options.value.length) || options.value === '' ? <Typography.Text disabled>{options?.text || '空'}</Typography.Text> : options.value
}
